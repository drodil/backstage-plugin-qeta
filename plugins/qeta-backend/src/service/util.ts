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
  Comment,
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

export const mapAdditionalFields = async (
  request: Request<unknown>,
  resource: MaybePost | MaybeAnswer | MaybeTag | MaybeCollection,
  routeOpts: RouteOptions,
  options?: {
    checkRights?: boolean;
    creds?: BackstageCredentials;
    experts?: string[];
  },
) => {
  if (!resource) {
    return resource;
  }

  const { creds, experts, checkRights = true } = options ?? {};
  const { permissionMgr } = routeOpts;
  const credentials =
    creds ?? (await permissionMgr.getCredentials(request, true));

  if (isCollection(resource) || isTag(resource)) {
    resource.canEdit = checkRights
      ? await permissionMgr.authorizeBoolean(
          request,
          isCollection(resource)
            ? qetaEditCollectionPermission
            : qetaEditTagPermission,
          { resource, credentials },
        )
      : undefined;
    resource.canDelete = checkRights
      ? await permissionMgr.authorizeBoolean(
          request,
          isCollection(resource)
            ? qetaDeleteCollectionPermission
            : qetaDeleteTagPermission,
          {
            resource,
            credentials,
          },
        )
      : undefined;
    return resource;
  }

  const username = await routeOpts.permissionMgr.getUsername(
    request,
    true,
    credentials,
  );

  let resourceExperts: string[] | undefined = experts;
  if (isPost(resource) && resource.tags) {
    resourceExperts = await routeOpts.database.getTagExperts(resource.tags);
  } else if (isAnswer(resource)) {
    resource.expert = resourceExperts?.includes(resource.author);
  }

  resource.ownVote = resource.votes?.find(v => v.author === username)?.score;
  resource.own = resource.author === username;
  resource.canEdit = checkRights
    ? await permissionMgr.authorizeBoolean(
        request,
        isPost(resource) ? qetaEditPostPermission : qetaEditAnswerPermission,
        { resource, credentials },
      )
    : undefined;
  resource.canDelete = checkRights
    ? await permissionMgr.authorizeBoolean(
        request,
        isPost(resource)
          ? qetaDeletePostPermission
          : qetaDeleteAnswerPermission,
        { resource, credentials },
      )
    : undefined;

  if (isPost(resource)) {
    await Promise.all(
      (resource.answers ?? []).map(
        async a =>
          await mapAdditionalFields(request, a, routeOpts, {
            checkRights,
            creds: credentials,
            experts: resourceExperts,
          }),
      ),
    );
  }

  const comments: (Comment | null)[] = await Promise.all(
    (resource.comments ?? []).map(
      async (c: Comment): Promise<Comment | null> => {
        return {
          ...c,
          own: c.author === username,
          expert: resourceExperts?.includes(c.author),
          canEdit: checkRights
            ? await permissionMgr.authorizeBoolean(
                request,
                qetaEditCommentPermission,
                { resource: c, credentials },
              )
            : undefined,
          canDelete: checkRights
            ? await permissionMgr.authorizeBoolean(
                request,
                qetaDeleteCommentPermission,
                { resource: c, credentials },
              )
            : undefined,
        };
      },
    ),
  );
  resource.comments = compact(comments);
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
