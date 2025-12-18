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
import { PermissionCriteria } from '@backstage/plugin-permission-common';

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
    const filters: PermissionCriteria<PostFilter>[] = tags.map(e => ({
      property: 'tags' as PostFilter['property'],
      values: [e],
    }));

    return {
      allOf: filters,
    } as PermissionCriteria<PostFilter>;
  },
});

export const postHasTagsConditionFactory = createConditionFactory(postHasTags);

export const postHasAnyTag = createPermissionRule({
  name: 'HAS_ANY_TAG',
  description: 'Should allow only if the post has any of the specific tags',
  resourceRef: postPermissionResourceRef,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tag to match the post'),
  }),
  apply: (resource: Post, { tags }) => {
    return tags.some(t => resource?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      property: 'tags' as PostFilter['property'],
      values: tags,
    } as PermissionCriteria<PostFilter>;
  },
});

export const postHasAnyTagConditionFactory =
  createConditionFactory(postHasAnyTag);

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
  toQuery: ({ entityRefs }): PermissionCriteria<PostFilter> => {
    const filters: PermissionCriteria<PostFilter>[] = entityRefs.map(e => ({
      property: 'entityRefs' as PostFilter['property'],
      values: [e],
    }));

    return {
      allOf: filters,
    } as PermissionCriteria<PostFilter>;
  },
});

export const postHasEntitiesConditionFactory =
  createConditionFactory(postHasEntities);

export const postHasAnyEntity = createPermissionRule({
  name: 'HAS_ANY_ENTITY',
  description: 'Should allow only if the post has any of the specific entities',
  resourceRef: postPermissionResourceRef,
  paramsSchema: z.object({
    entityRefs: z.array(z.string()).describe('Entity refs to match the post'),
  }),
  apply: (resource: Post, { entityRefs }) => {
    return entityRefs.some(t => resource?.entities?.includes(t));
  },
  toQuery: ({ entityRefs }): PermissionCriteria<PostFilter> => {
    return {
      property: 'entityRefs' as PostFilter['property'],
      values: entityRefs,
    } as PermissionCriteria<PostFilter>;
  },
});

export const postHasAnyEntityConditionFactory =
  createConditionFactory(postHasAnyEntity);

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

export const isPostTagExpert = createPermissionRule({
  name: 'IS_POST_TAG_EXPERT',
  description: 'Allows if post has tags the user is expert of',
  resourceRef: postPermissionResourceRef,
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
  apply: (resource: Post, { userRef, claims }) => {
    return Boolean(
      resource?.experts?.some(e => e === userRef || claims?.includes(e)),
    );
  },
  toQuery: ({ claims = [], userRef }) => {
    return {
      property: 'tag.experts' as PostFilter['property'],
      values: [userRef, ...claims].filter(Boolean),
    };
  },
});

export const postTagExpertConditionFactory =
  createConditionFactory(isPostTagExpert);

export const postDoesNotHaveTags = createPermissionRule({
  name: 'DOES_NOT_HAVE_TAGS',
  description:
    'Should allow only if the post does not have any of the specific tags',
  resourceRef: postPermissionResourceRef,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tags that should not be on the post'),
  }),
  apply: (resource: Post, { tags }) => {
    return !tags.some(t => resource?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      not: {
        property: 'tags' as PostFilter['property'],
        values: tags,
      },
    } as PermissionCriteria<PostFilter>;
  },
});

export const postDoesNotHaveTagsConditionFactory =
  createConditionFactory(postDoesNotHaveTags);

export const postDoesNotHaveEntities = createPermissionRule({
  name: 'DOES_NOT_HAVE_ENTITIES',
  description:
    'Should allow only if the post does not have any of the specific entities',
  resourceRef: postPermissionResourceRef,
  paramsSchema: z.object({
    entityRefs: z
      .array(z.string())
      .describe('Entity refs that should not be on the post'),
  }),
  apply: (resource: Post, { entityRefs }) => {
    return !entityRefs.some(t => resource?.entities?.includes(t));
  },
  toQuery: ({ entityRefs }): PermissionCriteria<PostFilter> => {
    return {
      not: {
        property: 'entityRefs' as PostFilter['property'],
        values: entityRefs,
      },
    } as PermissionCriteria<PostFilter>;
  },
});

export const postDoesNotHaveEntitiesConditionFactory = createConditionFactory(
  postDoesNotHaveEntities,
);

export const postRules = {
  isPostAuthor,
  postHasTags,
  postHasAnyTag,
  postHasEntities,
  postHasAnyEntity,
  postHasType,
  isPostTagExpert,
  postDoesNotHaveTags,
  postDoesNotHaveEntities,
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
    const filters: PermissionCriteria<AnswerFilter>[] = tags.map(e => ({
      property: 'tags' as AnswerFilter['property'],
      values: [e],
    }));

    return {
      allOf: filters,
    } as PermissionCriteria<AnswerFilter>;
  },
});

export const answerQuestionTagsConditionFactory = createConditionFactory(
  answerQuestionHasTags,
);

export const answerQuestionHasAnyTag = createPermissionRule({
  name: 'HAS_ANY_TAG',
  description:
    'Should allow only if the answers question has any of the specific tags',
  resourceRef: answerPermissionResourceRef,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tag to match the question'),
  }),
  apply: (resource: Answer, { tags }) => {
    return tags.some(t => resource?.post?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      property: 'tags' as AnswerFilter['property'],
      values: tags,
    } as PermissionCriteria<AnswerFilter>;
  },
});

export const answerQuestionAnyTagConditionFactory = createConditionFactory(
  answerQuestionHasAnyTag,
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
    const filters: PermissionCriteria<AnswerFilter>[] = entityRefs.map(e => ({
      property: 'entityRefs' as AnswerFilter['property'],
      values: [e],
    }));

    return {
      allOf: filters,
    } as PermissionCriteria<AnswerFilter>;
  },
});

export const answerQuestionEntitiesConditionFactory = createConditionFactory(
  answerQuestionHasEntityRefs,
);

export const answerQuestionHasAnyEntityRefs = createPermissionRule({
  name: 'HAS_ANY_ENTITIES',
  description:
    'Should allow only if the answers question has any of the specific entities',
  resourceRef: answerPermissionResourceRef,
  paramsSchema: z.object({
    entityRefs: z.array(z.string()).describe('Tag to match the question'),
  }),
  apply: (resource: Answer, { entityRefs }) => {
    return entityRefs.some(t => resource?.post?.entities?.includes(t));
  },
  toQuery: ({ entityRefs }) => {
    return {
      property: 'entityRefs' as AnswerFilter['property'],
      values: entityRefs,
    } as PermissionCriteria<AnswerFilter>;
  },
});

export const answerQuestionHasAnyEntitiesConditionFactory =
  createConditionFactory(answerQuestionHasEntityRefs);

export const isAnswerTagExpert = createPermissionRule({
  name: 'IS_ANSWER_TAG_EXPERT',
  description: 'Allows if answers post has tags the user is expert of',
  resourceRef: answerPermissionResourceRef,
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
  apply: (resource: Answer, { userRef, claims }) => {
    return Boolean(
      resource?.experts?.some(e => e === userRef || claims?.includes(e)),
    );
  },
  toQuery: ({ claims = [], userRef }) => {
    return {
      property: 'tag.experts' as AnswerFilter['property'],
      values: [userRef, ...claims].filter(Boolean),
    };
  },
});

export const answerTagExpertConditionFactory =
  createConditionFactory(isAnswerTagExpert);

export const answerQuestionDoesNotHaveTags = createPermissionRule({
  name: 'DOES_NOT_HAVE_TAGS',
  description:
    'Should allow only if the answers question does not have any of the specific tags',
  resourceRef: answerPermissionResourceRef,
  paramsSchema: z.object({
    tags: z
      .array(z.string())
      .describe('Tags that should not be on the question'),
  }),
  apply: (resource: Answer, { tags }) => {
    return !tags.some(t => resource?.post?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      not: {
        property: 'tags' as AnswerFilter['property'],
        values: tags,
      },
    } as PermissionCriteria<AnswerFilter>;
  },
});

export const answerQuestionDoesNotHaveTagsConditionFactory =
  createConditionFactory(answerQuestionDoesNotHaveTags);

export const answerQuestionDoesNotHaveEntityRefs = createPermissionRule({
  name: 'DOES_NOT_HAVE_ENTITIES',
  description:
    'Should allow only if the answers question does not have any of the specific entities',
  resourceRef: answerPermissionResourceRef,
  paramsSchema: z.object({
    entityRefs: z
      .array(z.string())
      .describe('Entity refs that should not be on the question'),
  }),
  apply: (resource: Answer, { entityRefs }) => {
    return !entityRefs.some(t => resource?.post?.entities?.includes(t));
  },
  toQuery: ({ entityRefs }) => {
    return {
      not: {
        property: 'entityRefs' as AnswerFilter['property'],
        values: entityRefs,
      },
    } as PermissionCriteria<AnswerFilter>;
  },
});

export const answerQuestionDoesNotHaveEntitiesConditionFactory =
  createConditionFactory(answerQuestionDoesNotHaveEntityRefs);

export const answerRules = {
  isAnswerAuthor,
  answerQuestionHasTags,
  answerQuestionHasAnyTag,
  answerQuestionHasEntityRefs,
  answerQuestionHasAnyEntityRefs,
  isAnswerTagExpert,
  answerQuestionDoesNotHaveTags,
  answerQuestionDoesNotHaveEntityRefs,
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
      property: 'tag.experts' as TagFilter['property'],
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
    const filters: PermissionCriteria<CollectionFilter>[] = tags.map(e => ({
      property: 'tags' as CollectionFilter['property'],
      values: [e],
    }));

    return {
      allOf: filters,
    } as PermissionCriteria<CollectionFilter>;
  },
});

export const collectionHasTagsConditionFactory =
  createConditionFactory(collectionHasTags);

export const collectionHasAnyTag = createPermissionRule({
  name: 'HAS_ANY_TAG',
  description:
    'Should allow only if the posts in the collection have some of the specific tags',
  resourceRef: collectionPermissionResourceRef,
  paramsSchema: z.object({
    tags: z.array(z.string()).describe('Tag to match the collection'),
  }),
  apply: (resource: Collection, { tags }) => {
    return tags.some(t => resource?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      property: 'tags' as CollectionFilter['property'],
      values: tags,
    } as PermissionCriteria<CollectionFilter>;
  },
});

export const collectionHasAnyTagConditionFactory =
  createConditionFactory(collectionHasAnyTag);

export const collectionHasEntities = createPermissionRule({
  name: 'HAS_ENTITIES',
  description:
    'Should allow only if the posts in the collection have all the specific entities',
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
    const filters: PermissionCriteria<CollectionFilter>[] = entityRefs.map(
      e => ({
        property: 'entityRefs' as CollectionFilter['property'],
        values: [e],
      }),
    );

    return {
      allOf: filters,
    } as PermissionCriteria<CollectionFilter>;
  },
});

export const collectionHasEntitiesConditionFactory = createConditionFactory(
  collectionHasEntities,
);

export const collectionHasAnyEntity = createPermissionRule({
  name: 'HAS_ANY_ENTITY',
  description:
    'Should allow only if the posts in the collection have some of the specific entities',
  resourceRef: collectionPermissionResourceRef,
  paramsSchema: z.object({
    entityRefs: z
      .array(z.string())
      .describe('Entity refs to match the collection'),
  }),
  apply: (resource: Collection, { entityRefs }) => {
    return entityRefs.some(t => resource?.entities?.includes(t));
  },
  toQuery: ({ entityRefs }) => {
    return {
      property: 'entityRefs' as CollectionFilter['property'],
      values: entityRefs,
    } as PermissionCriteria<CollectionFilter>;
  },
});

export const collectionHasAnyEntityConditionFactory = createConditionFactory(
  collectionHasAnyEntity,
);

export const isCollectionTagExpert = createPermissionRule({
  name: 'IS_COLLECTION_TAG_EXPERT',
  description: 'Allows if collection has tags the user is expert of',
  resourceRef: collectionPermissionResourceRef,
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
  apply: (resource: Collection, { userRef, claims }) => {
    return Boolean(
      resource?.experts?.some(e => e === userRef || claims?.includes(e)),
    );
  },
  toQuery: ({ claims = [], userRef }) => {
    return {
      property: 'tag.experts' as CollectionFilter['property'],
      values: [userRef, ...claims].filter(Boolean),
    };
  },
});

export const collectionTagExpertConditionFactory = createConditionFactory(
  isCollectionTagExpert,
);

export const collectionDoesNotHaveTags = createPermissionRule({
  name: 'DOES_NOT_HAVE_TAGS',
  description:
    'Should allow only if the posts in the collection do not have any of the specific tags',
  resourceRef: collectionPermissionResourceRef,
  paramsSchema: z.object({
    tags: z
      .array(z.string())
      .describe('Tags that should not be in the collection'),
  }),
  apply: (resource: Collection, { tags }) => {
    return !tags.some(t => resource?.tags?.includes(t));
  },
  toQuery: ({ tags }) => {
    return {
      not: {
        property: 'tags' as CollectionFilter['property'],
        values: tags,
      },
    } as PermissionCriteria<CollectionFilter>;
  },
});

export const collectionDoesNotHaveTagsConditionFactory = createConditionFactory(
  collectionDoesNotHaveTags,
);

export const collectionDoesNotHaveEntities = createPermissionRule({
  name: 'DOES_NOT_HAVE_ENTITIES',
  description:
    'Should allow only if the posts in the collection do not have any of the specific entities',
  resourceRef: collectionPermissionResourceRef,
  paramsSchema: z.object({
    entityRefs: z
      .array(z.string())
      .describe('Entity refs that should not be in the collection'),
  }),
  apply: (resource: Collection, { entityRefs }) => {
    return !entityRefs.some(t => resource?.entities?.includes(t));
  },
  toQuery: ({ entityRefs }) => {
    return {
      not: {
        property: 'entityRefs' as CollectionFilter['property'],
        values: entityRefs,
      },
    } as PermissionCriteria<CollectionFilter>;
  },
});

export const collectionDoesNotHaveEntitiesConditionFactory =
  createConditionFactory(collectionDoesNotHaveEntities);

export const collectionRules = {
  isCollectionOwner,
  collectionHasTags,
  collectionHasAnyTag,
  collectionHasEntities,
  collectionHasAnyEntity,
  isCollectionTagExpert,
  collectionDoesNotHaveTags,
  collectionDoesNotHaveEntities,
};

export const rules = {
  ...commentRules,
  ...answerRules,
  ...postRules,
  ...tagRules,
  ...collectionRules,
};
