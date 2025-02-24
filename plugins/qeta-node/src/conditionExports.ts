import { createConditionExports } from '@backstage/plugin-permission-node';
import {
  answerRules,
  collectionRules,
  commentRules,
  postRules,
  tagRules,
} from './permissionRules';
import {
  answerPermissionResourceRef,
  collectionPermissionResourceRef,
  commentPermissionResourceRef,
  postPermissionResourceRef,
  tagPermissionResourceRef,
} from './permissionResources.ts';

const {
  conditions: qConditions,
  createConditionalDecision: createPostDecision,
} = createConditionExports({
  resourceRef: postPermissionResourceRef,
  rules: postRules,
});

export const questionConditions = qConditions;

export const createPostConditionalDecision = createPostDecision;

const {
  conditions: aConditions,
  createConditionalDecision: createAnswerDecision,
} = createConditionExports({
  resourceRef: answerPermissionResourceRef,
  rules: answerRules,
});

export const answerConditions = aConditions;

export const createAnswerConditionalDecision = createAnswerDecision;

const {
  conditions: cConditions,
  createConditionalDecision: createCommentDecision,
} = createConditionExports({
  resourceRef: commentPermissionResourceRef,
  rules: commentRules,
});

export const commentConditions = cConditions;

export const createCommentConditionalDecision = createCommentDecision;

const {
  conditions: tConditions,
  createConditionalDecision: createTagDecision,
} = createConditionExports({
  resourceRef: tagPermissionResourceRef,
  rules: tagRules,
});

export const tagConditions = tConditions;

export const createTagConditionalDecision = createTagDecision;

const {
  conditions: colConditions,
  createConditionalDecision: createCollectionDecision,
} = createConditionExports({
  resourceRef: collectionPermissionResourceRef,
  rules: collectionRules,
});

export const collectionConditions = colConditions;

export const createCollectionConditionalDecision = createCollectionDecision;
