# Setup

## Backend

Add the plugin to your backend app:

```bash
cd packages/backend && yarn add @drodil/backstage-plugin-qeta-backend
```

Create new file to packages/backend/src/plugins/qeta.ts:

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
}: PluginEnvironment) {
  const db = await DatabaseQetaStore.create({
    database: database,
  });
  return createRouter({
    logger,
    database: db,
    identity,
    config,
  });
}
```

Now add this plugin to your packages/backend/src/index.ts:

```ts
import qeta from './plugins/qeta';
const qetaEnv = useHotMemoize(module, () => createEnv('qeta'));
apiRouter.use('/qeta', await qeta(qetaEnv));
```

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
