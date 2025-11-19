import express from 'express';
import { QetaStore } from '../../../database/QetaStore';
import {
  Answer,
  Comment,
  Post,
  Statistic,
} from '@drodil/backstage-plugin-qeta-common';
import { ConfigReader } from '@backstage/config';
import {
  AuthorizeResult,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { mockServices } from '@backstage/backend-test-utils';
import { CatalogApi } from '@backstage/catalog-client';
import { createRouter } from '../../router';

// Mock the database storage engine
export const globalMockEngine = {
  handleFile: jest.fn(),
  getAttachmentBuffer: jest.fn(),
  deleteAttachment: jest.fn(),
};

jest.mock('../../upload/database', () => {
  return jest.fn(() => globalMockEngine);
});

export const question: Post = {
  id: 1,
  score: 0,
  views: 122,
  author: 'user',
  title: 'title',
  content: 'content',
  favorite: false,
  created: new Date('2022-01-01T00:00:00Z'),
  answersCount: 0,
  correctAnswer: false,
  commentsCount: 0,
  type: 'question',
  images: [],
  status: 'active',
};

export const answer: Answer = {
  id: 1,
  postId: 1,
  score: 0,
  author: 'user',
  content: 'content',
  correct: false,
  created: new Date('2022-01-01T00:00:00Z'),
  images: [],
  status: 'active',
};

export const comment: Comment = {
  id: 23,
  author: 'user',
  content: 'content',
  created: new Date('2022-01-01T00:00:00Z'),
  status: 'active',
};

export const answerWithComment: Answer = {
  ...answer,
  comments: [comment],
};

export const questionWithComment: Post = {
  ...question,
  comments: [comment],
};

export const collection = {
  id: 1,
  title: 'Test Collection',
  description: 'Test Description',
  author: 'user:default/mock',
  created: new Date('2022-01-01T00:00:00Z'),
  followers: 0,
  posts: [],
  images: [],
  postsCount: 0,
  owner: 'user:default/mock',
};

export const template = {
  id: 1,
  title: 'Test Template',
  content: 'Test Content',
  author: 'user:default/mock',
  created: new Date('2022-01-01T00:00:00Z'),
  status: 'active',
};

export const tag = {
  id: 1,
  name: 'test-tag',
  description: 'Test Tag Description',
  author: 'user:default/mock',
  created: new Date('2022-01-01T00:00:00Z'),
  followers: 0,
  status: 'active',
};

export const entity = {
  id: 1,
  name: 'test-entity',
  description: 'Test Entity Description',
  author: 'user:default/mock',
  created: new Date('2022-01-01T00:00:00Z'),
  followers: 0,
  status: 'active',
};

export const user = {
  userRef: 'user:default/mock',
  totalViews: 100,
  totalQuestions: 5,
  totalAnswers: 10,
  totalComments: 2,
  totalVotes: 20,
  totalArticles: 1,
  totalLinks: 2,
  totalFollowers: 3,
};

export const globalStats = [
  {
    date: new Date('2022-01-01'),
    totalViews: 1000,
    totalQuestions: 50,
    totalAnswers: 100,
    totalComments: 25,
    totalVotes: 200,
    totalArticles: 10,
    totalLinks: 15,
    totalTags: 20,
    totalUsers: 30,
  },
];

export const userStats = [
  {
    date: new Date('2022-01-01'),
    totalViews: 100,
    totalQuestions: 5,
    totalAnswers: 10,
    totalComments: 2,
    totalVotes: 20,
    totalArticles: 1,
    totalFollowers: 3,
    totalLinks: 2,
  },
];

export const mostUpvotedQuestions: Statistic[] = [
  {
    total: 5,
    author: 'user:default/mock',
    position: 1,
  },
  {
    total: 4,
    author: 'user:default/black_widow',
    position: 2,
  },
  {
    total: 2,
    author: 'user:default/spider_man',
    position: 3,
  },
];

export const mostUpvotedAnswers: Statistic[] = [
  {
    total: 9,
    author: 'user:default/mock',
    position: 1,
  },
  {
    total: 8,
    author: 'user:default/john_doe',
    position: 2,
  },
  {
    total: 7,
    author: 'user:default/scarlet_witch',
    position: 3,
  },
];

export const createMockQetaStore = (): jest.Mocked<QetaStore> => {
  return {
    commentAnswer: jest.fn(),
    commentPost: jest.fn(),
    updatePostComment: jest.fn(),
    updateAnswerComment: jest.fn(),
    deleteAnswerComment: jest.fn(),
    deletePostComment: jest.fn(),
    getPosts: jest.fn(),
    getPost: jest.fn(),
    getQuestionByAnswerId: jest.fn(),
    createPost: jest.fn(),
    deletePost: jest.fn(),
    answerPost: jest.fn(),
    getAnswer: jest.fn(),
    deleteAnswer: jest.fn(),
    votePost: jest.fn(),
    voteAnswer: jest.fn(),
    markAnswerCorrect: jest.fn(),
    markAnswerIncorrect: jest.fn(),
    getTags: jest.fn(),
    getEntities: jest.fn(),
    updatePost: jest.fn(),
    updateAnswer: jest.fn(),
    favoritePost: jest.fn(),
    unfavoritePost: jest.fn(),
    postAttachment: jest.fn(),
    getAnswers: jest.fn(),
    getAttachment: jest.fn(),
    deleteAttachment: jest.fn(),
    getMostUpvotedAnswers: jest.fn(),
    getTotalAnswers: jest.fn(),
    getMostUpvotedPosts: jest.fn(),
    getMostUpvotedCorrectAnswers: jest.fn(),
    getUsersWhoFavoritedPost: jest.fn(),
    getTotalPosts: jest.fn(),
    followTag: jest.fn(),
    unfollowTag: jest.fn(),
    getUserTags: jest.fn(),
    getUsersForTags: jest.fn(),
    followEntity: jest.fn(),
    unfollowEntity: jest.fn(),
    getUserEntities: jest.fn(),
    getUsersForEntities: jest.fn(),
    getAnswerComment: jest.fn(),
    getPostComment: jest.fn(),
    getFollowingUsers: jest.fn(),
    getTagExperts: jest.fn(),
    getTotalViews: jest.fn(),
    getGlobalStats: jest.fn(),
    getCount: jest.fn(),
    getUsersCount: jest.fn(),
    getUserStats: jest.fn(),
    getUser: jest.fn(),
    getCollections: jest.fn(),
    getCollection: jest.fn(),
    createCollection: jest.fn(),
    updateCollection: jest.fn(),
    deleteCollection: jest.fn(),
    updatePostRank: jest.fn(),
    getNextRankedPostId: jest.fn(),
    getPreviousRankedPostId: jest.fn(),
    getUserCollections: jest.fn(),
    followCollection: jest.fn(),
    unfollowCollection: jest.fn(),
    addPostToCollection: jest.fn(),
    removePostFromCollection: jest.fn(),
    getPostRank: jest.fn(),
    getTemplates: jest.fn(),
    getTemplate: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
    getUsers: jest.fn(),
    getFollowedUsers: jest.fn(),
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
    getTag: jest.fn(),
    getTagById: jest.fn(),
    createTag: jest.fn(),
    updateTag: jest.fn(),
    deleteTag: jest.fn(),
    getEntity: jest.fn(),
    deletePostVote: jest.fn(),
    deleteAnswerVote: jest.fn(),
    getComment: jest.fn(),
    getUsersForCollection: jest.fn(),
  } as unknown as jest.Mocked<QetaStore>;
};

export const createMockPermissionEvaluator = () => {
  const mockedAuthorize: jest.MockedFunction<PermissionEvaluator['authorize']> =
    jest.fn();
  const mockedPermissionQuery: jest.MockedFunction<
    PermissionEvaluator['authorizeConditional']
  > = jest.fn();

  const permissionEvaluator: PermissionEvaluator = {
    authorize: mockedAuthorize,
    authorizeConditional: mockedPermissionQuery,
  };

  return { permissionEvaluator, mockedAuthorize, mockedPermissionQuery };
};

export const mockCatalog: CatalogApi = {} as unknown as CatalogApi;

export const mockSystemDate = (mockDate: Date) => {
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
};

export const buildApp = async (
  qetaStore: jest.Mocked<QetaStore>,
  permissionEvaluator: PermissionEvaluator,
  qetaConfig?: Record<string, string | object>,
) => {
  const config = ConfigReader.fromConfigs([
    { context: 'qeta', data: qetaConfig || {} },
  ]);
  const router = await createRouter({
    logger: mockServices.logger.mock(),
    httpAuth: mockServices.httpAuth(),
    userInfo: mockServices.userInfo(),
    discovery: mockServices.discovery(),
    database: qetaStore,
    auth: mockServices.auth(),
    catalog: mockCatalog,
    config,
    permissions: permissionEvaluator,
    permissionsRegistry: mockServices.permissionsRegistry.mock(),
  });
  return express().use(router);
};

export const setupTestApp = async (
  qetaConfig?: Record<string, string | object>,
) => {
  const qetaStore = createMockQetaStore();
  const { permissionEvaluator, mockedAuthorize, mockedPermissionQuery } =
    createMockPermissionEvaluator();

  // Setup default mock implementations for commonly used methods
  qetaStore.getPost.mockResolvedValue(null);
  qetaStore.getAnswer.mockResolvedValue(null);
  qetaStore.createPost.mockResolvedValue(question);
  qetaStore.answerPost.mockResolvedValue(answer);
  qetaStore.commentPost.mockResolvedValue(question);
  qetaStore.votePost.mockResolvedValue(true);
  qetaStore.voteAnswer.mockResolvedValue(true);
  qetaStore.markAnswerCorrect.mockResolvedValue(true);
  qetaStore.markAnswerIncorrect.mockResolvedValue(true);
  qetaStore.favoritePost.mockResolvedValue(true);
  qetaStore.unfavoritePost.mockResolvedValue(true);
  qetaStore.deletePost.mockResolvedValue(true);
  qetaStore.getMostUpvotedPosts.mockResolvedValue(mostUpvotedQuestions);
  qetaStore.getMostUpvotedAnswers.mockResolvedValue(mostUpvotedAnswers);

  const app = await buildApp(qetaStore, permissionEvaluator, qetaConfig);

  // Setup default mock implementations
  mockedAuthorize.mockImplementation(async requests => {
    return new Array(requests?.length).fill({
      result: AuthorizeResult.ALLOW,
    });
  });
  mockedPermissionQuery.mockImplementation(async requests => {
    return new Array(requests?.length).fill({
      result: AuthorizeResult.ALLOW,
    });
  });

  // Clear and reset the database storage engine mock
  globalMockEngine.handleFile.mockClear();
  globalMockEngine.getAttachmentBuffer.mockClear();
  globalMockEngine.deleteAttachment.mockClear();

  return { app, qetaStore, mockedAuthorize, mockedPermissionQuery };
};
