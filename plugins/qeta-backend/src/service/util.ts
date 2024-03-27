import { Request } from 'express';
import { AuthenticationError, NotAllowedError } from '@backstage/errors';
import { RouterOptions } from './router';
import { format, subDays } from 'date-fns';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import { getBearerTokenFromAuthorizationHeader } from '@backstage/plugin-auth-node';
import { MaybeAnswer, MaybeQuestion } from '../database/QetaStore';
import { Config } from '@backstage/config';
import { S3Client } from '@aws-sdk/client-s3';

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
    const user = await options.identity.getIdentity({ request: req });
    if (user) {
      return user.identity.userEntityRef;
    }
  } catch (e) {
    // NOOP
  }

  if (allowServiceToken && options.tokenManager) {
    const token = getBearerTokenFromAuthorizationHeader(
      req.header('authorization'),
    );
    if (token) {
      try {
        await options.tokenManager.authenticate(token);
        return '';
      } catch (e) {
        // NOOP
      }
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
  options: RouterOptions,
): Promise<boolean> => {
  const user = await options.identity.getIdentity({ request: req });
  const username = await getUsername(req, options);

  const ownership: string[] = user?.identity.ownershipEntityRefs ?? [];
  ownership.push(username);

  const moderators =
    options.config.getOptionalStringArray('qeta.moderators') ?? [];
  return moderators.some(m => ownership.includes(m));
};

export const getCreated = async (
  req: Request<unknown>,
  options: RouterOptions,
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
  options: RouterOptions,
): Promise<void> => {
  if (!options.permissions) {
    return;
  }

  const token =
    getBearerTokenFromAuthorizationHeader(request.header('authorization')) ||
    (request.cookies?.token as string | undefined);
  const decision = (
    await options.permissions.authorize([{ permission }], {
      token,
    })
  )[0];

  if (decision.result === AuthorizeResult.DENY) {
    throw new NotAllowedError('Unauthorized');
  }
};

export const mapAdditionalFields = (
  username: string,
  resp: MaybeQuestion | MaybeAnswer,
  options: RouterOptions,
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
