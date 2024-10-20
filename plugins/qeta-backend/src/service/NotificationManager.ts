import { NotificationService } from '@backstage/plugin-notifications-node';
import {
  Answer,
  Post,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { LoggerService } from '@backstage/backend-plugin-api';

export class NotificationManager {
  constructor(
    private readonly logger: LoggerService,
    private readonly notifications?: NotificationService,
  ) {}

  async onNewPost(username: string, post: Post, followingUsers: string[]) {
    if (!this.notifications) {
      return;
    }

    const notificationReceivers = new Set<string>([
      ...(post?.entities ?? []),
      ...followingUsers,
    ]);

    try {
      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: [...notificationReceivers],
          excludeEntityRef: username,
        },
        payload: {
          title: `New ${post.type}`,
          description: this.formatDescription(
            post.type === 'question'
              ? `${username} asked a question: ${post.title}`
              : `${username} wrote an article: ${post.title}`,
          ),
          link:
            post.type === 'question'
              ? `/qeta/questions/${post.id}`
              : `/qeta/articles/${post.id}`,
          topic: 'New post about entity',
        },
      });
    } catch (e) {
      this.logger.error(
        `Failed to send notification for new ${post.type}: ${e}`,
      );
    }
  }

  async onNewPostComment(
    username: string,
    post: Post,
    comment: string,
    followingUsers: string[],
  ) {
    if (!this.notifications) {
      return;
    }

    const commenters = new Set<string>(post.comments?.map(c => c.author));

    const notificationReceivers = new Set<string>([
      post.author,
      ...(post?.entities ?? []),
      ...commenters,
      ...followingUsers,
    ]);

    try {
      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: [...notificationReceivers],
          excludeEntityRef: username,
        },
        payload: {
          title: `New comment on ${post.type}`,
          description: this.formatDescription(
            `${username} commented on ${post.type}: ${comment}`,
          ),
          link: `/qeta/questions/${post.id}`,
          topic: 'New post comment',
          scope: `question:comment:${post.id}`,
        },
      });
    } catch (e) {
      this.logger.error(
        `Failed to send notification for new post comment: ${e}`,
      );
    }
  }

  async onNewAnswer(
    username: string,
    question: Post,
    answer: Answer,
    followingUsers: string[],
  ) {
    if (!this.notifications) {
      return;
    }

    const notificationReceivers = new Set<string>([
      question.author,
      ...(question?.entities ?? []),
      ...followingUsers,
    ]);

    try {
      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: [...notificationReceivers],
          excludeEntityRef: username,
        },
        payload: {
          title: `New answer on question`,
          description: this.formatDescription(
            `${username} answered question: ${answer.content}`,
          ),
          link: `/qeta/questions/${question.id}#answer_${answer.id}`,
          topic: 'New answer on question',
          scope: `question:answer:${question.id}:author`,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for new answer: ${e}`);
    }
  }

  async onAnswerComment(
    username: string,
    question: Post,
    answer: Answer,
    comment: string,
    followingUsers: string[],
  ) {
    if (!this.notifications) {
      return;
    }

    const commenters = new Set<string>(answer.comments?.map(c => c.author));

    const notificationReceivers = new Set<string>([
      answer.author,
      ...commenters,
      ...(question?.entities ?? []),
      ...followingUsers,
    ]);

    try {
      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: [...notificationReceivers],
          excludeEntityRef: username,
        },
        payload: {
          title: `New comment on answer`,
          description: this.formatDescription(
            `${username} commented answer: ${comment}`,
          ),
          link: `/qeta/questions/${question.id}#answer_${answer.id}`,
          topic: 'New answer comment',
          scope: `answer:comment:${answer.id}`,
        },
      });
    } catch (e) {
      this.logger.error(
        `Failed to send notification for new answer comment: ${e}`,
      );
    }
  }

  async onCorrectAnswer(username: string, question: Post, answer: Answer) {
    if (!this.notifications) {
      return;
    }

    const notificationReceivers = new Set<string>([
      answer.author,
      question.author,
      ...(question?.entities ?? []),
    ]);

    try {
      await this.notifications.send({
        recipients: {
          type: 'entity',
          entityRef: [...notificationReceivers],
          excludeEntityRef: username,
        },
        payload: {
          title: `Correct answer on question`,
          description: this.formatDescription(
            `${username} marked answer as correct: ${answer.content}`,
          ),
          link: `/qeta/questions/${question.id}#answer_${answer.id}`,
          topic: 'Correct answer on question',
          scope: `question:correct:${question.id}:answer`,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for correct answer: ${e}`);
    }
  }

  private formatDescription(description: string) {
    return truncate(removeMarkdownFormatting(description), 150);
  }
}
