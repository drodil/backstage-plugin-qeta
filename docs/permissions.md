# Q&A permissions

Q&A plugin is utilizing Backstage permissions framework. Using the framework is optional
but if you want to define who can read questions or post new questions or answers, follow this guide.

## Set up

```ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/permissions-backend'));
backend.add(import('@drodil/backstage-plugin-qeta-backend'));

backend.start();
```

Now handle the permissions in your own PermissionPolicy. See details from
https://backstage.io/docs/permissions/plugin-authors/02-adding-a-basic-permission-check

The Q&A permissions are exported from `@drodil/backstage-plugin-qeta-common` package and are:

- qetaReadQuestionPermission - Allows or denies reading of questions
- qetaCreateQuestionPermission - Allows or denies creating of questions
- qetaEditQuestionPermission - Allows or denies editing of questions
- qetaDeleteQuestionPermission - Allows or denies deleting of questions
- qetaReadAnswerPermission - Allows or denies reading of answers
- qetaCreateAnswerPermission - Allows or denies answering questions
- qetaEditAnswerPermission - Allows or denies editing of answers
- qetaDeleteAnswerPermission - Allows or denies deleting of answers
- qetaReadCommentPermission - Allows or denies reading of comments
- qetaCreateCommentPermission - Allows or denies commenting on questions or answers
- qetaEditCommentPermission - Allows or denies editing of comments
- qetaDeleteCommentPermission - Allows or denies deleting of comments
