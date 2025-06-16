import {
  BackstageCredentials,
  BackstageUserPrincipal,
  createExtensionPoint,
} from '@backstage/backend-plugin-api';
import {
  AIResponse,
  Article,
  Question,
} from '@drodil/backstage-plugin-qeta-common';

export interface AIHandler {
  /**
   * Answer question that has already been posted in the question page
   */
  answerExistingQuestion?(
    question: Question,
    options?: { credentials?: BackstageCredentials<BackstageUserPrincipal> },
  ): Promise<AIResponse>;

  /**
   * Answer a draft question in the Ask a question page
   */
  answerNewQuestion?(
    title: string,
    content: string,
    options?: { credentials?: BackstageCredentials<BackstageUserPrincipal> },
  ): Promise<AIResponse>;

  /**
   * Summarize article
   */
  summarizeArticle?(
    article: Article,
    options?: { credentials?: BackstageCredentials<BackstageUserPrincipal> },
  ): Promise<AIResponse>;

  /**
   * Suggest tags based on post title and content
   */
  suggestTags?(
    title: string,
    content: string,
    options?: { credentials?: BackstageCredentials<BackstageUserPrincipal> },
  ): Promise<{ tags: string[] }>;

  /**
   * Check if answering existing questions is enabled for specific credentials. Defaults to true.
   * Must also implement the `answerExistingQuestion` method.
   */
  isExistingQuestionEnabled?(options?: {
    credentials?: BackstageCredentials;
  }): Promise<boolean>;

  /**
   * Check if answering new questions is enabled for specific credentials. Defaults to true.
   * Must also implement the `answerNewQuestion` method.
   */
  isNewQuestionEnabled?(options?: {
    credentials?: BackstageCredentials;
  }): Promise<boolean>;

  /**
   * Check if article summarization is enabled for specific credentials. Defaults to true.
   * Must also implement the `summarizeArticle` method.
   */
  isArticleSummarizationEnabled?(options?: {
    credentials?: BackstageCredentials;
  }): Promise<boolean>;
}

export interface QetaAIExtensionPoint {
  setAIHandler(handler: AIHandler): void;
}

export interface TagDatabase {
  /**
   * Get custom tag descriptions that are updated to the plugin.
   * The format is {`tag name`: `tag description`}.
   */
  getTags(): Promise<Record<string, string>>;
}

export interface QetaTagDatabaseExtensionPoint {
  setTagDatabase(tagDatabase: TagDatabase): void;
}

export const qetaAIExtensionPoint = createExtensionPoint<QetaAIExtensionPoint>({
  id: 'qeta.ai',
});

export const qetaTagDatabaseExtensionPoint =
  createExtensionPoint<QetaTagDatabaseExtensionPoint>({
    id: 'qeta.tags',
  });
