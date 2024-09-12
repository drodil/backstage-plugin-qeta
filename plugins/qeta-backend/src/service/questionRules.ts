import {
  createConditionFactory,
  makeCreatePermissionRule,
} from '@backstage/plugin-permission-node';
import { z } from 'zod';
import {
  Answer,
  ANSWER_RESOURCE_TYPE,
  AnswerFilter,
  Comment,
  COMMENT_RESOURCE_TYPE,
  CommentFilter,
  Question,
  QUESTION_RESOURCE_TYPE,
  QuestionFilter,
} from '@drodil/backstage-plugin-qeta-common';

export const createQuestionPermissionRule = makeCreatePermissionRule<
  Question,
  QuestionFilter,
  typeof QUESTION_RESOURCE_TYPE
>();

export const isQuestionAuthor = createQuestionPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the question is asked by the user',
  resourceType: QUESTION_RESOURCE_TYPE,
  paramsSchema: z.object({
    userRef: z.string().describe('User ID to match on the author'),
  }),
  apply: (resource: Question, { userRef }) => {
    return resource.author === userRef;
  },
  toQuery: ({ userRef }) => {
    return {
      property: 'questions.author',
      values: [userRef],
    };
  },
});

export const questionAuthorConditionFactory =
  createConditionFactory(isQuestionAuthor);

export const questionHasTags = createQuestionPermissionRule({
  name: 'HAS_TAGS',
  description: 'Should allow only if the question has all the specific tags',
  resourceType: QUESTION_RESOURCE_TYPE,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tag to match the question'),
  }),
  apply: (resource: Question, { tags }) => {
    return tags.every(t => resource.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      property: 'tags',
      values: tags,
    };
  },
});

export const questionHasTagsConditionFactory =
  createConditionFactory(questionHasTags);

export const questionHasEntities = createQuestionPermissionRule({
  name: 'HAS_ENTITIES',
  description:
    'Should allow only if the question has all the specific entities',
  resourceType: QUESTION_RESOURCE_TYPE,
  paramsSchema: z.object({
    entityRefs: z
      .array(z.string())
      .describe('Entity refs to match the question'),
  }),
  apply: (resource: Question, { entityRefs }) => {
    return entityRefs.every(t => resource.entities?.includes(t));
  },
  toQuery: ({ entityRefs }) => {
    return {
      property: 'entityRefs',
      values: entityRefs,
    };
  },
});

export const questionHasEntitiesConditionFactory =
  createConditionFactory(questionHasEntities);

export const questionRules = {
  isQuestionAuthor,
  questionHasTags,
  questionHasEntities,
};

export const createAnswerPermissionRule = makeCreatePermissionRule<
  Answer,
  AnswerFilter,
  typeof ANSWER_RESOURCE_TYPE
>();

export const isAnswerAuthor = createAnswerPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the answer is created by the user',
  resourceType: ANSWER_RESOURCE_TYPE,
  paramsSchema: z.object({
    userRef: z.string().describe('User ID to match on the author'),
  }),
  apply: (resource: Answer, { userRef }) => {
    return resource.author === userRef;
  },
  toQuery: ({ userRef }) => {
    return {
      property: 'answers.author',
      values: [userRef],
    };
  },
});

export const answerAuthorConditionFactory =
  createConditionFactory(isAnswerAuthor);

export const answerQuestionHasTags = createAnswerPermissionRule({
  name: 'HAS_TAGS',
  description:
    'Should allow only if the answers question has all the specific tags',
  resourceType: ANSWER_RESOURCE_TYPE,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tag to match the question'),
  }),
  apply: (resource: Answer, { tags }) => {
    return tags.every(t => resource.question?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      property: 'tags',
      values: tags,
    };
  },
});

export const answerQuestionTagsConditionFactory = createConditionFactory(
  answerQuestionHasTags,
);

export const answerQuestionHasEntityRefs = createAnswerPermissionRule({
  name: 'HAS_ENTITIES',
  description:
    'Should allow only if the answers question has all the specific entities',
  resourceType: ANSWER_RESOURCE_TYPE,
  paramsSchema: z.object({
    entityRefs: z.array(z.string()).describe('Tag to match the question'),
  }),
  apply: (resource: Answer, { entityRefs }) => {
    return entityRefs.every(t => resource.question?.entities?.includes(t));
  },
  toQuery: ({ entityRefs }) => {
    return {
      property: 'entityRefs',
      values: entityRefs,
    };
  },
});

export const answerQuestionEntitiesConditionFactory = createConditionFactory(
  answerQuestionHasEntityRefs,
);

export const answerRules = {
  isAnswerAuthor,
  answerQuestionHasTags,
  answerQuestionHasEntityRefs,
};

export const createCommentPermissionRule = makeCreatePermissionRule<
  Comment,
  CommentFilter,
  typeof COMMENT_RESOURCE_TYPE
>();

export const isCommentAuthor = createCommentPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the comment is created by the user',
  resourceType: COMMENT_RESOURCE_TYPE,
  paramsSchema: z.object({
    userRef: z.string().describe('User ID to match on the author'),
  }),
  apply: (resource: Comment, { userRef }) => {
    return resource.author === userRef;
  },
  toQuery: ({ userRef }) => {
    return {
      property: 'comments.author',
      values: [userRef],
    };
  },
});

export const commentAuthorConditionFactory =
  createConditionFactory(isCommentAuthor);

export const commentRules = { isCommentAuthor };

export const rules = { ...commentRules, ...answerRules, ...questionRules };
