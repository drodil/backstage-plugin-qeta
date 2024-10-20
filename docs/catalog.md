# Integration with catalog

You can integrate list of questions ans question post form to the catalog page. Create a new component to
packages/app/src/components/catalog/EntityPage/content/QetaContent.tsx:

```ts
import { useEntity } from '@backstage/plugin-catalog-react';
import { Container } from '@material-ui/core';
import { stringifyEntityRef } from '@backstage/catalog-model';
import React from 'react';
import {
  AskForm,
  QuestionsContainer,
} from '@drodil/backstage-plugin-qeta-react';

export const QetaContent = () => {
  const { entity } = useEntity();

  return (
    <Container>
      <QuestionsContainer
        entity={stringifyEntityRef(entity)}
        showTitle={true}
        showAskButton={true}
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
