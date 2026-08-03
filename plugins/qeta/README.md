# qeta

Welcome to the qeta plugin!

Qeta allows you to add Q&A section to your Backstage application.
This plugin requires that you also install
[@drodil/backstage-plugin-qeta-backend](https://www.npmjs.com/package/@drodil/backstage-plugin-qeta-backend)
plugin.

## Adding to your application

Add the plugin to your frontend app:

```bash
cd packages/app && yarn add @drodil/backstage-plugin-qeta
```

Register the plugin in your frontend app:

```ts
// packages/app/src/App.tsx
import { createApp } from '@backstage/frontend-defaults';
import qetaPlugin from '@drodil/backstage-plugin-qeta';

const app = createApp({
  features: [qetaPlugin],
});
```

An interface for Q&A is now available at `/qeta`.
