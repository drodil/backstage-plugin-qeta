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

This is how the UI will look like for new questions (`answerNewQuestion`):

![OpenAI](./images/openAi.png)

And for the question page (`answerExistingQuestion`):

![OpenAI](./images/openAiQuestionPage.png)

## OpenAI module

The OpenAI module is a reference implementation of the AI backend module. It uses the OpenAI API to answer questions.
To use it, you need to install the module and add it to your backend.

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

Additionally, you need to add the necessary config to your `app-config.yaml`:

```yaml
qeta:
  openai:
    apiKey: 'your-openai-key'
```

The config also allows to set the model, temperature, max tokens, and custom endpoint for the OpenAI API.

```yaml
qeta:
  openai:
    project: 'your-open-ai-project'
    organization: 'your-open-ai-organization'
    model: 'gpt-4o-mini' # defaults to gpt-3.5-turbo
    temperature: 0.5
    maxTokens: 100
```
