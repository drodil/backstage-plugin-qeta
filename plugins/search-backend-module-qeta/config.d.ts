import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

export interface Config {
  search?: {
    collators?: {
      /**
       * Configuration options for `@drodil/backstage-plugin-search-backend-module-qeta`
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
