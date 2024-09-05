# backstage-plugin-scaffolder-backend-module-qeta

Allows adding Q&A related scaffolder actions to Backstage.

Installing the plugin:

```shell
yarn add --cwd packages/backend @drodil/backstage-plugin-scaffolder-backend-module-qeta
```

Then, add the plugin to the Backstage instance in `packages/backend/src/index.ts`:

```typescript
backend.add(import('@drodil/backstage-plugin-scaffolder-backend-module-qeta'));
```
