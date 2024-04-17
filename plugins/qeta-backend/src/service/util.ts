import { Request } from 'express';
import { AuthenticationError, NotAllowedError } from '@backstage/errors';
import { format, subDays } from 'date-fns';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import { MaybeAnswer, MaybeQuestion } from '../database/QetaStore';
import { Config } from '@backstage/config';
import { S3Client } from '@aws-sdk/client-s3';
import { RouteOptions } from './types';

export const getUsername = async (
  req: Request<unknown>,
  options: RouteOptions,
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

export const isModerator = async (
  req: Request<unknown>,
  options: RouteOptions,
): Promise<boolean> => {
  try {
    const credentials = await options.httpAuth.credentials(req, {
      allow: ['user'],
    });
    if (!credentials) {
      return false;
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

export const checkPermissions = async (
  request: Request<unknown>,
  permission: BasicPermission,
  options: RouteOptions,
): Promise<void> => {
  if (!options.permissions) {
    return;
  }

  const credentials = await options.httpAuth.credentials(request);
  if (!credentials) {
    throw new NotAllowedError('Unauthorized');
  }

  const decision = (
    await options.permissions.authorize([{ permission }], {
      credentials,
    })
  )[0];

  if (decision.result === AuthorizeResult.DENY) {
    throw new NotAllowedError('Unauthorized');
  }
};

export const mapAdditionalFields = (
  username: string,
  resp: MaybeQuestion | MaybeAnswer,
  options: RouteOptions,
  moderator?: boolean,
) => {
  if (!resp) {
    return;
  }
  resp.ownVote = resp.votes?.find(v => v.author === username)?.score;
  resp.own = resp.author === username;
  resp.canEdit =
    moderator ||
    options.config.getOptionalBoolean('qeta.allowGlobalEdits') ||
    resp.author === username;
  resp.canDelete = moderator || resp.author === username;
  resp.comments = resp.comments?.map(c => {
    return {
      ...c,
      own: c.author === username,
      canEdit: moderator || c.author === username,
      canDelete: moderator || c.author === username,
    };
  });
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
  if (accessKeyId && secretAccessKey) {
    return new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
    });
  }
  return new S3Client({ region });
};
