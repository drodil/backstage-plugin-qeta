# backstage-plugin-qeta-backend-module-openai

The openai backend module for the qeta plugin.

This plugin provides means to use OpenAI API to create answers to questions. It works
also as a reference for creating new AI backend modules for the qeta plugin.

## Installation

Installation starts by installing the backend module to the backend package.

```bash
yarn workspace backend add @drodil/backstage-plugin-qeta-backend-module-openai
```

Next, add it to your `packages/backend/src/index.ts`:

```ts
import { createBackend } from '@backstage/backend-defaults';
const backend = createBackend();
// ... other plugins
backend.add(import('@drodil/backstage-plugin-qeta-backend-module-openai'));
backend.start();
```

Additionally you need to add the necessary config to your `app-config.yaml`:

```yaml
qeta:
  openai:
    apiKey: 'your-openai-key'
```
