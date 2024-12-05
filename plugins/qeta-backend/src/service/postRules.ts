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
  Post,
  POST_RESOURCE_TYPE,
  PostFilter,
} from '@drodil/backstage-plugin-qeta-common';

export const createPostPermissionRule = makeCreatePermissionRule<
  Post,
  PostFilter,
  typeof POST_RESOURCE_TYPE
>();

export const isPostAuthor = createPostPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the post is created by the user',
  resourceType: POST_RESOURCE_TYPE,
  paramsSchema: z.object({
    userRef: z.string().describe('User ID to match on the author'),
  }),
  apply: (resource: Post, { userRef }) => {
    return resource.author === userRef;
  },
  toQuery: ({ userRef }) => {
    return {
      property: 'posts.author',
      values: [userRef],
    };
  },
});

export const postAuthorConditionFactory = createConditionFactory(isPostAuthor);

export const postHasTags = createPostPermissionRule({
  name: 'HAS_TAGS',
  description: 'Should allow only if the post has all the specific tags',
  resourceType: POST_RESOURCE_TYPE,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tag to match the post'),
  }),
  apply: (resource: Post, { tags }) => {
    return tags.every(t => resource.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      property: 'tags',
      values: tags,
    };
  },
});

export const postHasTagsConditionFactory = createConditionFactory(postHasTags);

export const postHasEntities = createPostPermissionRule({
  name: 'HAS_ENTITIES',
  description: 'Should allow only if the post has all the specific entities',
  resourceType: POST_RESOURCE_TYPE,
  paramsSchema: z.object({
    entityRefs: z.array(z.string()).describe('Entity refs to match the post'),
  }),
  apply: (resource: Post, { entityRefs }) => {
    return entityRefs.every(t => resource.entities?.includes(t));
  },
  toQuery: ({ entityRefs }) => {
    return {
      property: 'entityRefs',
      values: entityRefs,
    };
  },
});

export const postHasEntitiesConditionFactory =
  createConditionFactory(postHasEntities);

export const postHasType = createPostPermissionRule({
  name: 'HAS_TYPE',
  description: 'Should allow only if the post has the specific type',
  resourceType: POST_RESOURCE_TYPE,
  paramsSchema: z.object({
    type: z.string().describe('Type to match the post'),
  }),
  apply: (resource: Post, { type }) => {
    return resource.type === type;
  },
  toQuery: ({ type }) => {
    return {
      property: 'posts.type',
      values: [type],
    };
  },
});

export const postHasTypeConditionFactory = createConditionFactory(postHasType);

export const postRules = {
  isPostAuthor,
  postHasTags,
  postHasEntities,
  postHasType,
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
    return tags.every(t => resource.post?.tags?.includes(t));
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
    return entityRefs.every(t => resource.post?.entities?.includes(t));
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

export const rules = { ...commentRules, ...answerRules, ...postRules };
