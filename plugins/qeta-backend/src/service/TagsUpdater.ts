import { QetaStore } from '../database/QetaStore';
import {
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { TAGS } from '../tagDb';

export class TagsUpdater {
  static initTagsUpdater = async (
    config: Config,
    scheduler: SchedulerService,
    logger: LoggerService,
    database: QetaStore,
  ): Promise<void> => {
    const schedule: SchedulerServiceTaskScheduleDefinition = config.has(
      'qeta.tagUpdater.schedule',
    )
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
          config.getConfig('qeta.tagUpdater.schedule'),
        )
      : {
          frequency: { cron: '0 */1 * * *' },
          timeout: { hours: 1 },
          initialDelay: { minutes: 5 },
          scope: 'global',
        };

    const taskRunner = scheduler.createScheduledTaskRunner(schedule);
    await taskRunner.run({
      id: 'qeta-tag-updater',
      fn: async () => {
        await this.updateTags(logger, database);
      },
    });
  };

  static updateTags = async (logger: LoggerService, database: QetaStore) => {
    logger.info('Updating tags');
    const tagsWithoutDescription = await database.getTags({
      noDescription: true,
    });

    for (const tag of tagsWithoutDescription) {
      if (tag.tag.toLowerCase() in TAGS) {
        await database.updateTag(tag.tag, TAGS[tag.tag]);
      }
    }
  };
}
