# @internal/plugin-catalog-backend-module-qeta

The qeta backend module for the catalog plugin.

## Installation

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';
  const backend = createBackend();
  // ... other feature additions
+ backend.add(import('@drodil/backstage-plugin-catalog-backend-module-qeta'));
  backend.start();
```

## Processors

- `CatalogEntityLinkProcessor`: Adds `qeta` links in catalog entities.
