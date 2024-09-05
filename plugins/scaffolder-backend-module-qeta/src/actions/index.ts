import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { createFollowTagAction } from './followTag';
import { createUnfollowTagAction } from './unfollowTag';

export const createQetaActions = (options: {
  auth: AuthService;
  discovery: DiscoveryService;
}) => [createFollowTagAction(options), createUnfollowTagAction(options)];
