import { Request } from 'express';
import { AuthenticationError, NotAllowedError } from '@backstage/errors';
import { format, subDays } from 'date-fns';
import {
  AuthorizeResult,
  DefinitivePolicyDecision,
  isResourcePermission,
  Permission,
} from '@backstage/plugin-permission-common';
import { isQuestion, MaybeAnswer, MaybeQuestion } from '../database/QetaStore';
import { Config } from '@backstage/config';
import { S3Client } from '@aws-sdk/client-s3';
import { RouteOptions, RouterOptions } from './types';
import {
  Comment,
  qetaDeleteAnswerPermission,
  qetaDeleteCommentPermission,
  qetaDeleteQuestionPermission,
  qetaEditAnswerPermission,
  qetaEditCommentPermission,
  qetaEditQuestionPermission,
  qetaReadCommentPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { compact } from 'lodash';

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

export const authorize = async (
  request: Request<unknown>,
  permission: Permission,
  options: RouterOptions,
  resourceRef?: string,
): Promise<DefinitivePolicyDecision | null> => {
  if (!options.permissions) {
    return null;
  }

  const credentials = await options.httpAuth.credentials(request);
  if (!credentials) {
    throw new NotAllowedError('Unauthorized');
  }

  let decision: DefinitivePolicyDecision = { result: AuthorizeResult.DENY };
  if (isResourcePermission(permission)) {
    if (resourceRef) {
      decision = (
        await options.permissions.authorize(
          [{ permission, resourceRef: resourceRef }],
          {
            credentials,
          },
        )
      )[0];
    }
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

const authorizeBoolean = async (
  request: Request<unknown>,
  permission: Permission,
  options: RouterOptions,
  resourceRef?: string,
): Promise<boolean> => {
  try {
    await authorize(request, permission, options, resourceRef);
    return true;
  } catch (e) {
    return false;
  }
};

export const mapAdditionalFields = async (
  request: Request<unknown>,
  resp: MaybeQuestion | MaybeAnswer,
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
    isQuestion(resp) ? qetaEditQuestionPermission : qetaEditAnswerPermission,
    options,
    resp.id.toString(10),
  );
  resp.canDelete = await authorizeBoolean(
    request,
    isQuestion(resp)
      ? qetaDeleteQuestionPermission
      : qetaDeleteAnswerPermission,
    options,
    resp.id.toString(10),
  );
  const comments: (Comment | null)[] = await Promise.all(
    (resp.comments ?? []).map(async (c: Comment): Promise<Comment | null> => {
      if (
        !authorizeBoolean(
          request,
          qetaReadCommentPermission,
          options,
          c.id.toString(10),
        )
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
          resp.id.toString(10),
        ),
        canDelete: await authorizeBoolean(
          request,
          qetaDeleteCommentPermission,
          options,
          resp.id.toString(10),
        ),
      };
    }),
  );
  resp.comments = compact(comments);
};

export const stringDateTime = (dayString: string) => {
  const dateTimePeriod = Number(dayString.toString().slice(0, -1));

  const formattedDate = format(
    subDays(new Date(), dateTimePeriod),
    'yyyy-MM-dd',
  );

  return formattedDate;
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
