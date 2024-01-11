import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

export interface Config {
  search?: {
    collators?: {
      /**
       * Configuration options for `@backstage/plugin-search-backend-module-explore`
       */
      qeta?: {
        /**
         * The schedule for how often to run the collation job.
         */
        schedule?: TaskScheduleDefinitionConfig;
      };
    };
  };
}
