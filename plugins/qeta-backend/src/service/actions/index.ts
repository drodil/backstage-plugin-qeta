import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { registerGetPostsAction } from './getPosts.ts';
import { registerPostActions } from './createPost.ts';
import { registerAnswerQuestionAction } from './answerQuestion.ts';
import {
  registerCommentAnswerAction,
  registerCommentPostAction,
} from './comment';

export const registerActions = (options: {
  actionsRegistry: ActionsRegistryService;
  discovery: DiscoveryService;
  auth: AuthService;
}) => {
  registerGetPostsAction(options);
  registerPostActions(options);
  registerAnswerQuestionAction(options);
  registerCommentPostAction(options);
  registerCommentAnswerAction(options);
};
