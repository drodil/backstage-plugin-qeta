import { createBackend } from '@backstage/backend-defaults';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { PermissionPolicy } from './PermissionPolicy';
import { qetaAIExtensionPoint } from '@drodil/backstage-plugin-qeta-node';

const backend = createBackend();
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-events-backend'));
backend.add(import('@backstage/plugin-signals-backend'));
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(
  createBackendModule({
    pluginId: 'permission',
    moduleId: 'qeta-permission-policy',
    register(reg) {
      reg.registerInit({
        deps: {
          policy: policyExtensionPoint,
          discovery: coreServices.discovery,
          auth: coreServices.auth,
        },
        async init({ policy, auth, discovery }) {
          policy.setPolicy(new PermissionPolicy(auth, discovery));
        },
      });
    },
  }),
);
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
            async answerExistingQuestion(question) {
              // Wait for AI to think...
              await new Promise(resolve => setTimeout(resolve, 1000));
              return {
                answer: `42 is the "Answer to the Ultimate Question of Life, the Universe, and Everything", just like to ${question.title}`,
              };
            },
            async answerNewQuestion(title, _content) {
              // Wait for AI to think...
              await new Promise(resolve => setTimeout(resolve, 1000));
              return {
                answer: `42 is the "Answer to the Ultimate Question of Life, the Universe, and Everything", just like to ${title}`,
              };
            },
          });
        },
      });
    },
  }),
);

backend.add(import('../src'));

backend.start();
