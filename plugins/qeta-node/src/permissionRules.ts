import {
  createConditionFactory,
  makeCreatePermissionRule,
} from '@backstage/plugin-permission-node';
import { z } from 'zod';
import {
  Answer,
  ANSWER_RESOURCE_TYPE,
  AnswerFilter,
  Collection,
  COLLECTION_RESOUCE_TYPE,
  CollectionFilter,
  Comment,
  COMMENT_RESOURCE_TYPE,
  CommentFilter,
  Post,
  POST_RESOURCE_TYPE,
  PostFilter,
  TAG_RESOURCE_TYPE,
  TagFilter,
  TagResponse,
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
    userRef: z.string().describe('User ID to match on the author').optional(),
    claims: z
      .array(z.string())
      .optional()
      .describe('List of claims to match at least one on within author'),
  }),
  apply: (resource: Post, { userRef, claims = [] }) => {
    return resource?.author === userRef || claims.includes(resource?.author);
  },
  toQuery: ({ userRef, claims = [] }) => {
    return {
      property: 'posts.author',
      values: [userRef, ...claims].filter(Boolean),
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
    return tags.every(t => resource?.tags?.includes(t));
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
    return entityRefs.every(t => resource?.entities?.includes(t));
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
    return resource?.type === type;
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

/**
 * @deprecated use `postRules` instead
 */
export const permissionRules = postRules;

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
    userRef: z.string().describe('User ID to match on the author').optional(),
    claims: z
      .array(z.string())
      .optional()
      .describe('List of claims to match at least one on within author'),
  }),
  apply: (resource: Answer, { userRef, claims = [] }) => {
    return resource?.author === userRef || claims.includes(resource?.author);
  },
  toQuery: ({ userRef, claims = [] }) => {
    return {
      property: 'answers.author',
      values: [userRef, ...claims].filter(Boolean),
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
    return tags.every(t => resource?.post?.tags?.includes(t));
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
    return entityRefs.every(t => resource?.post?.entities?.includes(t));
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
    userRef: z.string().describe('User ID to match on the author').optional(),
    claims: z
      .array(z.string())
      .optional()
      .describe('List of claims to match at least one on within author'),
  }),
  apply: (resource: Comment, { userRef, claims = [] }) => {
    return resource?.author === userRef || claims.includes(resource?.author);
  },
  toQuery: ({ userRef, claims = [] }) => {
    return {
      property: 'comments.author',
      values: [userRef, ...claims].filter(Boolean),
    };
  },
});

export const commentAuthorConditionFactory =
  createConditionFactory(isCommentAuthor);

export const commentRules = { isCommentAuthor };

export const createTagPermissionRule = makeCreatePermissionRule<
  TagResponse,
  TagFilter,
  typeof TAG_RESOURCE_TYPE
>();
export const isTag = createTagPermissionRule({
  name: 'IS_TAG',
  description: 'Should allow only if the tag exists',
  resourceType: TAG_RESOURCE_TYPE,
  paramsSchema: z.object({
    tag: z.string().describe('Tag to match the post'),
  }),
  apply: (resource: TagResponse, { tag }) => {
    return resource?.tag === tag;
  },
  toQuery: ({ tag }) => {
    return {
      property: 'tags.tag',
      values: [tag],
    };
  },
});

export const tagConditionFactory = createConditionFactory(isTag);

export const tagRules = { isTag };

export const createCollectionPermissionRule = makeCreatePermissionRule<
  Collection,
  CollectionFilter,
  typeof COLLECTION_RESOUCE_TYPE
>();

export const isCollectionOwner = createCollectionPermissionRule({
  name: 'IS_OWNER',
  description: 'Should allow only if the collection is owned by the user',
  resourceType: COLLECTION_RESOUCE_TYPE,
  paramsSchema: z.object({
    userRef: z.string().describe('User ID to match on the owner').optional(),
    claims: z
      .array(z.string())
      .optional()
      .describe('List of claims to match at least one on within owner'),
  }),
  apply: (resource: Collection, { userRef, claims = [] }) => {
    return resource?.owner === userRef || claims.includes(resource?.owner);
  },
  toQuery: ({ userRef, claims = [] }) => {
    return {
      property: 'collections.owner',
      values: [userRef, ...claims].filter(Boolean),
    };
  },
});

export const collectionOwnerConditionFactory =
  createConditionFactory(isCollectionOwner);

export const collectionHasTags = createCollectionPermissionRule({
  name: 'HAS_TAGS',
  description: 'Should allow only if the collection has all the specific tags',
  resourceType: COLLECTION_RESOUCE_TYPE,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tag to match the collection'),
  }),
  apply: (resource: Collection, { tags }) => {
    return tags.every(t => resource?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      property: 'tags',
      values: tags,
    };
  },
});

export const collectionHasTagsConditionFactory =
  createConditionFactory(collectionHasTags);

export const collectionHasEntities = createCollectionPermissionRule({
  name: 'HAS_ENTITIES',
  description:
    'Should allow only if the collection has all the specific entities',
  resourceType: COLLECTION_RESOUCE_TYPE,
  paramsSchema: z.object({
    entityRefs: z
      .array(z.string())
      .describe('Entity refs to match the collection'),
  }),
  apply: (resource: Collection, { entityRefs }) => {
    return entityRefs.every(t => resource?.entities?.includes(t));
  },
  toQuery: ({ entityRefs }) => {
    return {
      property: 'entityRefs',
      values: entityRefs,
    };
  },
});

export const collectionHasEntitiesConditionFactory = createConditionFactory(
  collectionHasEntities,
);

export const collectionRules = {
  isCollectionOwner,
  collectionHasTags,
  collectionHasEntities,
};

export const rules = {
  ...commentRules,
  ...answerRules,
  ...permissionRules,
  ...tagRules,
  ...collectionRules,
};
