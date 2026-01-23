# Notifications

Notifications are new Backstage feature that allows you to send notifications to users.
This plugin integrates with the notifications plugin to send notifications to users when:

- A new post, notification is sent to:
  - The entity owners if the post is related to an entity
  - Tag followers if the post is tagged
  - Users that follow the author
  - Users who are mentioned in the post
- A question is answered, notification is sent to:
  - The question author
  - Other commenters
  - The entity owners if the question is related to an entity
  - Tag followers if the question is tagged
  - Users who are mentioned in the answer
- A post is commented, notification is sent to:
  - The post author
  - The entity owners if the post is related to an entity
  - Tag followers if the post is tagged
  - Users who are mentioned in the comment
- An answer is commented, notification is sent to:
  - The answer author
  - Other commenters
  - The entity owners if the question is related to an entity
  - Tag followers if the question is tagged
  - Users who are mentioned in the comment
- An answer is marked as correct, notification is sent to:
  - The answer author
  - The question author
  - The entity owners if the question is related to an entity

## Notification Links and Custom Routes

By default, notification links use `/qeta` as the base route. If you mount the Qeta plugin at a custom path in your Backstage app, set the `qeta.route` config value to match your frontend route. This ensures that notification links direct users to the correct location.

Example:

```yaml
qeta:
  route: custom-qeta
```

All notification links (questions, answers, articles, collections, etc.) will use this custom route as the base path.

## Setup

To enable notifications, you need to have the notifications plugin installed and configured.
This also requires to install the `signals` and `events` plugins to work seamlessly. See installation
instructions from the Backstage repository:

- https://github.com/backstage/backstage/tree/master/plugins/notifications
- https://github.com/backstage/backstage/tree/master/plugins/notifications-backend
- https://github.com/backstage/backstage/tree/master/plugins/signals-backend
- https://github.com/backstage/backstage/tree/master/plugins/events-backend

## Configuring notifications

At the moment, it's not possible to configure the notifications in the Backstage instance. There
is however a PR open to introduce user specific notifications in the future. See the PR here:
https://github.com/backstage/backstage/pull/23716

## Customizing Notification Recipients

You can customize who receives notifications by implementing the `NotificationReceiversHandler` interface. This allows you to control notification routing based on your organization's requirements.

### Creating a Custom Notification Receivers Handler

```typescript
import { NotificationReceiversHandler } from '@drodil/backstage-plugin-qeta-node';
import { Post, Answer, Collection } from '@drodil/backstage-plugin-qeta-common';

export class CustomNotificationReceiversHandler
  implements NotificationReceiversHandler
{
  /**
   * Called when a new post (question or article) is created
   * Return array of user/group entity refs who should receive notifications
   */
  async onNewPost(post: Post): Promise<string[]> {
    const recipients: string[] = [];
    // Add custom logic, e.g., notify all team leads
    if (post.tags?.includes('critical')) {
      recipients.push('user:default/team-lead');
    }
    return recipients;
  }

  /**
   * Called when a post receives a comment
   */
  async onNewPostComment(post: Post): Promise<string[]> {
    return [];
  }

  /**
   * Called when a post is deleted
   */
  async onPostDelete(post: Post): Promise<string[]> {
    return [];
  }

  /**
   * Called when a collection is deleted
   */
  async onCollectionDelete(collection: Collection): Promise<string[]> {
    return [];
  }

  /**
   * Called when an answer is deleted
   */
  async onAnswerDelete(post: Post, answer: Answer): Promise<string[]> {
    return [];
  }

  /**
   * Called when a post is edited
   */
  async onPostEdit(post: Post): Promise<string[]> {
    return [];
  }

  /**
   * Called when a new answer is created
   */
  async onNewAnswer(post: Post, answer: Answer): Promise<string[]> {
    return [];
  }

  /**
   * Called when an answer receives a comment
   */
  async onAnswerComment(post: Post, answer: Answer): Promise<string[]> {
    return [];
  }

  /**
   * Called when an answer is marked as correct
   */
  async onCorrectAnswer(post: Post, answer: Answer): Promise<string[]> {
    return [];
  }

  /**
   * Called when a user is mentioned in a post or answer
   */
  async onMention(post: Post | Answer): Promise<string[]> {
    return [];
  }

  /**
   * Called when a new collection is created
   */
  async onNewCollection(collection: Collection): Promise<string[]> {
    return [];
  }

  /**
   * Called when a new post is added to a collection
   */
  async onNewPostToCollection(collection: Collection): Promise<string[]> {
    return [];
  }
}
```

### Registering the Handler

Register your notification receivers handler using the `qetaNotificationReceiversExtensionPoint`:

```typescript
import { createBackendModule } from '@backstage/backend-plugin-api';
import { qetaNotificationReceiversExtensionPoint } from '@drodil/backstage-plugin-qeta-node';
import { CustomNotificationReceiversHandler } from './CustomNotificationReceiversHandler';

export const qetaCustomNotificationsModule = createBackendModule({
  pluginId: 'qeta',
  moduleId: 'custom-notifications',
  register(reg) {
    reg.registerInit({
      deps: {
        notifications: qetaNotificationReceiversExtensionPoint,
      },
      async init({ notifications }) {
        notifications.setHandler(new CustomNotificationReceiversHandler());
      },
    });
  },
});
```

Then add the module to your backend in `packages/backend/src/index.ts`:

```typescript
import { qetaCustomNotificationsModule } from './modules/qetaCustomNotifications';

backend.add(qetaCustomNotificationsModule);
```

**Note:** The notification recipients returned by your custom handler are **additional** recipients. The plugin will still send notifications to the default recipients (post authors, entity owners, tag followers, etc.) based on the notification type. Your handler extends this list with custom recipients based on your business logic.
