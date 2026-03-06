import { HistoryCleaner } from './HistoryCleaner';
import { ConfigReader } from '@backstage/config';
import { LoggerService, SchedulerService } from '@backstage/backend-plugin-api';
import { QetaStore } from '../database/QetaStore';

describe('HistoryCleaner', () => {
  let mockLogger: jest.Mocked<LoggerService>;
  let mockDatabase: jest.Mocked<Pick<QetaStore, 'cleanOldRevisions'>>;
  let mockScheduler: jest.Mocked<SchedulerService>;
  let scheduledFn: (() => Promise<void>) | undefined;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<LoggerService>;

    mockDatabase = {
      cleanOldRevisions: jest.fn(),
    };

    scheduledFn = undefined;
    mockScheduler = {
      createScheduledTaskRunner: jest.fn().mockReturnValue({
        run: jest.fn().mockImplementation(async ({ fn }) => {
          scheduledFn = fn;
        }),
      }),
      triggerTask: jest.fn(),
      getScheduledTasks: jest.fn(),
    } as unknown as jest.Mocked<SchedulerService>;
  });

  describe('initHistoryCleaner', () => {
    it('should skip initialization when history is disabled', async () => {
      const config = new ConfigReader({
        qeta: { history: { enabled: false } },
      });

      await HistoryCleaner.initHistoryCleaner(
        config,
        mockScheduler,
        mockLogger,
        mockDatabase as unknown as QetaStore,
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'History revision tracking is disabled, skipping cleaner',
      );
      expect(mockScheduler.createScheduledTaskRunner).not.toHaveBeenCalled();
    });

    it('should skip initialization when history is disabled (default)', async () => {
      const config = new ConfigReader({});

      await HistoryCleaner.initHistoryCleaner(
        config,
        mockScheduler,
        mockLogger,
        mockDatabase as unknown as QetaStore,
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'History revision tracking is disabled, skipping cleaner',
      );
      expect(mockScheduler.createScheduledTaskRunner).not.toHaveBeenCalled();
    });

    it('should initialize when history.enabled is explicitly true', async () => {
      const config = new ConfigReader({
        qeta: { history: { enabled: true } },
      });

      await HistoryCleaner.initHistoryCleaner(
        config,
        mockScheduler,
        mockLogger,
        mockDatabase as unknown as QetaStore,
      );

      expect(mockScheduler.createScheduledTaskRunner).toHaveBeenCalled();
    });
  });

  describe('cleanHistory', () => {
    it('should use default retention of 180 days', async () => {
      const config = new ConfigReader({});
      mockDatabase.cleanOldRevisions.mockResolvedValue(0);

      await HistoryCleaner.cleanHistory(
        config,
        mockLogger,
        mockDatabase as unknown as QetaStore,
      );

      expect(mockDatabase.cleanOldRevisions).toHaveBeenCalledWith({
        retentionDays: 180,
      });
    });

    it('should use configured retentionDays', async () => {
      const config = new ConfigReader({
        qeta: { history: { retentionDays: 30 } },
      });
      mockDatabase.cleanOldRevisions.mockResolvedValue(5);

      await HistoryCleaner.cleanHistory(
        config,
        mockLogger,
        mockDatabase as unknown as QetaStore,
      );

      expect(mockDatabase.cleanOldRevisions).toHaveBeenCalledWith({
        retentionDays: 30,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Deleted 5 old post revisions',
      );
    });

    it('should log info when revisions are cleaned', async () => {
      const config = new ConfigReader({});
      mockDatabase.cleanOldRevisions.mockResolvedValue(10);

      await HistoryCleaner.cleanHistory(
        config,
        mockLogger,
        mockDatabase as unknown as QetaStore,
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Cleaning post revisions older than 180 days',
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Deleted 10 old post revisions',
      );
    });

    it('should not log deleted count when no revisions are cleaned', async () => {
      const config = new ConfigReader({});
      mockDatabase.cleanOldRevisions.mockResolvedValue(0);

      await HistoryCleaner.cleanHistory(
        config,
        mockLogger,
        mockDatabase as unknown as QetaStore,
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Cleaning post revisions older than 180 days',
      );
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('Deleted'),
      );
    });

    it('should log error when cleanup fails', async () => {
      const config = new ConfigReader({});
      mockDatabase.cleanOldRevisions.mockRejectedValue(
        new Error('DB connection failed'),
      );

      await HistoryCleaner.cleanHistory(
        config,
        mockLogger,
        mockDatabase as unknown as QetaStore,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to clean old post revisions',
        { error: expect.any(Error) },
      );
    });

    it('should schedule task and execute cleanup fn', async () => {
      const config = new ConfigReader({
        qeta: { history: { enabled: true } },
      });
      mockDatabase.cleanOldRevisions.mockResolvedValue(2);

      await HistoryCleaner.initHistoryCleaner(
        config,
        mockScheduler,
        mockLogger,
        mockDatabase as unknown as QetaStore,
      );

      expect(scheduledFn).toBeDefined();

      // Execute the scheduled function
      await scheduledFn!();

      expect(mockDatabase.cleanOldRevisions).toHaveBeenCalledWith({
        retentionDays: 180,
      });
    });
  });
});
