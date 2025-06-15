import { Request } from 'express';
import { format, subDays } from 'date-fns';
import {
  isAnswer,
  isCollection,
  isPost,
  isTag,
  MaybeAnswer,
  MaybeCollection,
  MaybePost,
  MaybeTag,
} from '../database/QetaStore';
import { Config } from '@backstage/config';
import { S3Client } from '@aws-sdk/client-s3';
import { RouteOptions } from './types';
import {
  AnswerResponse,
  CollectionResponse,
  Comment,
  PostResponse,
  qetaDeleteAnswerPermission,
  qetaDeleteCollectionPermission,
  qetaDeleteCommentPermission,
  qetaDeletePostPermission,
  qetaDeleteTagPermission,
  qetaEditAnswerPermission,
  qetaEditCollectionPermission,
  qetaEditCommentPermission,
  qetaEditPostPermission,
  qetaEditTagPermission,
  TagResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { HttpsProxyAgent } from 'hpagent';
import { compact } from 'lodash';
import {
  ConditionTransformer,
  createConditionTransformer,
} from '@backstage/plugin-permission-node';
import { rules } from '@drodil/backstage-plugin-qeta-node';
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { BackstageCredentials } from '@backstage/backend-plugin-api';
import { PermissionManager } from './PermissionManager.ts';

export const getCreated = async (
  req: Request<unknown>,
  options: RouteOptions,
): Promise<Date> => {
  const allowMetadataInput = options.config.getOptionalBoolean(
    'qeta.allowMetadataInput',
  );

  if (allowMetadataInput && req.body.created) {
    return new Date(req.body.created);
  }

  return new Date();
};

export type QetaFilter = {
  property:
    | 'posts.id'
    | 'posts.author'
    | 'posts.type'
    | 'tags'
    | 'entityRefs'
    | 'answers.id'
    | 'answers.author'
    | 'comments.id'
    | 'comments.author'
    | 'tags.tag'
    | 'tag.experts'
    | 'collections.owner'
    | 'collections.id';
  values: Array<string | undefined>;
};

export type QetaFilters =
  | { anyOf: QetaFilter[] }
  | { allOf: QetaFilter[] }
  | { not: QetaFilter }
  | QetaFilter;

export const transformConditions: ConditionTransformer<QetaFilters> =
  createConditionTransformer(Object.values(rules));

const mapTagAdditionalFields = async (
  request: Request<unknown>,
  resource: TagResponse,
  permissionMgr: PermissionManager,
  credentials: BackstageCredentials,
  checkRights?: boolean,
) => {
  const [canEdit, canDelete] = await Promise.all([
    checkRights
      ? permissionMgr.authorizeBoolean(request, qetaEditTagPermission, {
          resource,
          credentials,
        })
      : undefined,
    checkRights
      ? permissionMgr.authorizeBoolean(request, qetaDeleteTagPermission, {
          resource,
          credentials,
        })
      : undefined,
  ]);

  resource.canEdit = canEdit;
  resource.canDelete = canDelete;
  return resource;
};

const mapCollectionAdditionalFields = async (
  request: Request<unknown>,
  resource: CollectionResponse,
  permissionMgr: PermissionManager,
  credentials: BackstageCredentials,
  checkRights?: boolean,
) => {
  const [canEdit, canDelete] = await Promise.all([
    checkRights
      ? permissionMgr.authorizeBoolean(request, qetaEditCollectionPermission, {
          resource,
          credentials,
        })
      : undefined,
    checkRights
      ? permissionMgr.authorizeBoolean(
          request,
          qetaDeleteCollectionPermission,
          {
            resource,
            credentials,
          },
        )
      : undefined,
  ]);

  resource.canEdit = canEdit;
  resource.canDelete = canDelete;
  return resource;
};

const mapResourceComments = async (
  request: Request<unknown>,
  resource: AnswerResponse | PostResponse,
  permissionMgr: PermissionManager,
  credentials: BackstageCredentials,
  username: string,
  checkRights?: boolean,
) => {
  const commentArr = resource.comments ?? [];
  const editPermissions = await Promise.all(
    commentArr.map(async (c: Comment) => {
      if (!checkRights) {
        return undefined;
      }
      return permissionMgr.authorizeBoolean(
        request,
        qetaEditCommentPermission,
        { resource: c, credentials },
      );
    }),
  );

  const deletePermissions = await Promise.all(
    commentArr.map(async (c: Comment) => {
      if (!checkRights) {
        return undefined;
      }
      return permissionMgr.authorizeBoolean(
        request,
        qetaDeleteCommentPermission,
        { resource: c, credentials },
      );
    }),
  );

  const comments: (Comment | null)[] = commentArr.map(
    (c: Comment, index): Comment => {
      return {
        ...c,
        own: c.author === username,
        expert: c.experts?.includes(c.author),
        canEdit: editPermissions[index],
        canDelete: deletePermissions[index],
      };
    },
  );
  return compact(comments);
};

const mapAnswerAdditionalFields = async (
  request: Request<unknown>,
  resource: AnswerResponse,
  permissionMgr: PermissionManager,
  credentials: BackstageCredentials,
  username: string,
  checkRights?: boolean,
) => {
  const [canEdit, canDelete, comments] = await Promise.all([
    checkRights
      ? permissionMgr.authorizeBoolean(request, qetaEditAnswerPermission, {
          resource,
          credentials,
        })
      : undefined,
    checkRights
      ? permissionMgr.authorizeBoolean(request, qetaDeleteAnswerPermission, {
          resource,
          credentials,
        })
      : undefined,
    mapResourceComments(
      request,
      resource,
      permissionMgr,
      credentials,
      username,
      checkRights,
    ),
  ]);

  resource.ownVote = resource.votes?.find(v => v.author === username)?.score;
  resource.own = resource.author === username;
  resource.canEdit = canEdit;
  resource.canDelete = canDelete;
  resource.expert = resource.experts?.includes(resource.author);
  resource.comments = comments;

  return resource;
};

const mapPostAdditionalFields = async (
  request: Request<unknown>,
  resource: PostResponse,
  permissionMgr: PermissionManager,
  credentials: BackstageCredentials,
  username: string,
  checkRights?: boolean,
) => {
  resource.ownVote = resource.votes?.find(v => v.author === username)?.score;
  resource.own = resource.author === username;

  const [canEdit, canDelete, answers, comments] = await Promise.all([
    checkRights
      ? permissionMgr.authorizeBoolean(request, qetaEditPostPermission, {
          resource,
          credentials,
        })
      : undefined,
    checkRights
      ? permissionMgr.authorizeBoolean(request, qetaDeletePostPermission, {
          resource,
          credentials,
        })
      : undefined,
    Promise.all(
      (resource.answers ?? []).map(async a =>
        mapAnswerAdditionalFields(
          request,
          a,
          permissionMgr,
          credentials,
          username,
          checkRights,
        ),
      ),
    ),
    mapResourceComments(
      request,
      resource,
      permissionMgr,
      credentials,
      username,
      checkRights,
    ),
  ]);
  resource.canEdit = canEdit;
  resource.canDelete = canDelete;
  resource.answers = answers;
  resource.comments = comments;
  return resource;
};

export const mapAdditionalFields = async (
  request: Request<unknown>,
  resource: MaybePost | MaybeAnswer | MaybeTag | MaybeCollection,
  routeOpts: RouteOptions,
  options?: {
    checkRights?: boolean;
    creds?: BackstageCredentials;
    username?: string;
  },
) => {
  if (!resource) {
    return resource;
  }

  const { creds, username, checkRights = true } = options ?? {};
  const { permissionMgr } = routeOpts;
  const credentials =
    creds ?? (await permissionMgr.getCredentials(request, true));

  if (isTag(resource)) {
    return mapTagAdditionalFields(
      request,
      resource,
      permissionMgr,
      credentials,
      checkRights,
    );
  } else if (isCollection(resource)) {
    return mapCollectionAdditionalFields(
      request,
      resource,
      permissionMgr,
      credentials,
      checkRights,
    );
  }

  const user =
    username ??
    (await routeOpts.permissionMgr.getUsername(request, true, credentials));

  if (isPost(resource)) {
    return mapPostAdditionalFields(
      request,
      resource,
      permissionMgr,
      credentials,
      user,
      checkRights,
    );
  } else if (isAnswer(resource)) {
    return mapAnswerAdditionalFields(
      request,
      resource,
      permissionMgr,
      credentials,
      user,
      checkRights,
    );
  }

  return resource;
};

export const stringDateTime = (dayString: string) => {
  const dateTimePeriod = Number(dayString.toString().slice(0, -1));
  return format(subDays(new Date(), dateTimePeriod), 'yyyy-MM-dd');
};

export const getS3Client = (config: Config) => {
  const accessKeyId = config.getOptionalString('qeta.storage.accessKeyId');
  const secretAccessKey = config.getOptionalString(
    'qeta.storage.secretAccessKey',
  );
  const region = config.getOptionalString('qeta.storage.region');
  const sessionToken = config.getOptionalString('qeta.storage.sessionToken');
  const endpoint = config.getOptionalString('qeta.storage.endpoint');
  const httpsProxy = config.getOptionalString('qeta.storage.httpsProxy');
  const forcePathStyle = config.getOptionalBoolean(
    'qeta.storage.forcePathStyle',
  );
  const maxAttempts = config.getOptionalNumber('qeta.storage.maxAttempts');

  let credentials;
  if (accessKeyId && secretAccessKey) {
    credentials = {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    };
  }
  return new S3Client({
    customUserAgent: 'backstage-aws-drodil-qeta-s3-storage',
    ...(credentials && { credentials }),
    ...(region && { region }),
    ...(endpoint && { endpoint }),
    ...(forcePathStyle && { forcePathStyle }),
    ...(maxAttempts && { maxAttempts }),
    ...(httpsProxy && {
      requestHandler: new NodeHttpHandler({
        httpsAgent: new HttpsProxyAgent({ proxy: httpsProxy }),
      }),
    }),
  });
};

export const getAzureBlobServiceClient = (config: Config) => {
  const accountName = config.getOptionalString(
    'qeta.storage.blobStorageAccountName',
  );
  const connectionString = config.getOptionalString(
    'qeta.storage.blobStorageConnectionString',
  );
  if (connectionString) {
    return BlobServiceClient.fromConnectionString(connectionString);
  } else if (accountName) {
    return new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential(),
    );
  }

  throw new Error(
    'Either account name or connection string must be provided for Azure Blob Storage',
  );
};

export class ExpiryMap<K, V> extends Map<K, V> {
  #ttlMs: number;
  #timestamps: Map<K, number> = new Map();

  constructor(ttlMs: number) {
    super();
    this.#ttlMs = ttlMs;
  }

  set(key: K, value: V) {
    const result = super.set(key, value);
    this.#timestamps.set(key, new Date().getTime());
    this.clearOld();
    return result;
  }

  get(key: K) {
    this.clearOld();
    if (!this.has(key)) {
      return undefined;
    }
    return super.get(key);
  }

  delete(key: K) {
    this.#timestamps.delete(key);
    return super.delete(key);
  }

  clear() {
    this.#timestamps.clear();
    return super.clear();
  }

  clearOld() {
    const now = new Date().getTime();
    this.#timestamps.forEach((val, key) => {
      if (now - val > this.#ttlMs) {
        this.#timestamps.delete(key);
        super.delete(key);
      }
    });
  }
}
