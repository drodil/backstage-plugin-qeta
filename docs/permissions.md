# Q&A permissions

Q&A plugin is utilizing Backstage permissions framework. Using the framework is optional
but if you want to define who can read questions or post new questions or answers, follow this guide.
The default permissions are hard-coded. These include:

- Only author can edit and delete own questions
- Only author can edit and delete own answers
- Only author can delete their own comments
- User cannot vote their own questions or answers
- Only question author can mark answer as correct
- Except for moderators, who can do these for any questions/answer/comment

## Set up

In packages/backend/src/plugins/qeta.ts, add the permissions from your PluginEnvironment to createRouter call:

```ts
import {
  createRouter,
  DatabaseQetaStore,
} from '@drodil/backstage-plugin-qeta-backend';
import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  database,
  identity,
  config,
  permissions,
}: PluginEnvironment) {
  const db = await DatabaseQetaStore.create({
    database: database,
  });
  return createRouter({
    logger,
    database: db,
    identity,
    config,
    permissions,
  });
}
```

Now handle the permissions in your own PermissionPolicy. See details from
https://backstage.io/docs/permissions/plugin-authors/02-adding-a-basic-permission-check

The Q&A permissions are exported from `@drodil/backstage-plugin-qeta-common` package and are:

- qetaReadPermission - Allows or denies reading of questions and answers
- qetaCreateQuestionPermission - Allows or denies creating of questions
- qetaCreateAnswerPermission - Allows or denies answering questions
