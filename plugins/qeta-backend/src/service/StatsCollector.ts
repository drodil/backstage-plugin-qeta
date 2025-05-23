import { QetaStore } from '../database/QetaStore';
import {
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

export class StatsCollector {
  static initStatsCollector = async (
    config: Config,
    scheduler: SchedulerService,
    logger: LoggerService,
    database: QetaStore,
  ): Promise<void> => {
    const schedule: SchedulerServiceTaskScheduleDefinition = config.has(
      'qeta.stats.schedule',
    )
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
          config.getConfig('qeta.stats.schedule'),
        )
      : {
          frequency: { cron: '0 5,11,17,23 * * *' },
          timeout: { hours: 1 },
          initialDelay: { minutes: 5 },
          scope: 'global',
        };

    const taskRunner = scheduler.createScheduledTaskRunner(schedule);
    await taskRunner.run({
      id: 'qeta-stats-collector',
      fn: async () => {
        await this.collectStats(config, logger, database);
      },
    });
  };

  static collectStats = async (
    config: Config,
    logger: LoggerService,
    database: QetaStore,
  ) => {
    logger.info('Starting to collect Q&A stats');
    const now = new Date();
    await database.saveGlobalStats(now);

    const users = await database.getUsers();
    for (const user of users.users) {
      logger.info(`Collecting stats for ${user.userRef}`);
      await database.saveUserStats(user, now);
      // Give some slack for the processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const historyDays =
      config.getOptionalNumber('qeta.stats.historyDays') ?? 30;
    await database.cleanStats(historyDays, now);
  };
}
