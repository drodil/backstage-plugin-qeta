import { QetaStore } from '../database/QetaStore';
import { BadgeManager } from './BadgeManager';
import {
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { EventsService } from '@backstage/plugin-events-node';
import { Config } from '@backstage/config';
import { UserResponse } from '@drodil/backstage-plugin-qeta-common';

export class StatsCollector {
  static initStatsCollector = async (
    config: Config,
    scheduler: SchedulerService,
    logger: LoggerService,
    database: QetaStore,
    badgeManager: BadgeManager,
    events: EventsService,
  ): Promise<void> => {
    const schedule: SchedulerServiceTaskScheduleDefinition = config.has(
      'qeta.stats.schedule',
    )
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
          config.getConfig('qeta.stats.schedule'),
        )
      : {
          frequency: { cron: '0 6,18 * * *' },
          timeout: { hours: 1 },
          initialDelay: { minutes: 5 },
          scope: 'global',
        };

    const taskRunner = scheduler.createScheduledTaskRunner(schedule);
    await taskRunner.run({
      id: 'qeta-stats-collector',
      fn: async () => {
        await this.collectStats(config, logger, database, badgeManager);
      },
    });

    await events.subscribe({
      id: 'qeta-stats-collector',
      topics: ['qeta'],
      onEvent: async event => {
        if (event.eventPayload && 'author' in (event.eventPayload as any)) {
          const author = (event.eventPayload as any).author;
          const user = await database.getUser(author);
          if (!user) {
            return;
          }
          await this.updateUser(
            logger,
            database,
            badgeManager,
            user,
            new Date(),
          );
        }
      },
    });
  };

  static updateUser = async (
    logger: LoggerService,
    database: QetaStore,
    badgeManager: BadgeManager,
    user: UserResponse,
    now: Date,
  ) => {
    if (!user) {
      return;
    }
    logger.info(`Collecting stats for ${user.userRef}`);
    try {
      await badgeManager.processUserBadges(user.userRef);
    } catch (e) {
      logger.error(`Failed to process badges for ${user.userRef}`, e);
    }
    await database.saveUserStats(user.userRef, now);
  };

  static collectStats = async (
    config: Config,
    logger: LoggerService,
    database: QetaStore,
    badgeManager: BadgeManager,
  ) => {
    logger.info('Starting to collect Q&A stats');
    const now = new Date();
    await database.saveGlobalStats(now);

    const users = await database.getUsers();
    for (const user of users.users) {
      await this.updateUser(logger, database, badgeManager, user, now);
      // Give some slack for the processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const historyDays =
      config.getOptionalNumber('qeta.stats.historyDays') ?? 30;
    await database.cleanStats(historyDays, now);
  };
}
