import request from 'supertest';
import express from 'express';
import {
  setupTestApp,
  mostUpvotedQuestions,
  mostUpvotedAnswers,
  globalStats,
} from './__testUtils__';
import { QetaStore } from '../../database/QetaStore';

describe('Statistics Routes', () => {
  let app: express.Express;
  let qetaStore: jest.Mocked<QetaStore>;

  beforeEach(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    qetaStore = setup.qetaStore;
  });

  describe('GET /statistics/posts/top-upvoted-users', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('returns the users with the best voted questions', async () => {
      qetaStore.getMostUpvotedPosts.mockResolvedValueOnce(mostUpvotedQuestions);

      qetaStore.getMostUpvotedPosts.mockResolvedValueOnce([
        {
          total: 1,
          author: 'user:default/thanos',
          position: 1,
        },
      ]);

      const response = await request(app).get(
        '/statistics/posts/top-upvoted-users',
      );

      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toBeDefined();
      expect(response.body.loggedUser.position).toBeDefined();
      expect(response.body.loggedUser.total).toBeDefined();
    });

    it('ensure that the position of the logged user is equal to the ranking', async () => {
      qetaStore.getMostUpvotedPosts.mockResolvedValueOnce(mostUpvotedQuestions);

      const response = await request(app).get(
        '/statistics/posts/top-upvoted-users',
      );

      expect(qetaStore.getMostUpvotedPosts).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toEqual('user:default/mock');
      expect(response.body.loggedUser.position).toEqual(1);
      expect(response.body.loggedUser.total).toEqual(5);
    });
  });

  describe('GET /statistics/answers/top-upvoted-users', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('returns the users with the best voted answers', async () => {
      qetaStore.getMostUpvotedAnswers.mockResolvedValueOnce(mostUpvotedAnswers);

      qetaStore.getMostUpvotedAnswers.mockResolvedValueOnce([
        {
          total: 1,
          author: 'user:default/thanos',
          position: 1,
        },
      ]);

      const response = await request(app).get(
        '/statistics/answers/top-upvoted-users',
      );

      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toBeDefined();
      expect(response.body.loggedUser.position).toBeDefined();
      expect(response.body.loggedUser.total).toBeDefined();
    });

    it('ensure that the position of the logged user is equal to the ranking', async () => {
      qetaStore.getMostUpvotedAnswers.mockResolvedValueOnce(mostUpvotedAnswers);

      const response = await request(app).get(
        '/statistics/answers/top-upvoted-users',
      );

      expect(qetaStore.getMostUpvotedAnswers).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toEqual('user:default/mock');
      expect(response.body.loggedUser.position).toEqual(1);
      expect(response.body.loggedUser.total).toEqual(9);
    });
  });

  describe('GET /statistics/answers/top-correct-upvoted-users', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('returns the users with the best voted correct answers', async () => {
      qetaStore.getMostUpvotedCorrectAnswers.mockResolvedValueOnce(
        mostUpvotedAnswers,
      );

      qetaStore.getMostUpvotedCorrectAnswers.mockResolvedValueOnce([
        {
          total: 1,
          author: 'user:default/peter_parker',
          position: 1,
        },
      ]);

      const response = await request(app).get(
        '/statistics/answers/top-correct-upvoted-users',
      );

      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toBeDefined();
      expect(response.body.loggedUser.position).toBeDefined();
      expect(response.body.loggedUser.total).toBeDefined();
    });

    it('ensure that the position of the logged user is equal to the ranking', async () => {
      qetaStore.getMostUpvotedCorrectAnswers.mockResolvedValueOnce(
        mostUpvotedAnswers,
      );

      const response = await request(app).get(
        '/statistics/answers/top-correct-upvoted-users',
      );

      expect(qetaStore.getMostUpvotedCorrectAnswers).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toEqual('user:default/mock');
      expect(response.body.loggedUser.position).toEqual(1);
      expect(response.body.loggedUser.total).toEqual(9);
    });
  });

  describe('GET /statistics/user/impact', () => {
    it('returns user impact statistics', async () => {
      qetaStore.getTotalViews.mockResolvedValueOnce(100);
      qetaStore.getTotalViews.mockResolvedValueOnce(25);

      const response = await request(app).get('/statistics/user/impact');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        impact: 100,
        lastWeekImpact: 25,
      });
    });

    it('zeros answers in activity when questions are disabled', async () => {
      const { app: disabledApp, qetaStore: disabledStore } = await setupTestApp(
        {
          qeta: { questions: { disabled: true } },
        },
      );
      disabledStore.getCommunityActivity.mockResolvedValue({
        period: '7d',
        posts: 5,
        answers: 6,
        comments: 7,
        votes: 8,
        views: 9,
        activeUsers: 10,
      });

      const response = await request(disabledApp).get('/statistics/activity');

      expect(response.status).toEqual(200);
      expect(response.body.answers).toEqual(0);
    });
  });

  describe('GET /statistics/global', () => {
    it('returns global statistics', async () => {
      qetaStore.getGlobalStats.mockResolvedValue(globalStats);
      qetaStore.getCount.mockResolvedValue(50);
      qetaStore.getUsersCount.mockResolvedValue(30);
      qetaStore.getCommunityActivity.mockResolvedValue({
        period: '1d',
        posts: 0,
        answers: 0,
        comments: 0,
        votes: 0,
        views: 0,
        activeUsers: 0,
      });

      const response = await request(app).get('/statistics/global');

      expect(response.status).toEqual(200);
      expect(response.body.statistics).toBeDefined();
      expect(response.body.summary).toBeDefined();
    });

    it('zeros disabled summary fields in global statistics', async () => {
      const { app: disabledApp, qetaStore: disabledStore } = await setupTestApp(
        {
          qeta: {
            questions: { disabled: true },
            articles: { disabled: true },
            links: { disabled: true },
            tags: { disabled: true },
          },
        },
      );
      disabledStore.getGlobalStats.mockResolvedValue(globalStats);
      disabledStore.getCount.mockResolvedValue(50);
      disabledStore.getUsersCount.mockResolvedValue(30);
      disabledStore.getCommunityActivity.mockResolvedValue({
        period: '1d',
        posts: 0,
        answers: 0,
        comments: 0,
        votes: 0,
        views: 0,
        activeUsers: 0,
      });

      const response = await request(disabledApp).get('/statistics/global');

      expect(response.status).toEqual(200);
      expect(response.body.summary).toEqual(
        expect.objectContaining({
          totalQuestions: 0,
          totalAnswers: 0,
          totalArticles: 0,
          totalLinks: 0,
          totalTags: 0,
        }),
      );
    });
  });

  describe('GET /statistics/user/:userRef', () => {
    it('returns user statistics', async () => {
      qetaStore.getUserStats.mockResolvedValue([
        {
          date: new Date('2022-01-01'),
          totalViews: 0,
          totalQuestions: 0,
          totalAnswers: 0,
          totalComments: 0,
          totalVotes: 0,
          totalArticles: 0,
          totalFollowers: 0,
          totalLinks: 0,
          reputation: 0,
          answerScore: 0,
          postScore: 0,
          correctAnswers: 0,
        },
      ]);
      qetaStore.getUser.mockResolvedValue({
        userRef: 'user:default/test',
        totalViews: 0,
        totalQuestions: 0,
        totalAnswers: 0,
        totalComments: 0,
        totalVotes: 0,
        totalArticles: 0,
        totalLinks: 0,
        totalFollowers: 0,
        reputation: 0,
        answerScore: 0,
        postScore: 0,
        correctAnswers: 0,
      });

      const response = await request(app).get(
        '/statistics/user/user:default/test',
      );

      expect(response.status).toEqual(200);
      expect(response.body.statistics).toBeDefined();
      expect(response.body.summary).toBeDefined();
    });

    it('zeros disabled summary fields in user statistics', async () => {
      const { app: disabledApp, qetaStore: disabledStore } = await setupTestApp(
        {
          qeta: {
            questions: { disabled: true },
            articles: { disabled: true },
            links: { disabled: true },
          },
        },
      );

      disabledStore.getUserStats.mockResolvedValue([
        {
          date: new Date('2022-01-01'),
          totalViews: 10,
          totalQuestions: 4,
          totalAnswers: 5,
          totalComments: 6,
          totalVotes: 7,
          totalArticles: 8,
          totalFollowers: 9,
          totalLinks: 10,
          reputation: 11,
          answerScore: 12,
          postScore: 13,
          correctAnswers: 3,
        },
      ]);
      disabledStore.getUser.mockResolvedValue({
        userRef: 'user:default/test',
        totalViews: 10,
        totalQuestions: 4,
        totalAnswers: 5,
        totalComments: 6,
        totalVotes: 7,
        totalArticles: 8,
        totalLinks: 10,
        totalFollowers: 9,
        reputation: 11,
        answerScore: 12,
        postScore: 13,
        correctAnswers: 3,
      });

      const response = await request(disabledApp).get(
        '/statistics/user/user:default/test',
      );

      expect(response.status).toEqual(200);
      expect(response.body.summary).toEqual(
        expect.objectContaining({
          totalQuestions: 0,
          totalAnswers: 0,
          totalArticles: 0,
          totalLinks: 0,
          correctAnswers: 0,
        }),
      );
      expect(response.body.statistics[0]).toEqual(
        expect.objectContaining({
          totalQuestions: 0,
          totalAnswers: 0,
          totalArticles: 0,
          totalLinks: 0,
          correctAnswers: 0,
        }),
      );
    });
  });

  describe('GET /statistics/posts/most-questions', () => {
    it('returns users with most questions', async () => {
      qetaStore.getTotalPosts.mockResolvedValue([
        {
          total: 10,
          author: 'user:default/mock',
          position: 1,
        },
      ]);

      const response = await request(app).get(
        '/statistics/posts/most-questions',
      );

      expect(response.status).toEqual(200);
      expect(response.body.ranking).toBeDefined();
      expect(response.body.loggedUser).toBeDefined();
    });
  });

  describe('GET /statistics/answers/most-answers', () => {
    it('returns users with most answers', async () => {
      qetaStore.getTotalAnswers.mockResolvedValue([
        {
          total: 10,
          author: 'user:default/mock',
          position: 1,
        },
      ]);

      const response = await request(app).get(
        '/statistics/answers/most-answers',
      );

      expect(response.status).toEqual(200);
      expect(response.body.ranking).toBeDefined();
      expect(response.body.loggedUser).toBeDefined();
    });
  });
});
