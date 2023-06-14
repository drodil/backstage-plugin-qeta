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

export const getUsername = async (
  req: Request<unknown>,
  options: RouterOptions,
): Promise<string> => {
  const user = await options.identity.getIdentity({ request: req });

  const allowAnonymous = options.config.getOptionalBoolean(
    'qeta.allowAnonymous',
  );
  if (!user) {
    if (allowAnonymous) {
      return 'user:default/guest';
    }
    throw new AuthenticationError(`Missing token in 'authorization' header`);
  }
  return user.identity.userEntityRef;
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
) => {
  if (!resp) {
    return;
  }
  resp.ownVote = resp.votes?.find(v => v.author === username)?.score;
  resp.own = resp.author === username;
  resp.comments = resp.comments?.map(c => {
    return { ...c, own: c.author === username };
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
