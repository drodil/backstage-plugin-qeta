# Extensions

Q&A provides possibility to extend functionalities with extensions.

## Markdown extensions

It's possible to add custom `remark` and `rehype` plugins to process markdown content.
To do that, you need to provide `markdown` configuration with `remarkPlugins` and/or `rehypePlugins` options in
the `QetaPage` component and `PostsTableCard` component properties.

```tsx
import rehypeMermaid from 'rehype-mermaid';

<QetaPage
  title="Questions and answers"
  subtitle="We have answers to everything!"
  headerType="See @ GitHub"
  headerTypeLink="https://github.com/drodil/backstage-plugin-qeta"
  headerTooltip="This is very cool plugin"
  introElement={<IntroElement />}
  rehypePlugins={[rehypeMermaid]}
/>;
```

In the new frontend system, this is made possible via `QetaMarkdownRehypePluginBlueprint` and `QetaMarkdownRemarkPluginBlueprint` extension points.

Example of adding `rehype-mermaid` plugin:

```tsx
import rehypeMermaid from 'rehype-mermaid';

const module = createFrontendModule({
  pluginId: 'qeta',
  extensions: [
    QetaMarkdownRehypePluginBlueprint.make({
      params: {
        plugin: rehypeMermaid,
      },
    }),
  ],
});
```

- Available rehype plugins: https://github.com/rehypejs/rehype/blob/HEAD/doc/plugins.md#list-of-plugins
- Available remark plugins: https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins

## Custom Badge Evaluators

You can create custom badge evaluators to award badges based on your own criteria. Badge evaluators implement the `BadgeEvaluator` interface from `@drodil/backstage-plugin-qeta-node`.

### Creating a Custom Badge Evaluator

```typescript
import { BadgeEvaluator } from '@drodil/backstage-plugin-qeta-node';

export class CustomBadgeEvaluator implements BadgeEvaluator {
  // Unique key for the badge
  public readonly key = 'custom-badge';
  // Display name
  public readonly name = 'Custom Badge';
  // Description shown to users
  public readonly description = 'Awarded for custom achievement';
  // Icon name (see BadgeChip.tsx for available icons)
  public readonly icon = 'star';
  // Badge level: 'bronze' | 'silver' | 'gold' | 'diamond'
  public readonly level = 'gold' as const;
  // Badge type: 'one-time' (awarded once) or 'repetitive' (can be awarded multiple times)
  public readonly type = 'one-time' as const;
  // Reputation points awarded when badge is earned
  public readonly reputation = 50;

  // Option 1: Evaluate individual entities
  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    // Return true if the entity qualifies for this badge
    return false;
  }

  // Option 2: Evaluate based on user statistics
  async evaluateUser(user: UserResponse): Promise<boolean> {
    // Example: Award badge when user has 100+ followers
    return user.totalFollowers >= 100;
  }

  // Option 3: Evaluate a collection of entities
  async evaluateCollection(entities: QetaIdEntity[]): Promise<boolean> {
    // Example: Award badge when user has 10+ correct answers
    return entities.filter(e => 'correct' in e && e.correct).length >= 10;
  }
}
```

### Registering Custom Badge Evaluators

Register your custom evaluators using the `qetaBadgeEvaluatorExtensionPoint`:

```typescript
import { createBackendModule } from '@backstage/backend-plugin-api';
import { qetaBadgeEvaluatorExtensionPoint } from '@drodil/backstage-plugin-qeta-node';
import { CustomBadgeEvaluator } from './CustomBadgeEvaluator';

export const qetaCustomBadgesModule = createBackendModule({
  pluginId: 'qeta',
  moduleId: 'custom-badges',
  register(reg) {
    reg.registerInit({
      deps: {
        badges: qetaBadgeEvaluatorExtensionPoint,
      },
      async init({ badges }) {
        badges.addEvaluator(new CustomBadgeEvaluator());
      },
    });
  },
});
```

Then add the module to your backend in `packages/backend/src/index.ts`:

```typescript
import { qetaCustomBadgesModule } from './modules/qetaCustomBadges';

backend.add(qetaCustomBadgesModule);
```

### Badge Levels and Icons

Badge levels determine the visual styling:

- `bronze` - Bronze/copper gradient
- `silver` - Silver/gray gradient
- `gold` - Gold/yellow gradient
- `diamond` - Diamond/cyan gradient

See `BadgeChip.tsx` in `@drodil/backstage-plugin-qeta-react` for available icon names.

## AI Handler Extension

For details and the OpenAI reference implementation, see [AI Integration Documentation](ai.md).

## Tag Database Extension

You can provide custom tag descriptions by implementing the `TagDatabase` interface. This allows you to define custom tags with descriptions that are integrated into the plugin.

### Creating a Custom Tag Database

```typescript
import { TagDatabase } from '@drodil/backstage-plugin-qeta-node';

export class CustomTagDatabase implements TagDatabase {
  /**
   * Get custom tag descriptions.
   * The format is { 'tag name': 'tag description' }.
   */
  async getTags(): Promise<Record<string, string>> {
    return {
      kubernetes: 'Questions about Kubernetes orchestration',
      'ci-cd': 'Continuous Integration and Continuous Deployment topics',
      security: 'Security-related questions and best practices',
    };
  }
}
```

### Registering the Tag Database

Register your tag database using the `qetaTagDatabaseExtensionPoint`:

```typescript
import { createBackendModule } from '@backstage/backend-plugin-api';
import { qetaTagDatabaseExtensionPoint } from '@drodil/backstage-plugin-qeta-node';
import { CustomTagDatabase } from './CustomTagDatabase';

export const qetaCustomTagsModule = createBackendModule({
  pluginId: 'qeta',
  moduleId: 'custom-tags',
  register(reg) {
    reg.registerInit({
      deps: {
        tags: qetaTagDatabaseExtensionPoint,
      },
      async init({ tags }) {
        tags.setTagDatabase(new CustomTagDatabase());
      },
    });
  },
});
```

Then add the module to your backend in `packages/backend/src/index.ts`:

```typescript
import { qetaCustomTagsModule } from './modules/qetaCustomTags';

backend.add(qetaCustomTagsModule);
```

## Notification Receivers Extension

You can customize who receives notifications by implementing the `NotificationReceiversHandler` interface. This allows you to control notification routing based on your organization's requirements.

For more details, see [Notifications Documentation](notifications.md).
