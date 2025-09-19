# Integration with catalog

You can integrate list of questions ans question post form to the catalog page. Create a new component to
packages/app/src/components/catalog/EntityPage/content/QetaContent.tsx:

```ts
import { useEntity } from '@backstage/plugin-catalog-react';
import { Container } from '@material-ui/core';
import { stringifyEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { PostsContainer } from '@drodil/backstage-plugin-qeta-react';

export const QetaContent = () => {
  const { entity } = useEntity();

  return (
    <Container>
      <PostsContainer
        entity={stringifyEntityRef(entity)}
        showTitle={true}
        showAskButton={true}
        type="question" // Can be 'question' or 'article' or none
      />
    </Container>
  );
};
```

This can then be added to the specific component pages as a new tab, for example:

```ts
<EntityLayout.Route path="/qeta" title="Q&A">
  <QetaContent />
</EntityLayout.Route>
```

You can also render the posts in a grid:

```ts
import { useEntity } from '@backstage/plugin-catalog-react';
import { Container } from '@material-ui/core';
import { stringifyEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { PostsGrid } from '@drodil/backstage-plugin-qeta-react';

export const QetaContent = () => {
  const { entity } = useEntity();

  return (
    <Container>
      <PostsGrid
        entity={stringifyEntityRef(entity)}
        showTitle={true}
        showAskButton={true}
        type="question" // Can be 'question' or 'article' or none
      />
    </Container>
  );
};
```

## Catalog module

Catalog module allows enriching entities with Q&A information.

To add the Q&A processor(s), you need to add the `@drodil/plugin-catalog-backend-module-qeta`
module to your backend as described in the
[README](../plugins/catalog-backend-module-qeta/README.md).
