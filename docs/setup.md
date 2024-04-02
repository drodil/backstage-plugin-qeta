# Setup

## Backend

Add the plugin to your backend app:

```bash
cd packages/backend && yarn add @drodil/backstage-plugin-qeta-backend
```

In your `packages/backend/src/index.ts` make the following changes:

```ts
import { createBackend } from '@backstage/backend-defaults';
const backend = createBackend();
// ... other plugins
backend.add(import('@drodil/backstage-plugin-qeta-backend'));
backend.start();
```

For additional features, see [permissions](permissions.md), [events](events.md), [signals](signals.md), and [search](search.md).

## Frontend

Add the plugin to your frontend app:

```bash
cd packages/app && yarn add @drodil/backstage-plugin-qeta
```

Expose the questions page:

```ts
// packages/app/src/App.tsx
import { QetaPage } from '@drodil/backstage-plugin-qeta';

// ...

const AppRoutes = () => (
  <FlatRoutes>
    // ...
    <Route path="/qeta" element={<QetaPage title="Questions" />} />
    // ...
  </FlatRoutes>
);
```

Add the navigation in the frontend:

```ts
// packages/app/src/components/Root/Root.tsx
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
// ...
export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    // ...
    <SidebarItem icon={LiveHelpIcon} to="qeta" text="Q&A" />
    // ...
  </SidebarPage>
);
```

An interface for Q&A is now available at `/qeta`.

QetaPage also takes optional properties if you want to change the page title/subtitle/elements shown in the header.

### Adding questions to entity page

You can also add questions list to any entity page. This will render questions related to that entity. First
create the questions component:

```ts
import { useEntity } from '@backstage/plugin-catalog-react';
import { Container } from '@material-ui/core';
import { stringifyEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { QuestionsContainer } from '@drodil/backstage-plugin-qeta';

export const QetaContent = () => {
  const { entity } = useEntity();

  return (
    <Container>
      <QuestionsContainer entity={stringifyEntityRef(entity)} showTitle />
    </Container>
  );
};
```

Then add it to your entity page:

```ts
// EntityPage.tsx
<EntityLayout.Route path="/qeta" title="Q&A">
    <QetaContent />
</EntityLayout.Route>,
```

## Importing content from another system

You can use the backend API to import content via the question, answer, and comment endpoints. If you set `allowMetadataInput` to `true` in your config, you can also pass in the `created` and `user` fields in to preserve this metadata from another system. For POST requests, you can pass these as keys in the JSON payload. For GET requests, you can pass the username with a `x-qeta-user` header.

To import content, you most probably want to create a script for this. Here's a simple example of how you can do this:

```python
import requests

r = requests.get('https://my-old-system.com/questions', auth=('user', 'pass'))
questions = r.json()

for question in questions:
    # Modify the data to fit the Qeta schema
    question_data = {
        'title': question['title'],
        'content': question['body'],
        'tags': question['tags'],
        'user': question['owner'].get('displayName', 'user:default/guest'),
        'created': question['creation_date'],
    }
    q = requests.post('http://localhost:7000/qeta/questions', json=question_data, auth=('user', 'pass'))

    a = requests.get(f'https://my-old-system.com/questions/{question["id"]}/answers', auth=('user', 'pass'))
    answers = a.json()

    for answer in answers:
        # Modify the data to fit the Qeta schema
        answer_data = {
            'answer': answer['body'],
            'user': answer['owner'].get('displayName', 'user:default/guest'),
            'created': answer['creation_date'],
        }
        requests.post(f'http://localhost:7000/qeta/questions/{q.json()["id"]}/answers', json=answer_data, auth=('user', 'pass'))
```

Of course, you have to remember to modify the data depending on the source system. For example the user field references to the Backstage entity references so some modification is required and there are other fields that probably need changes.

Additionally, this example does not migrate comments and attachments which might need additional mapping.

If you come up with a script to migrate data from some external system, feel free to contribute it to this repository under `scripts` directory.
