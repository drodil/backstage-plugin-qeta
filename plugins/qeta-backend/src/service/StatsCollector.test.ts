import { StatsCollector } from './StatsCollector';
import { BadgeManager } from './BadgeManager';
import { QetaStore } from '../database/QetaStore';
import { LoggerService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { UserResponse } from '@drodil/backstage-plugin-qeta-common';

describe('StatsCollector', () => {
  const mockDatabase = {
    saveUserStats: jest.fn(),
    saveGlobalStats: jest.fn(),
    cleanStats: jest.fn(),
    getUsers: jest.fn(),
  } as unknown as QetaStore;

  const mockBadgeManager = {
    processUserBadges: jest.fn(),
  } as unknown as BadgeManager;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  } as unknown as LoggerService;

  const mockUser: UserResponse = {
    userRef: 'user:default/test',
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUser', () => {
    it('should call badgeManager.processUserBadges', async () => {
      const now = new Date();
      await StatsCollector.updateUser(
        mockLogger,
        mockDatabase,
        mockBadgeManager,
        mockUser,
        now,
      );

      expect(mockDatabase.saveUserStats).toHaveBeenCalledWith(
        mockUser.userRef,
        now,
      );
      expect(mockBadgeManager.processUserBadges).toHaveBeenCalledWith(
        mockUser.userRef,
      );
    });

    it('should handle errors in badge processing', async () => {
      const now = new Date();
      const error = new Error('Badge error');
      (mockBadgeManager.processUserBadges as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await StatsCollector.updateUser(
        mockLogger,
        mockDatabase,
        mockBadgeManager,
        mockUser,
        now,
      );

      expect(mockDatabase.saveUserStats).toHaveBeenCalledWith(
        mockUser.userRef,
        now,
      );
      expect(mockBadgeManager.processUserBadges).toHaveBeenCalledWith(
        mockUser.userRef,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to process badges for ${mockUser.userRef}`,
        error,
      );
    });
  });

  describe('collectStats', () => {
    const mockConfig = mockServices.rootConfig();
    const users = [mockUser, { ...mockUser, userRef: 'user:default/other' }];

    beforeEach(() => {
      mockDatabase.saveGlobalStats = jest.fn();
      mockDatabase.cleanStats = jest.fn();
      mockDatabase.getUsers = jest.fn().mockResolvedValue({ users, total: 2 });
    });

    it('should collect stats for all users and clean old stats', async () => {
      await StatsCollector.collectStats(
        mockConfig,
        mockLogger,
        mockDatabase,
        mockBadgeManager,
      );

      expect(mockDatabase.saveUserStats).toHaveBeenCalledTimes(2);
      expect(mockDatabase.cleanStats).toHaveBeenCalled();
    });

    it('should stop when aborted and skip cleaning old stats', async () => {
      const controller = new AbortController();
      (mockDatabase.saveUserStats as jest.Mock).mockImplementation(async () => {
        controller.abort();
      });

      await StatsCollector.collectStats(
        mockConfig,
        mockLogger,
        mockDatabase,
        mockBadgeManager,
        controller.signal,
      );

      expect(mockDatabase.saveUserStats).toHaveBeenCalledTimes(1);
      expect(mockDatabase.cleanStats).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Q&A stats collection aborted',
      );
    });
  });
});
