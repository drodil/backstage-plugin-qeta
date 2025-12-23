# Q&A permissions

Q&A plugin is utilizing Backstage permissions framework. Using the framework is optional
but if you want to define who can read questions or post new questions or answers, follow this guide.

The default permissions are hard-coded. This means if you are not using permissions framework in
your installation. These include:

- Only author can edit and delete own posts
- Only author can edit and delete own answers
- Only author can delete their own comments
- User cannot vote their own questions or answers
- Only question author can mark answer as correct
- Only moderators can review posts (mark as valid/obsolete) and view content health information
- Except for moderators, who can do these for any post/answer/comment

If you are using your own permission policy, you must configure the moderators using
`qetaModeratePermission` for example:

```ts
if (
  isPermission(request.permission, qetaModeratePermission) &&
  user.identity.ownershipEntityRefs.some(
    ref => ref === 'group:default/qeta-moderators',
  )
) {
  return { result: AuthorizeResult.ALLOW };
}
```

## Set up

```ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(import('@drodil/backstage-plugin-qeta-backend'));

backend.start();
```

In your config you must add both:

```yaml
permission:
  enabled: true

qeta:
  permissions: true
```

Now handle the permissions in your own PermissionPolicy. See details from
https://backstage.io/docs/permissions/plugin-authors/02-adding-a-basic-permission-check

The Q&A permissions are exported from `@drodil/backstage-plugin-qeta-common` package and are:

- qetaModeratePermission - Allows moderation of Q&A
- qetaReadPostPermission - Allows or denies reading of posts
- qetaCreatePostPermission - Allows or denies creating of posts
- qetaEditPostPermission - Allows or denies editing of posts and marking correct answers
- qetaDeletePostPermission - Allows or denies deleting of posts
- qetaReadAnswerPermission - Allows or denies reading of answers
- qetaCreateAnswerPermission - Allows or denies answering questions
- qetaEditAnswerPermission - Allows or denies editing of answers
- qetaDeleteAnswerPermission - Allows or denies deleting of answers
- qetaReadCommentPermission - Allows or denies reading of comments
- qetaCreateCommentPermission - Allows or denies commenting on posts or answers
- qetaEditCommentPermission - Allows or denies editing of comments
- qetaDeleteCommentPermission - Allows or denies deleting of comments
- qetaReadTagPermission - Allows or denies reading of tags
- qetaCreateTagPermission - Allows or denies creating of tags
- qetaEditTagPermission - Allows or denies editing of tags
- qetaDeleteTagPermission - Allows or denies deleting of tags
- qetaReadCollectionPermission - Allows or denies reading of collections
- qetaCreateCollectionPermission - Allows or denies creating of collections
- qetaEditCollectionPermission - Allows or denies editing of collections
- qetaDeleteCollectionPermission - Allows or denies deleting of collections
- qetaReadPostReviewPermission - Allows or denies viewing post reviews and content health information
- qetaCreatePostReviewPermission - Allows or denies marking posts as valid or obsolete
- qetaDeletePostReviewPermission - Allows or denies deleting post reviews

You can find example permission policy in the `plugins/qeta-backend/dev/PermissionPolicy.ts` file.

## Using default permission policy

In case you want to use the default permission policy, you can import it from the node package:

```ts
import { DefaultQetaPermissionPolicy } from '@drodil/backstage-plugin-qeta-node';
import { isQetaPermission } from '@drodil/backstage-plugin-qeta-common';

class BackstagePermissionPolicy implements PermissionPolicy {
  private readonly qetaPermissionPolicy: DefaultQetaPermissionPolicy;

  constructor(readonly config: Config) {
    // You can pass the config to the policy if you want to use the moderators array for
    // allowing access based on configuration `qeta.moderators`
    this.qetaPermissionPolicy = new DefaultQetaPermissionPolicy(config);
  }

  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    if (isQetaPermission(request.permission)) {
      return this.qetaPermissionPolicy.handle(request, user);
    }
  }
}
```

This allows users to only edit and delete their own posts, answers, and comments.
Creation and editing of tags is enabled for everyone.
Additionally, moderators defined in config can edit and delete any post, answer,
or comment if the config is passed to the `DefaultQetaPermissionPolicy` constructor.
