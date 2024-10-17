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
          frequency: { cron: '15 */12 * * *' },
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
    await database.saveGlobalStats();

    const users = await database.getUsers();
    for (const user of users) {
      logger.info(`Collecting stats for ${user}`);
      await database.saveUserStats(user);
    }

    const historyDays =
      config.getOptionalNumber('qeta.stats.historyDays') ?? 30;
    await database.cleanStats(historyDays);
  };
}
