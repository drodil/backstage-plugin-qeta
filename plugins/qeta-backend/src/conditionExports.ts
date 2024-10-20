import { createConditionExports } from '@backstage/plugin-permission-node';
import { answerRules, commentRules, postRules } from './service/postRules';
import {
  ANSWER_RESOURCE_TYPE,
  COMMENT_RESOURCE_TYPE,
  POST_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';

const {
  conditions: qConditions,
  createConditionalDecision: createPostDecision,
} = createConditionExports({
  pluginId: 'qeta',
  resourceType: POST_RESOURCE_TYPE,
  rules: postRules,
});

export const questionConditions = qConditions;

export const createPostConditionalDecision = createPostDecision;

const {
  conditions: aConditions,
  createConditionalDecision: createAnswerDecision,
} = createConditionExports({
  pluginId: 'qeta',
  resourceType: ANSWER_RESOURCE_TYPE,
  rules: answerRules,
});

export const answerConditions = aConditions;

export const createAnswerConditionalDecision = createAnswerDecision;

const {
  conditions: cConditions,
  createConditionalDecision: createCommentDecision,
} = createConditionExports({
  pluginId: 'qeta',
  resourceType: COMMENT_RESOURCE_TYPE,
  rules: commentRules,
});

export const commentConditions = cConditions;

export const createCommentConditionalDecision = createCommentDecision;
