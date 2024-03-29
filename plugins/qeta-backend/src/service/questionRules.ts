import { makeCreatePermissionRule } from '@backstage/plugin-permission-node';
import { z } from 'zod';
import {
  Answer,
  ANSWER_RESOURCE_TYPE,
  Comment,
  COMMENT_RESOURCE_TYPE,
  Question,
  QUESTION_RESOURCE_TYPE,
  QuestionAnswerCommentFilter,
} from '@drodil/backstage-plugin-qeta-common';

export const createQuestionPermissionRule = makeCreatePermissionRule<
  Question,
  QuestionAnswerCommentFilter,
  typeof QUESTION_RESOURCE_TYPE
>();

export const isQuestionAuthor = createQuestionPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the question is asked by the user',
  resourceType: QUESTION_RESOURCE_TYPE,
  paramsSchema: z.object({
    userId: z.string().describe('User ID to match on the author'),
  }),
  apply: (resource: Question, { userId }) => {
    return resource.author === userId;
  },
  toQuery: ({ userId }) => {
    return {
      property: 'author',
      values: [userId],
    };
  },
});

export const questionRules = { isQuestionAuthor };

export const createAnswerPermissionRule = makeCreatePermissionRule<
  Answer,
  QuestionAnswerCommentFilter,
  typeof ANSWER_RESOURCE_TYPE
>();

export const isAnswerAuthor = createAnswerPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the answer is created by the user',
  resourceType: ANSWER_RESOURCE_TYPE,
  paramsSchema: z.object({
    userId: z.string().describe('User ID to match on the author'),
  }),
  apply: (resource: Answer, { userId }) => {
    return resource.author === userId;
  },
  toQuery: ({ userId }) => {
    return {
      property: 'author',
      values: [userId],
    };
  },
});

export const answerRules = { isAnswerAuthor };

export const createCommentPermissionRule = makeCreatePermissionRule<
  Comment,
  QuestionAnswerCommentFilter,
  typeof COMMENT_RESOURCE_TYPE
>();

export const isCommentAuthor = createCommentPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the comment is created by the user',
  resourceType: COMMENT_RESOURCE_TYPE,
  paramsSchema: z.object({
    userId: z.string().describe('User ID to match on the author'),
  }),
  apply: (resource: Comment, { userId }) => {
    return resource.author === userId;
  },
  toQuery: ({ userId }) => {
    return {
      property: 'author',
      values: [userId],
    };
  },
});

export const commentRules = { isCommentAuthor };
