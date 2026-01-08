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
  Answer,
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
  selectByPostType,
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
import { stringifyEntityRef } from '@backstage/catalog-model';

export const getResourceUrl = (
  resource: MaybePost | MaybeAnswer | MaybeTag | MaybeCollection,
  config: Config,
  absolute?: boolean,
) => {
  if (!resource) {
    return undefined;
  }
  const basePath = (
    config.getOptionalString('qeta.route') ?? 'qeta'
  ).replaceAll(/(^\/+)|(\/+$)/g, '');
  const baseUrl = absolute
    ? `${config.getOptionalString('app.baseUrl') ?? ''}/${basePath}`
    : `/${basePath}`;

  if (isTag(resource)) {
    return `${baseUrl}/tags/${resource.tag}`;
  } else if (isCollection(resource)) {
    return `${baseUrl}/collection/${resource.id}`;
  } else if (isAnswer(resource)) {
    return `${baseUrl}/questions/${resource.postId}#answer_${resource.id}`;
  } else if (isPost(resource)) {
    const questionRoute = `${baseUrl}/questions/${resource.id}`;
    const articleRoute = `${baseUrl}/articles/${resource.id}`;
    const linkRoute = `${baseUrl}/links/${resource.id}`;
    return selectByPostType(
      resource.type,
      questionRoute,
      articleRoute,
      linkRoute,
    );
  }
  return undefined;
};

/**
 * Filter entity refs based on catalog permissions.
 * Uses catalogApi.getEntitiesByRefs which automatically filters out entities
 * the user doesn't have permission to see.
 */
const filterEntitiesByPermissions = async (
  entityRefs: string[] | undefined,
  routeOpts: RouteOptions,
  credentials: BackstageCredentials,
): Promise<string[] | undefined> => {
  if (!entityRefs || entityRefs.length === 0) {
    return entityRefs;
  }

  try {
    // Get a plugin token on behalf of the user to call the catalog
    const { token } = await routeOpts.auth.getPluginRequestToken({
      onBehalfOf: credentials,
      targetPluginId: 'catalog',
    });

    // catalogApi.getEntitiesByRefs handles permission checks automatically
    // It only returns entities the user has permission to see
    const entities = await routeOpts.catalog.getEntitiesByRefs(
      { entityRefs },
      { token },
    );

    // Return only the refs of entities that were successfully retrieved
    return entities.items
      .filter(entity => entity !== undefined)
      .map(stringifyEntityRef);
  } catch (error) {
    // If there's an error, return empty array to be safe
    routeOpts.logger.warn('Error filtering entities by permissions', error);
    return [];
  }
};

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

export type QetaFilters = QetaFilter;

export const transformConditions: ConditionTransformer<QetaFilters> =
  createConditionTransformer(Object.values(rules));

const mapTagAdditionalFields = async (
  request: Request<unknown>,
  resource: TagResponse,
  permissionMgr: PermissionManager,
  credentials: BackstageCredentials,
  checkRights?: boolean,
  permissions?: Map<string, boolean>,
) => {
  const [canEdit, canDelete] = await Promise.all([
    permissions?.get(`edit:tag:${resource.id}`) ??
      (checkRights
        ? permissionMgr
            .authorizeBoolean(
              request,
              [{ permission: qetaEditTagPermission, resource }],
              {
                credentials,
              },
            )
            .then(r => r[0])
        : undefined),
    permissions?.get(`delete:tag:${resource.id}`) ??
      (checkRights
        ? permissionMgr
            .authorizeBoolean(
              request,
              [{ permission: qetaDeleteTagPermission, resource }],
              {
                credentials,
              },
            )
            .then(r => r[0])
        : undefined),
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
  routeOpts?: RouteOptions,
  permissions?: Map<string, boolean>,
) => {
  const [canEdit, canDelete, filteredEntities] = await Promise.all([
    permissions?.get(`edit:collection:${resource.id}`) ??
      (checkRights
        ? permissionMgr
            .authorizeBoolean(
              request,
              [{ permission: qetaEditCollectionPermission, resource }],
              {
                credentials,
              },
            )
            .then(r => r[0])
        : undefined),
    permissions?.get(`delete:collection:${resource.id}`) ??
      (checkRights
        ? permissionMgr
            .authorizeBoolean(
              request,
              [{ permission: qetaDeleteCollectionPermission, resource }],
              {
                credentials,
              },
            )
            .then(r => r[0])
        : undefined),
    routeOpts
      ? filterEntitiesByPermissions(resource.entities, routeOpts, credentials)
      : resource.entities,
  ]);

  resource.canEdit = canEdit;
  resource.canDelete = canDelete;
  resource.entities = filteredEntities;

  if (resource.posts && routeOpts) {
    await Promise.all(
      resource.posts.map(async post => {
        post.entities = await filterEntitiesByPermissions(
          post.entities,
          routeOpts,
          credentials,
        );
      }),
    );
  }

  return resource;
};

const mapResourceComments = async (
  request: Request<unknown>,
  resource: AnswerResponse | PostResponse,
  permissionMgr: PermissionManager,
  credentials: BackstageCredentials,
  username: string,
  checkRights?: boolean,
  permissions?: Map<string, boolean>,
) => {
  const commentArr = resource.comments ?? [];
  const comments: (Comment | null)[] = await Promise.all(
    commentArr.map(async (c: Comment) => {
      const canEdit =
        permissions?.get(`edit:comment:${c.id}`) ??
        (checkRights
          ? await permissionMgr
              .authorizeBoolean(
                request,
                [{ permission: qetaEditCommentPermission, resource: c }],
                { credentials },
              )
              .then(r => r[0])
          : false);
      const canDelete =
        permissions?.get(`delete:comment:${c.id}`) ??
        (checkRights
          ? await permissionMgr
              .authorizeBoolean(
                request,
                [{ permission: qetaDeleteCommentPermission, resource: c }],
                { credentials },
              )
              .then(r => r[0])
          : false);

      return {
        ...c,
        own: c.author === username,
        expert: c.experts?.includes(c.author),
        canEdit,
        canDelete,
      };
    }),
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
  routeOpts?: RouteOptions,
  permissions?: Map<string, boolean>,
) => {
  const [canEdit, canDelete, comments] = await Promise.all([
    permissions?.get(`edit:answer:${resource.id}`) ??
      (checkRights
        ? permissionMgr
            .authorizeBoolean(
              request,
              [{ permission: qetaEditAnswerPermission, resource }],
              {
                credentials,
              },
            )
            .then(r => r[0])
        : undefined),
    permissions?.get(`delete:answer:${resource.id}`) ??
      (checkRights
        ? permissionMgr
            .authorizeBoolean(
              request,
              [{ permission: qetaDeleteAnswerPermission, resource }],
              {
                credentials,
              },
            )
            .then(r => r[0])
        : undefined),
    mapResourceComments(
      request,
      resource,
      permissionMgr,
      credentials,
      username,
      checkRights,
      permissions,
    ),
  ]);

  resource.ownVote = resource.votes?.find(v => v.author === username)?.score;
  resource.own = resource.author === username;
  resource.canEdit = canEdit;
  resource.canDelete = canDelete;
  resource.expert = resource.experts?.includes(resource.author);
  resource.comments = comments;

  // Filter entities on the associated post if present
  if (resource.post && routeOpts) {
    resource.post.entities = await filterEntitiesByPermissions(
      resource.post.entities,
      routeOpts,
      credentials,
    );
  }

  return resource;
};

const mapPostAnswers = async (
  request: Request<unknown>,
  resource: PostResponse,
  permissionMgr: PermissionManager,
  credentials: BackstageCredentials,
  username: string,
  checkRights?: boolean,
  permissions?: Map<string, boolean>,
) => {
  const answersArray = resource.answers ?? [];
  const comments = await Promise.all(
    answersArray.map(async (a: Answer) => {
      return mapResourceComments(
        request,
        a,
        permissionMgr,
        credentials,
        username,
        checkRights,
        permissions,
      );
    }),
  );

  return Promise.all(
    answersArray.map(async (a: Answer, index: number) => {
      const canEdit =
        permissions?.get(`edit:answer:${a.id}`) ??
        (checkRights
          ? await permissionMgr
              .authorizeBoolean(
                request,
                [{ permission: qetaEditAnswerPermission, resource: a }],
                { credentials },
              )
              .then(r => r[0])
          : false);
      const canDelete =
        permissions?.get(`delete:answer:${a.id}`) ??
        (checkRights
          ? await permissionMgr
              .authorizeBoolean(
                request,
                [{ permission: qetaDeleteAnswerPermission, resource: a }],
                { credentials },
              )
              .then(r => r[0])
          : false);

      return {
        ...a,
        ownVote: a.votes?.find(v => v.author === username)?.score,
        own: a.author === username,
        canEdit,
        canDelete,
        expert: a.experts?.includes(resource.author),
        comments: comments[index],
      };
    }),
  );
};

const mapPostAdditionalFields = async (
  request: Request<unknown>,
  resource: PostResponse,
  permissionMgr: PermissionManager,
  credentials: BackstageCredentials,
  username: string,
  checkRights?: boolean,
  routeOpts?: RouteOptions,
  permissions?: Map<string, boolean>,
) => {
  resource.ownVote = resource.votes?.find(v => v.author === username)?.score;
  resource.own = resource.author === username;

  const [canEdit, canDelete, answers, comments, filteredEntities] =
    await Promise.all([
      permissions?.get(`edit:post:${resource.id}`) ??
        (checkRights
          ? permissionMgr
              .authorizeBoolean(
                request,
                [{ permission: qetaEditPostPermission, resource }],
                {
                  credentials,
                },
              )
              .then(r => r[0])
          : undefined),
      permissions?.get(`delete:post:${resource.id}`) ??
        (checkRights
          ? permissionMgr
              .authorizeBoolean(
                request,
                [{ permission: qetaDeletePostPermission, resource }],
                {
                  credentials,
                },
              )
              .then(r => r[0])
          : undefined),
      mapPostAnswers(
        request,
        resource,
        permissionMgr,
        credentials,
        username,
        checkRights,
        permissions,
      ),
      mapResourceComments(
        request,
        resource,
        permissionMgr,
        credentials,
        username,
        checkRights,
        permissions,
      ),
      routeOpts
        ? filterEntitiesByPermissions(resource.entities, routeOpts, credentials)
        : resource.entities,
    ]);
  resource.canEdit = canEdit;
  resource.canDelete = canDelete;
  resource.answers = answers;
  resource.comments = comments;
  resource.entities = filteredEntities;
  return resource;
};

const authorizeResourcePermissions = async (
  request: Request<unknown>,
  permissionMgr: PermissionManager,
  credentials: BackstageCredentials,
  posts: PostResponse[],
  collections: CollectionResponse[],
  tags: TagResponse[],
  answers: AnswerResponse[],
) => {
  const allAnswers = [
    ...answers,
    ...posts.flatMap(p => (p.answers ? p.answers : [])),
  ];
  const allComments = [
    ...posts.flatMap(p => (p.comments ? p.comments : [])),
    ...allAnswers.flatMap(a => (a.comments ? a.comments : [])),
  ];

  const [
    [postEditPerms, postDeletePerms],
    [collectionEditPerms, collectionDeletePerms],
    [tagEditPerms, tagDeletePerms],
    [answerEditPerms, answerDeletePerms],
    [commentEditPerms, commentDeletePerms],
  ] = await Promise.all([
    posts.length > 0
      ? permissionMgr
          .authorizeBoolean(
            request,
            [
              ...posts.map(r => ({
                permission: qetaEditPostPermission,
                resource: r,
              })),
              ...posts.map(r => ({
                permission: qetaDeletePostPermission,
                resource: r,
              })),
            ],
            { credentials },
          )
          .then(results => [
            results.slice(0, posts.length),
            results.slice(posts.length),
          ])
      : Promise.resolve([[], []]),
    collections.length > 0
      ? permissionMgr
          .authorizeBoolean(
            request,
            [
              ...collections.map(r => ({
                permission: qetaEditCollectionPermission,
                resource: r,
              })),
              ...collections.map(r => ({
                permission: qetaDeleteCollectionPermission,
                resource: r,
              })),
            ],
            { credentials },
          )
          .then(results => [
            results.slice(0, collections.length),
            results.slice(collections.length),
          ])
      : Promise.resolve([[], []]),
    tags.length > 0
      ? permissionMgr
          .authorizeBoolean(
            request,
            [
              ...tags.map(r => ({
                permission: qetaEditTagPermission,
                resource: r,
              })),
              ...tags.map(r => ({
                permission: qetaDeleteTagPermission,
                resource: r,
              })),
            ],
            { credentials },
          )
          .then(results => [
            results.slice(0, tags.length),
            results.slice(tags.length),
          ])
      : Promise.resolve([[], []]),
    allAnswers.length > 0
      ? permissionMgr
          .authorizeBoolean(
            request,
            [
              ...allAnswers.map(r => ({
                permission: qetaEditAnswerPermission,
                resource: r,
              })),
              ...allAnswers.map(r => ({
                permission: qetaDeleteAnswerPermission,
                resource: r,
              })),
            ],
            { credentials },
          )
          .then(results => [
            results.slice(0, allAnswers.length),
            results.slice(allAnswers.length),
          ])
      : Promise.resolve([[], []]),
    allComments.length > 0
      ? permissionMgr
          .authorizeBoolean(
            request,
            [
              ...allComments.map(r => ({
                permission: qetaEditCommentPermission,
                resource: r,
              })),
              ...allComments.map(r => ({
                permission: qetaDeleteCommentPermission,
                resource: r,
              })),
            ],
            { credentials },
          )
          .then(results => [
            results.slice(0, allComments.length),
            results.slice(allComments.length),
          ])
      : Promise.resolve([[], []]),
  ]);

  const permissions = new Map<string, boolean>();
  posts.forEach((r, i) => {
    permissions.set(`edit:post:${r.id}`, postEditPerms[i]);
    permissions.set(`delete:post:${r.id}`, postDeletePerms[i]);
  });
  collections.forEach((r, i) => {
    permissions.set(`edit:collection:${r.id}`, collectionEditPerms[i]);
    permissions.set(`delete:collection:${r.id}`, collectionDeletePerms[i]);
  });
  tags.forEach((r, i) => {
    permissions.set(`edit:tag:${r.id}`, tagEditPerms[i]);
    permissions.set(`delete:tag:${r.id}`, tagDeletePerms[i]);
  });
  allAnswers.forEach((r, i) => {
    permissions.set(`edit:answer:${r.id}`, answerEditPerms[i]);
    permissions.set(`delete:answer:${r.id}`, answerDeletePerms[i]);
  });
  allComments.forEach((r, i) => {
    permissions.set(`edit:comment:${r.id}`, commentEditPerms[i]);
    permissions.set(`delete:comment:${r.id}`, commentDeletePerms[i]);
  });

  return permissions;
};

export const mapAdditionalFields = async (
  request: Request<unknown>,
  resources: (MaybePost | MaybeAnswer | MaybeTag | MaybeCollection)[],
  routeOpts: RouteOptions,
  options?: {
    checkRights?: boolean;
    creds?: BackstageCredentials;
    username?: string;
  },
) => {
  if (!resources || resources.length === 0) {
    return resources;
  }

  const { creds, username, checkRights = true } = options ?? {};
  const { permissionMgr } = routeOpts;
  const credentials =
    creds ?? (await permissionMgr.getCredentials(request, true));
  const user =
    username ??
    (await routeOpts.permissionMgr.getUsername(request, true, credentials));

  const validResources = resources.filter(
    (
      r,
    ): r is PostResponse | AnswerResponse | TagResponse | CollectionResponse =>
      r !== null && r !== undefined,
  );

  const posts = validResources.filter(isPost) as PostResponse[];
  const collections = validResources.filter(
    isCollection,
  ) as CollectionResponse[];
  const tags = validResources.filter(isTag) as TagResponse[];
  const answers = validResources.filter(isAnswer) as AnswerResponse[];

  let permissions: Map<string, boolean> = new Map();

  if (checkRights) {
    permissions = await authorizeResourcePermissions(
      request,
      permissionMgr,
      credentials,
      posts,
      collections,
      tags,
      answers,
    );
  }

  await Promise.all(
    resources.map(async resource => {
      if (!resource) {
        return resource;
      }
      resource.self = getResourceUrl(resource, routeOpts.config, true);

      if (isTag(resource)) {
        return mapTagAdditionalFields(
          request,
          resource,
          permissionMgr,
          credentials,
          checkRights,
          permissions,
        );
      } else if (isCollection(resource)) {
        return mapCollectionAdditionalFields(
          request,
          resource,
          permissionMgr,
          credentials,
          checkRights,
          routeOpts,
          permissions,
        );
      } else if (isPost(resource)) {
        return mapPostAdditionalFields(
          request,
          resource,
          permissionMgr,
          credentials,
          user,
          checkRights,
          routeOpts,
          permissions,
        );
      } else if (isAnswer(resource)) {
        return mapAnswerAdditionalFields(
          request,
          resource,
          permissionMgr,
          credentials,
          user,
          checkRights,
          routeOpts,
          permissions,
        );
      }
      return resource;
    }),
  );

  return resources;
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
