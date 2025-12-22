import {
  BackstageCredentials,
  BackstageUserPrincipal,
  createExtensionPoint,
} from '@backstage/backend-plugin-api';
import {
  AIResponse,
  Answer,
  Article,
  Badge,
  Collection,
  Post,
  QetaIdEntity,
  Question,
  UserResponse,
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

export interface NotificationReceiversHandler {
  onNewPost?(post: Post): Promise<string[]>;
  onNewPostComment?(post: Post): Promise<string[]>;
  onPostDelete?(post: Post): Promise<string[]>;
  onCollectionDelete?(collection: Collection): Promise<string[]>;
  onAnswerDelete?(post: Post, answer: Answer): Promise<string[]>;
  onPostEdit?(post: Post): Promise<string[]>;
  onNewAnswer?(post: Post, answer: Answer): Promise<string[]>;
  onAnswerComment?(post: Post, answer: Answer): Promise<string[]>;
  onCorrectAnswer?(post: Post, answer: Answer): Promise<string[]>;
  onMention?(post: Post | Answer): Promise<string[]>;
  onNewCollection?(collection: Collection): Promise<string[]>;
  onNewPostToCollection?(collection: Collection): Promise<string[]>;
}

export interface QetaNotificationReceiversExtensionPoint {
  setHandler(handler: NotificationReceiversHandler): void;
}

export const qetaNotificationReceiversExtensionPoint =
  createExtensionPoint<QetaNotificationReceiversExtensionPoint>({
    id: 'qeta.notifications',
  });

export interface BadgeEvaluator extends Omit<Badge, 'id'> {
  evaluate?(entity: QetaIdEntity): Promise<boolean>;

  evaluateCollection?(entities: QetaIdEntity[]): Promise<boolean>;

  evaluateUser?(user: UserResponse): Promise<boolean>;
}

export interface QetaBadgeEvaluatorExtensionPoint {
  addEvaluator(evaluator: BadgeEvaluator): void;
}

export const qetaBadgeEvaluatorExtensionPoint =
  createExtensionPoint<QetaBadgeEvaluatorExtensionPoint>({
    id: 'qeta.badges',
  });
