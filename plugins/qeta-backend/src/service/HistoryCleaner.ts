import { QetaStore } from '../database/QetaStore';
import {
  LoggerService,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

export class HistoryCleaner {
  static initHistoryCleaner = async (
    config: Config,
    scheduler: SchedulerService,
    logger: LoggerService,
    database: QetaStore,
  ): Promise<void> => {
    const enabled = config.getOptionalBoolean('qeta.history.enabled') ?? false;
    if (!enabled) {
      logger.info('History revision tracking is disabled, skipping cleaner');
      return;
    }

    const schedule: SchedulerServiceTaskScheduleDefinition = {
      frequency: { cron: '0 3 * * *' },
      timeout: { hours: 1 },
      initialDelay: { minutes: 10 },
      scope: 'global',
    };

    const taskRunner = scheduler.createScheduledTaskRunner(schedule);
    await taskRunner.run({
      id: 'qeta-history-cleaner',
      fn: async () => {
        await this.cleanHistory(config, logger, database);
      },
    });
  };

  static cleanHistory = async (
    config: Config,
    logger: LoggerService,
    database: QetaStore,
  ) => {
    const retentionDays =
      config.getOptionalNumber('qeta.history.retentionDays') ?? 180;

    logger.info(`Cleaning post revisions older than ${retentionDays} days`);

    try {
      const deleted = await database.cleanOldRevisions({ retentionDays });
      if (deleted > 0) {
        logger.info(`Deleted ${deleted} old post revisions`);
      }
    } catch (e) {
      logger.error('Failed to clean old post revisions', { error: e });
    }
  };
}
