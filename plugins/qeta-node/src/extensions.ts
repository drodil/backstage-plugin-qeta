import { createExtensionPoint } from '@backstage/backend-plugin-api';
import { Question } from '@drodil/backstage-plugin-qeta-common';

export interface AIHandler {
  recommendAnswer?(question: Question): Promise<{ response: string }>;
}

export interface QetaAIExtensionPoint {
  setAIHandler(handler: AIHandler): void;
}

export const qetaAIExtensionPoint = createExtensionPoint<QetaAIExtensionPoint>({
  id: 'qeta.ai',
});
