import { TagsUpdater } from './TagsUpdater';
import { QetaStore } from '../database/QetaStore';
import { LoggerService, SchedulerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { mockServices } from '@backstage/backend-test-utils';

describe('TagsUpdater', () => {
  let mockConfig: Config;
  let mockScheduler: SchedulerService;
  let mockLogger: LoggerService;
  let mockDatabase: QetaStore;

  beforeEach(() => {
    mockConfig = mockServices.rootConfig();
    mockScheduler = mockServices.scheduler.mock();
    mockLogger = mockServices.logger.mock();
    mockDatabase = {
      getTags: jest.fn(),
      updateTag: jest.fn(),
    } as unknown as QetaStore;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initTagsUpdater', () => {
    it('should initialize the tag updater with the correct schedule', async () => {
      const mockTaskRunner = {
        run: jest.fn(),
      };
      mockScheduler.createScheduledTaskRunner = jest
        .fn()
        .mockReturnValue(mockTaskRunner);

      await TagsUpdater.initTagsUpdater(
        mockConfig,
        mockScheduler,
        mockLogger,
        mockDatabase,
      );

      expect(mockScheduler.createScheduledTaskRunner).toHaveBeenCalled();
      expect(mockTaskRunner.run).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'qeta-tag-updater',
          fn: expect.any(Function),
        }),
      );
    });

    it('should use default schedule if config is not provided', async () => {
      mockConfig.has = jest.fn().mockReturnValue(false);

      const mockTaskRunner = {
        run: jest.fn(),
      };
      mockScheduler.createScheduledTaskRunner = jest
        .fn()
        .mockReturnValue(mockTaskRunner);

      await TagsUpdater.initTagsUpdater(
        mockConfig,
        mockScheduler,
        mockLogger,
        mockDatabase,
      );

      expect(mockScheduler.createScheduledTaskRunner).toHaveBeenCalledWith(
        expect.objectContaining({
          frequency: { cron: '0 */1 * * *' },
          timeout: { hours: 1 },
          initialDelay: { minutes: 5 },
          scope: 'global',
        }),
      );
    });
  });

  describe('updateTags', () => {
    it('should update tags without description', async () => {
      const tagsWithoutDescription = { tags: [{ tag: 'java' }], total: 1 };
      mockDatabase.getTags = jest
        .fn()
        .mockResolvedValue(tagsWithoutDescription);
      mockDatabase.updateTag = jest.fn().mockResolvedValue(undefined);

      await TagsUpdater.updateTags(mockLogger, mockDatabase);

      expect(mockLogger.info).toHaveBeenCalledWith('Updating tags');
      expect(mockDatabase.getTags).toHaveBeenCalledWith({
        noDescription: true,
      });
      expect(mockDatabase.updateTag).toHaveBeenCalledWith(
        'java',
        expect.any(String),
      );
    });

    it('should not update tags if no tags without description are found', async () => {
      mockDatabase.getTags = jest
        .fn()
        .mockResolvedValue({ tags: [], total: 0 });

      await TagsUpdater.updateTags(mockLogger, mockDatabase);

      expect(mockLogger.info).toHaveBeenCalledWith('Updating tags');
      expect(mockDatabase.getTags).toHaveBeenCalledWith({
        noDescription: true,
      });
      expect(mockDatabase.updateTag).not.toHaveBeenCalled();
    });
  });
});
