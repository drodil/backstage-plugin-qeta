import { createConditionExports } from '@backstage/plugin-permission-node';
import {
  answerRules,
  commentRules,
  questionRules,
} from './service/questionRules';
import {
  ANSWER_RESOURCE_TYPE,
  COMMENT_RESOURCE_TYPE,
  QUESTION_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';

const {
  conditions: qConditions,
  createConditionalDecision: createQuestionDecision,
} = createConditionExports({
  pluginId: 'qeta',
  resourceType: QUESTION_RESOURCE_TYPE,
  rules: questionRules,
});

export const questionConditions = qConditions;

export const createQuestionConditionalDecision = createQuestionDecision;

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
