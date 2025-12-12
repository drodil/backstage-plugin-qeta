import { NotificationService } from '@backstage/plugin-notifications-node';
import {
  Answer,
  Collection,
  Post,
  PostType,
  removeMarkdownFormatting,
  selectByPostType,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import {
  AuthService,
  CacheService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { UserEntity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { NotificationReceiversHandler } from '@drodil/backstage-plugin-qeta-node';

export class NotificationManager {
  private readonly enabled: boolean;
  private readonly basePath: string;

  constructor(
    private readonly logger: LoggerService,
    private readonly catalog: CatalogApi,
    private readonly auth: AuthService,
    private readonly config: Config,
    private readonly notifications?: NotificationService,
    private readonly cache?: CacheService,
    private readonly notificationReceivers?: NotificationReceiversHandler,
  ) {
    this.enabled = config.getOptionalBoolean('qeta.notifications') ?? true;
    this.basePath = (
      this.config.getOptionalString('qeta.route') || 'qeta'
    ).replace(/^\/+|\/+$/g, '');
  }

  async onNewPost(
    username: string,
    post: Post,
    followingUsers: string[],
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled) {
      return [];
    }

    const notificationReceivers = [
      ...new Set<string>([
        ...(post?.entities ?? []),
        ...followingUsers,
        ...((await this.notificationReceivers?.onNewPost?.(post)) ?? []),
        ...(this.config.getOptionalStringArray(
          `qeta.notificationSettings.onCreate.${post.type}`,
        ) ?? []),
      ]),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
          excludeEntityRef: username,
        },
        payload: {
          title: `New ${post.type}`,
          description: this.formatDescription(
            selectByPostType(
              post.type,
              `${user} asked a question: ${post.title}`,
              `${user} wrote an article: ${post.title}`,
              `${user} created a link: ${post.title}`,
            ),
          ),
          link: this.selectPostRoute(post.type, post.id),
          topic: `New ${post.type} about entity`,
        },
      });
    } catch (e) {
      this.logger.error(
        `Failed to send notification for new ${post.type}: ${e}`,
      );
    }
    return notificationReceivers;
  }

  async onNewPostComment(
    username: string,
    post: Post,
    comment: string,
    followingUsers: string[],
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled) {
      return [];
    }

    const commenters = new Set<string>(post.comments?.map(c => c.author));

    const notificationReceivers = [
      ...new Set<string>([
        post.author,
        ...(post?.entities ?? []),
        ...commenters,
        ...followingUsers,
        ...((await this.notificationReceivers?.onNewPostComment?.(post)) ?? []),
        ...(this.config.getOptionalStringArray(
          'qeta.notificationSettings.onCreate.comment',
        ) ?? []),
      ]),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
          excludeEntityRef: username,
        },
        payload: {
          title: `New comment on ${post.type}`,
          description: this.formatDescription(
            `${user} commented on ${post.type} "${post.title}": ${comment}`,
          ),
          link: this.selectPostRoute(post.type, post.id),
          topic: `New ${post.type} comment`,
          scope: `${post.type}:comment:${post.id}`,
        },
      });
    } catch (e) {
      this.logger.error(
        `Failed to send notification for new post comment: ${e}`,
      );
    }
    return notificationReceivers;
  }

  async onPostDelete(
    username: string,
    post: Post,
    reason?: string,
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled || post.author === username) {
      return [];
    }

    const notificationReceivers = [
      ...new Set<string>([
        post.author,
        ...((await this.notificationReceivers?.onPostDelete?.(post)) ?? []),
        ...(this.config.getOptionalStringArray(
          `qeta.notificationSettings.onDelete.${post.type}`,
        ) ?? []),
      ]),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
        },
        payload: {
          title: `Deleted ${post.type}`,
          description: this.formatDescription(
            `${user} deleted your ${post.type} "${post.title}" with reason: ${
              reason || 'No reason provided'
            }`,
          ),
          link: this.selectPostRoute(post.type, post.id),
          topic: `${post.type} deleted`,
          scope: `${post.type}:delete:${post.id}`,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for post delete: ${e}`);
    }
    return [post.author];
  }

  async onCollectionDelete(
    username: string,
    collection: Collection,
    reason?: string,
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled || collection.owner === username) {
      return [];
    }

    const notificationReceivers = [
      ...new Set<string>([
        collection.owner,
        ...((await this.notificationReceivers?.onCollectionDelete?.(
          collection,
        )) ?? []),
        ...(this.config.getOptionalStringArray(
          `qeta.notificationSettings.onDelete.collection`,
        ) ?? []),
      ]),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
        },
        payload: {
          title: `Deleted collection`,
          description: this.formatDescription(
            `${user} deleted your collection "${
              collection.title
            }" with reason: ${reason || 'No reason provided'}`,
          ),
          link: `/${this.basePath}/collections/${collection.id}`,
          topic: `Collection deleted`,
          scope: `collection:delete:${collection.id}`,
        },
      });
    } catch (e) {
      this.logger.error(
        `Failed to send notification for collection delete: ${e}`,
      );
    }
    return [collection.owner];
  }

  async onAnswerDelete(
    username: string,
    post: Post,
    answer: Answer,
    reason?: string,
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled || answer.author === username) {
      return [];
    }

    const notificationReceivers = [
      ...new Set<string>([
        answer.author,
        ...((await this.notificationReceivers?.onAnswerDelete?.(
          post,
          answer,
        )) ?? []),
        ...(this.config.getOptionalStringArray(
          `qeta.notificationSettings.onDelete.answer`,
        ) ?? []),
      ]),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
        },
        payload: {
          title: `Deleted answer`,
          description: this.formatDescription(
            `${user} deleted your answer from question "${
              post.title
            }" with reason: ${reason || 'No reason provided'}`,
          ),
          link: `/${this.basePath}/questions/${post.id}`,
          topic: `Answer deleted`,
          scope: `answer:delete:${answer.id}`,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for answer delete: ${e}`);
    }
    return [answer.author];
  }

  async onPostEdit(
    username: string,
    post: Post,
    followingUsers: string[],
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled) {
      return [];
    }

    const notificationReceivers = [
      ...new Set<string>([post.author, ...followingUsers]),
      ...((await this.notificationReceivers?.onPostEdit?.(post)) ?? []),
      ...(this.config.getOptionalStringArray(
        `qeta.notificationSettings.onUpdate.${post.type}`,
      ) ?? []),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
          excludeEntityRef: username,
        },
        payload: {
          title: `Edit for ${post.type}`,
          description: this.formatDescription(
            `${user} edited ${post.type}: ${post.title}`,
          ),
          link: this.selectPostRoute(post.type, post.id),
          topic: `${post.type} edited`,
          scope: `${post.type}:edit:${post.id}`,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for post edit: ${e}`);
    }
    return notificationReceivers;
  }

  async onNewAnswer(
    username: string,
    question: Post,
    answer: Answer,
    followingUsers: string[],
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled) {
      return [];
    }

    const notificationReceivers = [
      ...new Set<string>([
        question.author,
        ...(question?.entities ?? []),
        ...followingUsers,
        ...((await this.notificationReceivers?.onNewAnswer?.(
          question,
          answer,
        )) ?? []),
        ...(this.config.getOptionalStringArray(
          `qeta.notificationSettings.onCreate.answer`,
        ) ?? []),
      ]),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
          excludeEntityRef: username,
        },
        payload: {
          title: `New answer on question`,
          description: this.formatDescription(
            `${user} answered question "${question.title}": ${answer.content}`,
          ),
          link: `/${this.basePath}/questions/${question.id}#answer_${answer.id}`,
          topic: 'New answer on question',
          scope: `question:answer:${question.id}:author`,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for new answer: ${e}`);
    }
    return notificationReceivers;
  }

  async onAnswerComment(
    username: string,
    question: Post,
    answer: Answer,
    comment: string,
    followingUsers: string[],
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled) {
      return [];
    }

    const commenters = new Set<string>(answer.comments?.map(c => c.author));

    const notificationReceivers = [
      ...new Set<string>([
        answer.author,
        ...commenters,
        ...(question?.entities ?? []),
        ...followingUsers,
        ...((await this.notificationReceivers?.onAnswerComment?.(
          question,
          answer,
        )) ?? []),
        ...(this.config.getOptionalStringArray(
          'qeta.notificationSettings.onCreate.comment',
        ) ?? []),
      ]),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
          excludeEntityRef: username,
        },
        payload: {
          title: `New comment on answer`,
          description: this.formatDescription(
            `${user} commented on answer to "${question.title}": ${comment}`,
          ),
          link: `/${this.basePath}/questions/${question.id}#answer_${answer.id}`,
          topic: 'New answer comment',
          scope: `answer:comment:${answer.id}`,
        },
      });
    } catch (e) {
      this.logger.error(
        `Failed to send notification for new answer comment: ${e}`,
      );
    }
    return notificationReceivers;
  }

  async onCorrectAnswer(
    username: string,
    question: Post,
    answer: Answer,
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled) {
      return [];
    }

    const notificationReceivers = [
      ...new Set<string>([
        answer.author,
        question.author,
        ...(question?.entities ?? []),
        ...((await this.notificationReceivers?.onCorrectAnswer?.(
          question,
          answer,
        )) ?? []),
      ]),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
          excludeEntityRef: username,
        },
        payload: {
          title: `Correct answer on question`,
          description: this.formatDescription(
            `${user} marked answer as correct: ${answer.content}`,
          ),
          link: `/${this.basePath}/questions/${question.id}#answer_${answer.id}`,
          topic: 'Correct answer on question',
          scope: `question:correct:${question.id}:answer`,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for correct answer: ${e}`);
    }
    return notificationReceivers;
  }

  async onMention(
    username: string,
    post: Post | Answer,
    mentions: string[],
    alreadySent: string[],
    isComment?: boolean,
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled) {
      return [];
    }

    const notificationReceivers = [
      ...new Set<string>([
        ...mentions.map(m => m.replaceAll('@', '')),
        ...((await this.notificationReceivers?.onMention?.(post)) ?? []),
      ]),
    ].filter(m => !alreadySent.includes(m));

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      const isPost = 'title' in post;
      const description = isPost
        ? `${user} mentioned you in a post${isComment ? ' comment' : ''}: ${
            post.title
          }`
        : `${user} mentioned you in an answer${isComment ? ' comment' : ''}: ${
            post.content
          }`;
      const link = !isPost
        ? `/${this.basePath}/questions/${post.postId}#answer_${post.id}`
        : this.selectPostRoute(post.type, post.id);
      const scope = isPost
        ? `post:mention:${post.id}`
        : `answer:mention:${post.id}`;

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
          excludeEntityRef: username,
        },
        payload: {
          title: `New mention`,
          description: this.formatDescription(description),
          link,
          topic: 'New mention',
          scope,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for mentions: ${e}`);
    }
    return notificationReceivers;
  }

  async onNewCollection(
    username: string,
    collection: Collection,
    followingUsers: string[],
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled || followingUsers.length === 0) {
      return [];
    }

    const notificationReceivers = [
      ...new Set<string>([
        ...followingUsers,
        ...((await this.notificationReceivers?.onNewCollection?.(collection)) ??
          []),
        ...(this.config.getOptionalStringArray(
          'qeta.notificationSettings.onCreate.collection',
        ) ?? []),
      ]),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      const description = `${user} created a new collection: ${collection.title}`;
      // eslint-disable-next-line no-nested-ternary
      const link = `/${this.basePath}/collections/${collection.id}`;
      const scope = `collection:${collection.id}:created`;

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
          excludeEntityRef: username,
        },
        payload: {
          title: `New collection`,
          description: this.formatDescription(description),
          link,
          topic: 'New collection',
          scope,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for collection: ${e}`);
    }
    return followingUsers;
  }

  async onNewPostToCollection(
    username: string,
    collection: Collection,
    followingUsers: string[],
  ): Promise<string[]> {
    if (!this.notifications || !this.enabled || followingUsers.length === 0) {
      return [];
    }

    const notificationReceivers = [
      ...new Set<string>([
        ...followingUsers,
        ...((await this.notificationReceivers?.onNewCollection?.(collection)) ??
          []),
        ...(this.config.getOptionalStringArray(
          'qeta.notificationSettings.onUpdate.collection',
        ) ?? []),
      ]),
    ];

    if (notificationReceivers.length === 0) {
      return [];
    }

    try {
      const user = await this.getUserDisplayName(username);

      const description = `${user} added a new post to ${collection.title}`;
      // eslint-disable-next-line no-nested-ternary
      const link = `/${this.basePath}/collections/${collection.id}`;
      const scope = `collection:${collection.id}:new_post`;

      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: notificationReceivers,
          excludeEntityRef: username,
        },
        payload: {
          title: `New post in collection`,
          description: this.formatDescription(description),
          link,
          topic: 'New post in collection',
          scope,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for collection: ${e}`);
    }
    return followingUsers;
  }

  private async getUserDisplayName(username: string) {
    try {
      const cached = await this.cache?.get<string>(
        `user:displayName:${username}`,
      );
      if (cached) {
        return cached;
      }

      const { token } = await this.auth.getPluginRequestToken({
        onBehalfOf: await this.auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entity = await this.catalog.getEntityByRef(username, { token });
      if (entity) {
        const displayName =
          (entity as UserEntity).spec?.profile?.displayName ??
          entity.metadata.title ??
          entity.metadata.name;
        await this.cache?.set(`user:displayName:${username}`, displayName, {
          ttl: 1000 * 60 * 60 * 24,
        });
        return displayName;
      }
    } catch (e) {
      console.error(e);
    }
    return username;
  }

  private formatDescription(description: string) {
    return truncate(removeMarkdownFormatting(description), 150);
  }

  private selectPostRoute(type: PostType, id: number) {
    const questionRoute = `/${this.basePath}/questions/${id}`;
    const articleRoute = `/${this.basePath}/articles/${id}`;
    const linkRoute = `/${this.basePath}/links/${id}`;
    return selectByPostType(type, questionRoute, articleRoute, linkRoute);
  }
}
