# Artificial Intelligence integration

To utilize the AI capabilities of the plugin, you must create a new backend module that will handle the AI requests.
In short, it should look like this:

```ts
import { qetaAIExtensionPoint } from '@drodil/backstage-plugin-qeta-node';

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
            /**
             This function is used to answer an existing question that is already in the database.
             The result will be shown in the question page.
             */
            async answerExistingQuestion(question, options) {
              if (options.credentials) {
                // The callee credentials will be passed here so you can do additional checks
                // for authorization if needed
              }
              // Your AI logic here, call API, run a model, etc.
              return { answer: 'Answer' };
            },
            /**
             This function is used to answer a new question that is not in the database but is
             still being written in the Ask a question page. The result will be shown in the 
             bottom of the ask form.
             */
            async answerNewQuestion(title, content, options) {
              // Your AI logic here, call API, run a model, etc.
              return {
                answer: 'Answer',
              };
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
