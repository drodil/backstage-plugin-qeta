import { createConditionExports } from '@backstage/plugin-permission-node';
import {
  answerRules,
  collectionRules,
  commentRules,
  permissionRules,
  tagRules,
} from './permissionRules';
import {
  ANSWER_RESOURCE_TYPE,
  COLLECTION_RESOUCE_TYPE,
  COMMENT_RESOURCE_TYPE,
  POST_RESOURCE_TYPE,
  TAG_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';

const {
  conditions: qConditions,
  createConditionalDecision: createPostDecision,
} = createConditionExports({
  pluginId: 'qeta',
  resourceType: POST_RESOURCE_TYPE,
  rules: permissionRules,
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

const {
  conditions: tConditions,
  createConditionalDecision: createTagDecision,
} = createConditionExports({
  pluginId: 'qeta',
  resourceType: TAG_RESOURCE_TYPE,
  rules: tagRules,
});

export const tagConditions = tConditions;

export const createTagConditionalDecision = createTagDecision;

const {
  conditions: colConditions,
  createConditionalDecision: createCollectionDecision,
} = createConditionExports({
  pluginId: 'qeta',
  resourceType: COLLECTION_RESOUCE_TYPE,
  rules: collectionRules,
});

export const collectionConditions = colConditions;

export const createCollectionConditionalDecision = createCollectionDecision;
