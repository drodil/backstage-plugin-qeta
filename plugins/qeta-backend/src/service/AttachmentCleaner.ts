import { QetaStore } from '../database/QetaStore';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

export class AttachmentCleaner {
  static initAttachmentCleaner = async (
    config: Config,
    scheduler: SchedulerService,
    logger: LoggerService,
    database: QetaStore,
    discovery: DiscoveryService,
    auth: AuthService,
  ): Promise<void> => {
    const schedule: SchedulerServiceTaskScheduleDefinition = config.has(
      'qeta.attachmentCleaner.schedule',
    )
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
          config.getConfig('qeta.attachmentCleaner.schedule'),
        )
      : {
          frequency: { cron: '0 0 * * *' },
          timeout: { hours: 1 },
          initialDelay: { minutes: 5 },
          scope: 'global',
        };

    const taskRunner = scheduler.createScheduledTaskRunner(schedule);
    await taskRunner.run({
      id: 'qeta-attachment-cleaner',
      fn: async () => {
        await this.cleanAttachments(config, logger, database, discovery, auth);
      },
    });
  };

  static cleanAttachments = async (
    config: Config,
    logger: LoggerService,
    database: QetaStore,
    discovery: DiscoveryService,
    auth: AuthService,
  ) => {
    logger.info('Cleaning attachments');

    const url = await discovery.getBaseUrl('qeta');
    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'qeta',
    });

    const dayLimit =
      config.getOptionalNumber('qeta.attachmentCleaner.dayLimit') ?? 7;
    const attachments = await database.getDeletableAttachments(dayLimit);

    for (const attachment of attachments) {
      try {
        logger.info(`Deleting attachment ${attachment.uuid}`);
        const response = await fetch(`${url}/attachments/${attachment.uuid}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Response not ok: ${response.status}`);
        }
      } catch (e) {
        logger.error(`Failed to delete attachment ${attachment.uuid}: ${e}`);
      }
    }
  };
}
