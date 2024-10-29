import {
  BackstageCredentials,
  createExtensionPoint,
} from '@backstage/backend-plugin-api';
import { AIResponse, Question } from '@drodil/backstage-plugin-qeta-common';

export interface AIHandler {
  /**
   * Answer question that has already been posted in the question page
   */
  answerExistingQuestion?(
    question: Question,
    options?: { credentials?: BackstageCredentials },
  ): Promise<AIResponse>;

  /**
   * Answer a draft question in the Ask a question page
   */
  answerNewQuestion?(
    title: string,
    content: string,
    options?: { credentials?: BackstageCredentials },
  ): Promise<AIResponse>;
}

export interface QetaAIExtensionPoint {
  setAIHandler(handler: AIHandler): void;
}

export const qetaAIExtensionPoint = createExtensionPoint<QetaAIExtensionPoint>({
  id: 'qeta.ai',
});
