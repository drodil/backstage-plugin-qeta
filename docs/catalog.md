# Integration with catalog

You can integrate list of questions ans question post form to the catalog page. Create a new component to
packages/app/src/components/catalog/EntityPage/content/QetaContent.tsx:

## New frontend system

For new frontend system, the Q&A tab is automatically added to the entity page.

You can configure the content with following parameters in app-config.yaml:

```yaml
app:
  extensions:
    - entity-content:qeta/entity-posts-content:
        config:
          showFilters: false
          showTitle: true
          showAskButton: true
          showWriteButton: true
          showLinkButton: true
          showNoQuestionsBtn: true
          initialPageSize: 50
          type: question # if you just want to show questions
          view: list # grid | list
          relations: ['partOf'] # Show also posts from entities related with these relations in the entity page
```

## Old frontend system

```tsx
import { EntityPostsContent } from '@drodil/backstage-plugin-qeta';

export const QetaContent = () => {
  return <EntityPostsContent view="list" relations={['partOf']} />;
};
```

This can then be added to the specific component pages as a new tab, for example:

```ts
<EntityLayout.Route path="/qeta" title="Q&A">
  <QetaContent />
</EntityLayout.Route>
```

## Catalog module

Catalog module allows enriching entities with Q&A information.

To add the Q&A processor(s), you need to add the `@drodil/plugin-catalog-backend-module-qeta`
module to your backend as described in the
[README](../plugins/catalog-backend-module-qeta/README.md).
