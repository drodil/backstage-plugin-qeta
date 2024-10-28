# Artificial Intelligence integration

To utilize the AI capabilities of the plugin, you must create a new backend module that will handle the AI requests.
In short, it should look like this:

```ts
import { qetaAiExtensionPoint } from '@drodil/backstage-plugin-qeta-node';

backend.add(
  createBackendModule({
    pluginId: 'qeta',
    moduleId: 'example-ai-handler',
    register(reg) {
      reg.registerInit({
        deps: {
          ai: qetaAIExtensionPoint,
        },
        async init({ ai }) {
          ai.setAIHandler({
            async recommendAnswer(question) {
              // Your AI logic here, call API, run a model, etc.
              return { response: 'Answer' };
            },
          });
        },
      });
    },
  }),
);
```

Of course, it makes sense to create a separate module for this functionality, but this is the basic idea.

This will show the recommended answer on the question page. More AI features will be added in the future and you can
select which ones to use by implementing the `AiHandler` interface.
