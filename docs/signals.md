# Integration with signals

This plugin integrates with the [`@backstage/plugin-signals`](https://github.com/backstage/backstage/tree/master/plugins/signals)
plugin. It provides real time updates to frontend from the backend.

At the moment, only question and answer statistics are updated in real time.

To integrate with signals, install `signals-backend` and add it to the backend:

```ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/signals-backend'));
backend.add(import('@drodil/backstage-plugin-qeta-backend'));

backend.start();
```
