import { Request } from 'express';
import {
  AuthenticationError,
  NotAllowedError,
  NotFoundError,
} from '@backstage/errors';
import { format, subDays } from 'date-fns';
import {
  AuthorizeResult,
  DefinitivePolicyDecision,
  isCreatePermission,
  isPermission,
  isReadPermission,
  isResourcePermission,
  isUpdatePermission,
  Permission,
  PermissionCriteria,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  isAnswer,
  isCollection,
  isComment,
  isPost,
  isTag,
  MaybeAnswer,
  MaybeCollection,
  MaybePost,
  MaybeTag,
} from '../database/QetaStore';
import { Config } from '@backstage/config';
import { S3Client } from '@aws-sdk/client-s3';
import { RouteOptions, RouterOptions } from './types';
import {
  Answer,
  Collection,
  Comment,
  Post,
  qetaCreateTagPermission,
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
  QetaIdEntity,
  qetaModeratePermission,
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
import { BackstagePrincipalTypes } from '@backstage/backend-plugin-api';

export const getUsername = async (
  req: Request<unknown>,
  options: RouterOptions,
  allowServiceToken?: boolean,
): Promise<string> => {
  const allowMetadataInput = options.config.getOptionalBoolean(
    'qeta.allowMetadataInput',
  );

  if (allowMetadataInput && req.body.user) {
    return req.body.user;
  } else if (allowMetadataInput && req.get('x-qeta-user')) {
    return req.get('x-qeta-user')!;
  }

  try {
    const credentials = await options.httpAuth.credentials(req, {
      allow: ['user'],
    });
    if (credentials) {
      return credentials.principal.userEntityRef;
    }
  } catch (_) {
    // NOOP
  }

  if (allowServiceToken) {
    try {
      const credentials = await options.httpAuth.credentials(req, {
        allow: ['service'],
      });
      if (credentials) {
        return credentials.principal.subject;
      }
    } catch (_) {
      // NOOP
    }
  }

  const allowAnonymous = options.config.getOptionalBoolean(
    'qeta.allowAnonymous',
  );

  if (allowAnonymous) {
    return 'user:default/guest';
  }

  throw new AuthenticationError(
    `Missing or invalid token in 'authorization' header`,
  );
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

export const isModerator = async (
  req: Request<unknown>,
  options: RouterOptions,
): Promise<boolean> => {
  try {
    const credentials = await options.httpAuth.credentials(req, {
      allow: ['user', 'service'],
    });
    if (!credentials) {
      return false;
    }

    // Service tokens are always moderators
    if (credentials.principal.type === 'service') {
      return true;
    }

    // Authorize moderator using permission framework
    if (options.permissions) {
      const result = await options.permissions.authorize(
        [{ permission: qetaModeratePermission }],
        { credentials },
      );
      return result[0].result === AuthorizeResult.ALLOW;
    }

    // Authorize moderator using config
    const username = credentials.principal.userEntityRef;
    const user = await options.userInfo.getUserInfo(credentials);

    const ownership: string[] = user?.ownershipEntityRefs ?? [];
    ownership.push(username);

    const moderators =
      options.config.getOptionalStringArray('qeta.moderators') ?? [];
    return moderators.some((m: string) => ownership.includes(m));
  } catch (_) {
    return false;
  }
};

const authorizeWithoutPermissions = async (
  request: Request<unknown>,
  permission: Permission,
  options: RouterOptions,
  resource?: QetaIdEntity | null,
  audit?: boolean,
): Promise<DefinitivePolicyDecision> => {
  const readPermission = isReadPermission(permission);
  const createPermission = isCreatePermission(permission);

  if (isPermission(permission, qetaCreateTagPermission)) {
    return options.config.getOptionalBoolean('qeta.tags.allowCreation') ?? true
      ? { result: AuthorizeResult.ALLOW }
      : { result: AuthorizeResult.DENY };
  }

  if (readPermission || createPermission) {
    return { result: AuthorizeResult.ALLOW };
  }

  if (!resource) {
    if (audit) {
      options.auditor?.createEvent({
        eventId: 'authorize',
        severityLevel: 'high',
        request,
        meta: {
          permission,
          resource,
          failure: 'Resource not found',
        },
      });
    }
    throw new NotFoundError('Resource not found');
  }

  const moderator = await isModerator(request, options);

  if (moderator) {
    return { result: AuthorizeResult.ALLOW };
  }

  const globalEdit =
    options.config.getOptionalBoolean('qeta.allowGlobalEdits') ?? false;
  const editPermission = isUpdatePermission(permission);

  if (globalEdit && editPermission) {
    return { result: AuthorizeResult.ALLOW };
  }

  const username = await getUsername(request, options);
  if ('author' in resource && username === resource.author) {
    return { result: AuthorizeResult.ALLOW };
  } else if ('owner' in resource && username === resource.owner) {
    return { result: AuthorizeResult.ALLOW };
  }

  if (audit) {
    options.auditor?.createEvent({
      eventId: 'authorize',
      severityLevel: 'high',
      request,
      meta: {
        permission,
        failure: 'Unauthorized',
      },
    });
  }

  return { result: AuthorizeResult.DENY };
};

const getResourceRef = (resource: QetaIdEntity) => {
  if (isPost(resource)) {
    return `qeta:post:${resource.id}`;
  }
  if (isAnswer(resource)) {
    return `qeta:answer:${resource.id}`;
  }
  if (isComment(resource)) {
    return `qeta:comment:${resource.id}`;
  }
  if (isTag(resource)) {
    return `qeta:tag:${resource.id}`;
  }
  if (isCollection(resource)) {
    return `qeta:collection:${resource.id}`;
  }
  throw new Error('Invalid resource type');
};

export const authorize = async (
  request: Request<unknown>,
  permission: Permission,
  options: RouterOptions,
  resource?: QetaIdEntity | null,
  audit?: boolean,
): Promise<DefinitivePolicyDecision> => {
  if (!options.permissions) {
    return await authorizeWithoutPermissions(
      request,
      permission,
      options,
      resource,
      audit,
    );
  }

  const credentials = await options.httpAuth.credentials(request);
  if (!credentials) {
    if (audit) {
      options.auditor?.createEvent({
        eventId: 'authorize',
        severityLevel: 'high',
        request,
        meta: {
          permission,
          failure: 'Unauthorized',
        },
      });
    }
    throw new NotAllowedError('Unauthorized');
  }

  let decision: DefinitivePolicyDecision = { result: AuthorizeResult.DENY };
  if (isResourcePermission(permission)) {
    if (!resource) {
      if (audit) {
        options.auditor?.createEvent({
          eventId: 'authorize',
          severityLevel: 'high',
          request,
          meta: {
            permission,
            resource,
            failure: 'Resource not found',
          },
        });
      }
      throw new NotFoundError('Resource not found');
    }

    const resourceRef = getResourceRef(resource);

    decision = (
      await options.permissions.authorize([{ permission, resourceRef }], {
        credentials,
      })
    )[0];
  } else {
    decision = (
      await options.permissions.authorize([{ permission }], {
        credentials,
      })
    )[0];
  }

  if (decision.result === AuthorizeResult.DENY) {
    if (audit) {
      options.auditor?.createEvent({
        eventId: 'authorize',
        severityLevel: 'high',
        request,
        meta: {
          permission,
          failure: 'Unauthorized',
        },
      });
    }
    throw new NotAllowedError('Unauthorized');
  }
  return decision;
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

export const authorizeConditional = async (
  request: Request<unknown>,
  permission: Permission,
  options: RouterOptions,
  allowServicePrincipal?: boolean,
): Promise<PolicyDecision> => {
  if (!options.permissions) {
    return await authorizeWithoutPermissions(
      request,
      permission,
      options,
      null,
      true,
    );
  }

  const allow: Array<keyof BackstagePrincipalTypes> = allowServicePrincipal
    ? ['user', 'service']
    : ['user'];
  const credentials = await options.httpAuth.credentials(request, { allow });

  if (!credentials) {
    options.auditor?.createEvent({
      eventId: 'authorize',
      severityLevel: 'high',
      request,
      meta: {
        permission,
        failure: 'Unauthorized',
      },
    });
    throw new NotAllowedError('Unauthorized');
  }

  if (
    allowServicePrincipal &&
    options.auth.isPrincipal(credentials, 'service')
  ) {
    return { result: AuthorizeResult.ALLOW };
  }

  let decision: PolicyDecision = { result: AuthorizeResult.DENY };
  if (isResourcePermission(permission)) {
    decision = (
      await options.permissions.authorizeConditional([{ permission }], {
        credentials,
      })
    )[0];
  }

  if (decision.result === AuthorizeResult.DENY) {
    options.auditor?.createEvent({
      eventId: 'authorize',
      severityLevel: 'high',
      request,
      meta: {
        permission,
        failure: 'Unauthorized',
      },
    });
    throw new NotAllowedError('Unauthorized');
  }
  return decision;
};

export const getAuthorizeConditions = async (
  request: Request<unknown>,
  permission: Permission,
  options: RouterOptions,
  allowServicePrincipal?: boolean,
): Promise<PermissionCriteria<QetaFilters> | undefined> => {
  if (!options.permissions) {
    return undefined;
  }

  const decision = await authorizeConditional(
    request,
    permission,
    options,
    allowServicePrincipal,
  );
  if (decision.result === AuthorizeResult.CONDITIONAL) {
    return transformConditions(decision.conditions);
  }
  return undefined;
};

export const authorizeBoolean = async (
  request: Request<unknown>,
  permission: Permission,
  options: RouterOptions,
  resource?: Post | Answer | Comment | Collection | TagResponse | null,
): Promise<boolean> => {
  try {
    const res = await authorize(request, permission, options, resource, false);
    return res.result === AuthorizeResult.ALLOW;
  } catch (e) {
    return false;
  }
};

export const mapAdditionalFields = async (
  request: Request<unknown>,
  resp: MaybePost | MaybeAnswer | MaybeTag | MaybeCollection,
  options: RouterOptions,
  checkRights = true,
) => {
  if (!resp) {
    return resp;
  }

  if (isCollection(resp) || isTag(resp)) {
    resp.canEdit = checkRights
      ? await authorizeBoolean(
          request,
          isCollection(resp)
            ? qetaEditCollectionPermission
            : qetaEditTagPermission,
          options,
          resp,
        )
      : undefined;
    resp.canDelete = checkRights
      ? await authorizeBoolean(
          request,
          isCollection(resp)
            ? qetaDeleteCollectionPermission
            : qetaDeleteTagPermission,
          options,
          resp,
        )
      : undefined;
    return resp;
  }

  const username = await getUsername(request, options, true);
  resp.ownVote = resp.votes?.find(v => v.author === username)?.score;
  resp.own = resp.author === username;
  resp.canEdit = checkRights
    ? await authorizeBoolean(
        request,
        isPost(resp) ? qetaEditPostPermission : qetaEditAnswerPermission,
        options,
        resp,
      )
    : undefined;
  resp.canDelete = checkRights
    ? await authorizeBoolean(
        request,
        isPost(resp) ? qetaDeletePostPermission : qetaDeleteAnswerPermission,
        options,
        resp,
      )
    : undefined;

  if (isPost(resp)) {
    await Promise.all(
      (resp.answers ?? []).map(
        async a => await mapAdditionalFields(request, a, options),
      ),
    );
  }

  const comments: (Comment | null)[] = await Promise.all(
    (resp.comments ?? []).map(async (c: Comment): Promise<Comment | null> => {
      return {
        ...c,
        own: c.author === username,
        canEdit: checkRights
          ? await authorizeBoolean(
              request,
              qetaEditCommentPermission,
              options,
              c,
            )
          : undefined,
        canDelete: checkRights
          ? await authorizeBoolean(
              request,
              qetaDeleteCommentPermission,
              options,
              c,
            )
          : undefined,
      };
    }),
  );
  resp.comments = compact(comments);
  return resp;
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
