import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  qeta?: {
    /**
     * Allow anonymous questions
     *
     * @visibility backend
     */
    allowAnonymous?: boolean;
    /**
     * Allow author and created fields to be specified
     *
     * @visibility backend
     */
    allowMetadataInput?: boolean;
    /**
     * Allow all users to edit other users questions and answers in case permission framework is not in use.
     *
     * @visibility backend
     */
    allowGlobalEdits?: boolean;
    /**
     * Use permissions framework to control access to questions and answers.
     *
     * @visibility frontend
     */
    permissions?: boolean;
    /**
     * Can be used to disable notifications completely
     */
    notifications?: boolean;
    /**
     * Entities configuration for questions.
     *
     * @visibility frontend
     */
    entities?: {
      /**
       * Maximum entities to attach to questions.
       *
       * @visibility frontend
       */
      max?: number;
    };
    /**
     * Question tags specific configuration
     *
     * @visibility backend
     */
    tags?: {
      /**
       * Allow creation of new tags. Default: true
       *
       * @visibility backend
       */
      allowCreation?: boolean;
      /**
       * Allowed tags to be used with questions.
       * Only valid if allowCreation is false.
       *
       * @visibility backend
       */
      allowedTags?: string[];
      /**
       * Maximum number of tags per question. Default: 5
       *
       * @visibility frontend
       */
      max?: number;
    };
    /**
     * Posts mentions specific configuration
     *
     * @visibility frontend
     */
    mentions?: {
      /**
       * List of types of mentions that can be used in posts.
       *
       * Currently supported types are:
       * - `user`: Mention a user
       * - `group`: Mention a group
       *
       * @visibility frontend
       */
      supportedKinds?: string[];
    };
    /**
     * List of users/groups that can moderate questions and answers in case permission framework is not in use.
     * In case permission framework is in use, this list is used to determine if user
     * can access the moderator panel
     *
     * @visibility frontend
     */
    moderators?: string[];
    /**
     * Configuration about images attachments storage
     *
     * @visibility backend
     */
    storage?: {
      type?: 'database' | 'filesystem' | 's3' | 'azure';
      folder?: string;
      maxSizeImage?: number;
      allowedMimeTypes?: string[];
      bucket?: string;
      /**
       * @visibility secret
       */
      accessKeyId?: string;
      /**
       * @visibility secret
       */
      secretAccessKey?: string;
      region?: string;
      sessionToken?: string;
      blobStorageAccountName?: string;
      /**
       * @visibility secret
       */
      blobStorageConnectionString?: string;
      blobStorageContainer?: string;
      /**
       * Use relative URLs for attachments. This is by default true,
       * but should be set to false if you cannot see images in the frontend.
       */
      useRelativeUrls?: boolean;
    };
    /**
     * Stats config
     */
    stats?: {
      /**
       * Schedule to run the stats collector, defaults to 4 times a day
       */
      schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
      /**
       * Number of days to keep the stats, defaults to 30
       */
      historyDays?: number;
    };
    /**
     * Updates tag descriptions automatically
     */
    tagUpdater?: {
      schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
    };
    /**
     * Deletes unused attachments
     */
    attachmentCleaner?: {
      schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
      /**
       * Number of days to keep the unused attachments, defaults to 7
       */
      dayLimit?: number;
    };
  };
}
