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
  isReadPermission,
  isResourcePermission,
  isUpdatePermission,
  Permission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import { isQuestion, MaybeAnswer, MaybePost } from '../database/QetaStore';
import { Config } from '@backstage/config';
import { S3Client } from '@aws-sdk/client-s3';
import { RouteOptions, RouterOptions } from './types';
import {
  Answer,
  Comment,
  Post,
  qetaDeleteAnswerPermission,
  qetaDeleteCommentPermission,
  qetaDeletePostPermission,
  qetaEditAnswerPermission,
  qetaEditCommentPermission,
  qetaEditPostPermission,
  qetaReadCommentPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { compact } from 'lodash';
import {
  ConditionTransformer,
  createConditionTransformer,
} from '@backstage/plugin-permission-node';
import { rules } from './postRules';
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

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
  resource?: Post | Answer | Comment | null,
): Promise<DefinitivePolicyDecision> => {
  const readPermission = isReadPermission(permission);
  const createPermission = isCreatePermission(permission);
  if (readPermission || createPermission) {
    return { result: AuthorizeResult.ALLOW };
  }

  if (!resource) {
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
  if (username === resource.author) {
    return { result: AuthorizeResult.ALLOW };
  }
  return { result: AuthorizeResult.DENY };
};

export const authorize = async (
  request: Request<unknown>,
  permission: Permission,
  options: RouterOptions,
  resource?: Post | Answer | Comment | null,
): Promise<DefinitivePolicyDecision> => {
  if (!options.permissions) {
    return await authorizeWithoutPermissions(
      request,
      permission,
      options,
      resource,
    );
  }

  const credentials = await options.httpAuth.credentials(request);
  if (!credentials) {
    throw new NotAllowedError('Unauthorized');
  }

  let decision: DefinitivePolicyDecision = { result: AuthorizeResult.DENY };
  if (isResourcePermission(permission)) {
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    decision = (
      await options.permissions.authorize(
        [{ permission, resourceRef: resource.id.toString(10) }],
        {
          credentials,
        },
      )
    )[0];
  } else {
    decision = (
      await options.permissions.authorize([{ permission }], {
        credentials,
      })
    )[0];
  }

  if (decision.result === AuthorizeResult.DENY) {
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
    | 'comments.author';
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
): Promise<PolicyDecision> => {
  if (!options.permissions) {
    return await authorizeWithoutPermissions(request, permission, options);
  }

  const credentials = await options.httpAuth.credentials(request);
  if (!credentials) {
    throw new NotAllowedError('Unauthorized');
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
    throw new NotAllowedError('Unauthorized');
  }
  return decision;
};

export const authorizeBoolean = async (
  request: Request<unknown>,
  permission: Permission,
  options: RouterOptions,
  resource?: Post | Answer | Comment | null,
): Promise<boolean> => {
  try {
    const res = await authorize(request, permission, options, resource);
    return res.result === AuthorizeResult.ALLOW;
  } catch (e) {
    return false;
  }
};

export const mapAdditionalFields = async (
  request: Request<unknown>,
  resp: MaybePost | MaybeAnswer,
  options: RouterOptions,
) => {
  if (!resp) {
    return;
  }
  const username = await getUsername(request, options);
  resp.ownVote = resp.votes?.find(v => v.author === username)?.score;
  resp.own = resp.author === username;
  resp.canEdit = await authorizeBoolean(
    request,
    isQuestion(resp) ? qetaEditPostPermission : qetaEditAnswerPermission,
    options,
    resp,
  );
  resp.canDelete = await authorizeBoolean(
    request,
    isQuestion(resp) ? qetaDeletePostPermission : qetaDeleteAnswerPermission,
    options,
    resp,
  );
  const comments: (Comment | null)[] = await Promise.all(
    (resp.comments ?? []).map(async (c: Comment): Promise<Comment | null> => {
      if (
        !(await authorizeBoolean(
          request,
          qetaReadCommentPermission,
          options,
          c,
        ))
      ) {
        return null;
      }

      return {
        ...c,
        own: c.author === username,
        canEdit: await authorizeBoolean(
          request,
          qetaEditCommentPermission,
          options,
          c,
        ),
        canDelete: await authorizeBoolean(
          request,
          qetaDeleteCommentPermission,
          options,
          c,
        ),
      };
    }),
  );
  resp.comments = compact(comments);
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
  if (accessKeyId && secretAccessKey) {
    return new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken,
      },
      region,
    });
  }
  return new S3Client({ region });
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
