import {
  createConditionFactory,
  createPermissionRule,
} from '@backstage/plugin-permission-node';
import { z } from 'zod';
import {
  Answer,
  AnswerFilter,
  Collection,
  CollectionFilter,
  Comment,
  CommentFilter,
  Post,
  PostFilter,
  TagFilter,
  TagResponse,
} from '@drodil/backstage-plugin-qeta-common';
import {
  answerPermissionResourceRef,
  collectionPermissionResourceRef,
  commentPermissionResourceRef,
  postPermissionResourceRef,
  tagPermissionResourceRef,
} from './permissionResources';

export const isPostAuthor = createPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the post is created by the user',
  resourceRef: postPermissionResourceRef,
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
      property: 'posts.author' as PostFilter['property'],
      values: [userRef, ...claims].filter(Boolean),
    };
  },
});

export const postAuthorConditionFactory = createConditionFactory(isPostAuthor);

export const postHasTags = createPermissionRule({
  name: 'HAS_TAGS',
  description: 'Should allow only if the post has all the specific tags',
  resourceRef: postPermissionResourceRef,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tag to match the post'),
  }),
  apply: (resource: Post, { tags }) => {
    return tags.every(t => resource?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      property: 'tags' as PostFilter['property'],
      values: tags,
    };
  },
});

export const postHasTagsConditionFactory = createConditionFactory(postHasTags);

export const postHasEntities = createPermissionRule({
  name: 'HAS_ENTITIES',
  description: 'Should allow only if the post has all the specific entities',
  resourceRef: postPermissionResourceRef,
  paramsSchema: z.object({
    entityRefs: z.array(z.string()).describe('Entity refs to match the post'),
  }),
  apply: (resource: Post, { entityRefs }) => {
    return entityRefs.every(t => resource?.entities?.includes(t));
  },
  toQuery: ({ entityRefs }) => {
    return {
      property: 'entityRefs' as PostFilter['property'],
      values: entityRefs,
    };
  },
});

export const postHasEntitiesConditionFactory =
  createConditionFactory(postHasEntities);

export const postHasType = createPermissionRule({
  name: 'HAS_TYPE',
  description: 'Should allow only if the post has the specific type',
  resourceRef: postPermissionResourceRef,
  paramsSchema: z.object({
    type: z.string().describe('Type to match the post'),
  }),
  apply: (resource: Post, { type }) => {
    return resource?.type === type;
  },
  toQuery: ({ type }) => {
    return {
      property: 'posts.type' as PostFilter['property'],
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

export const isAnswerAuthor = createPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the answer is created by the user',
  resourceRef: answerPermissionResourceRef,
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
      property: 'answers.author' as AnswerFilter['property'],
      values: [userRef, ...claims].filter(Boolean),
    };
  },
});

export const answerAuthorConditionFactory =
  createConditionFactory(isAnswerAuthor);

export const answerQuestionHasTags = createPermissionRule({
  name: 'HAS_TAGS',
  description:
    'Should allow only if the answers question has all the specific tags',
  resourceRef: answerPermissionResourceRef,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tag to match the question'),
  }),
  apply: (resource: Answer, { tags }) => {
    return tags.every(t => resource?.post?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      property: 'tags' as AnswerFilter['property'],
      values: tags,
    };
  },
});

export const answerQuestionTagsConditionFactory = createConditionFactory(
  answerQuestionHasTags,
);

export const answerQuestionHasEntityRefs = createPermissionRule({
  name: 'HAS_ENTITIES',
  description:
    'Should allow only if the answers question has all the specific entities',
  resourceRef: answerPermissionResourceRef,
  paramsSchema: z.object({
    entityRefs: z.array(z.string()).describe('Tag to match the question'),
  }),
  apply: (resource: Answer, { entityRefs }) => {
    return entityRefs.every(t => resource?.post?.entities?.includes(t));
  },
  toQuery: ({ entityRefs }) => {
    return {
      property: 'entityRefs' as AnswerFilter['property'],
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

export const isCommentAuthor = createPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the comment is created by the user',
  resourceRef: commentPermissionResourceRef,
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
      property: 'comments.author' as CommentFilter['property'],
      values: [userRef, ...claims].filter(Boolean),
    };
  },
});

export const commentAuthorConditionFactory =
  createConditionFactory(isCommentAuthor);

export const commentRules = { isCommentAuthor };

export const isTag = createPermissionRule({
  name: 'IS_TAG',
  description: 'Should allow only if the tag exists',
  resourceRef: tagPermissionResourceRef,
  paramsSchema: z.object({
    tag: z.string().describe('Tag to match the post'),
  }),
  apply: (resource: TagResponse, { tag }) => {
    return resource?.tag === tag;
  },
  toQuery: ({ tag }) => {
    return {
      property: 'tags.tag' as TagFilter['property'],
      values: [tag],
    };
  },
});

export const tagConditionFactory = createConditionFactory(isTag);

export const isTagExpert = createPermissionRule({
  name: 'IS_TAG_EXPERT',
  description: 'Allows only if user is tag expert',
  resourceRef: tagPermissionResourceRef,
  paramsSchema: z.object({
    userRef: z
      .string()
      .describe('User ID to match on the tag expert')
      .optional(),
    claims: z
      .array(z.string())
      .optional()
      .describe('List of claims to match at least one on within tag expert'),
  }),
  apply: (resource: TagResponse, { userRef, claims }) => {
    return Boolean(
      resource?.experts?.some(e => e === userRef || claims?.includes(e)),
    );
  },
  toQuery: ({ claims = [], userRef }) => {
    return {
      property: 'tags.expert' as TagFilter['property'],
      values: [userRef, ...claims].filter(Boolean),
    };
  },
});

export const tagExpertConditionFactory = createConditionFactory(isTagExpert);

export const tagRules = { isTag, isTagExpert };

export const isCollectionOwner = createPermissionRule({
  name: 'IS_OWNER',
  description: 'Should allow only if the collection is owned by the user',
  resourceRef: collectionPermissionResourceRef,
  paramsSchema: z.object({
    userRef: z
      .string()
      .describe('User reference to match on the owner')
      .optional(),
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
      property: 'collections.owner' as CollectionFilter['property'],
      values: [userRef, ...claims].filter(Boolean),
    };
  },
});

export const collectionOwnerConditionFactory =
  createConditionFactory(isCollectionOwner);

export const collectionHasTags = createPermissionRule({
  name: 'HAS_TAGS',
  description:
    'Should allow only if the posts in the collection have the specific tags',
  resourceRef: collectionPermissionResourceRef,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tag to match the collection'),
  }),
  apply: (resource: Collection, { tags }) => {
    return tags.every(t => resource?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      property: 'tags' as CollectionFilter['property'],
      values: tags,
    };
  },
});

export const collectionHasTagsConditionFactory =
  createConditionFactory(collectionHasTags);

export const collectionHasEntities = createPermissionRule({
  name: 'HAS_ENTITIES',
  description:
    'Should allow only if the posts in the collection have the specific entities',
  resourceRef: collectionPermissionResourceRef,
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
      property: 'entityRefs' as CollectionFilter['property'],
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
  ...postRules,
  ...tagRules,
  ...collectionRules,
};
