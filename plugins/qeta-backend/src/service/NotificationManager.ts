import { NotificationService } from '@backstage/plugin-notifications-node';
import type { Answer, Question } from '@drodil/backstage-plugin-qeta-common';
import { LoggerService } from '@backstage/backend-plugin-api';

export class NotificationManager {
  constructor(
    private readonly logger: LoggerService,
    private readonly notifications?: NotificationService,
  ) {}

  async onNewQuestion(username: string, question: Question) {
    if (
      !this.notifications ||
      !question.entities ||
      question.entities.length === 0
    ) {
      return;
    }

    try {
      await this.notifications.send({
        recipients: { type: 'entity', entityRef: question.entities },
        payload: {
          title: `New question about your entity`,
          description: this.formatDescription(
            `${username} asked a question about your entity: ${question.title}`,
          ),
          link: `/qeta/questions/${question.id}`,
          topic: 'New question',
        },
      });
    } catch (e) {
      this.logger.error(`Failed to send notification for new question: ${e}`);
    }
  }

  async onNewQuestionComment(
    username: string,
    question: Question,
    comment: string,
  ) {
    if (!this.notifications || question.author === username) {
      return;
    }

    try {
      await this.notifications.send({
        recipients: { type: 'entity', entityRef: question.author },
        payload: {
          title: `New comment on your question`,
          description: this.formatDescription(
            `${username} commented on your question: ${comment}`,
          ),
          link: `/qeta/questions/${question.id}`,
          topic: 'New question comment',
          scope: `question:comment:${question.id}`,
        },
      });

      const commenters = new Set<string>(
        question.comments?.map(c => c.author).filter(a => a !== username),
      );
      if (commenters.size > 0) {
        await this.notifications.send({
          recipients: { type: 'entity', entityRef: Array.from(commenters) },
          payload: {
            title: `New comment on question you commented`,
            description: this.formatDescription(
              `${username} commented on a question you commented: ${comment}`,
            ),
            link: `/qeta/questions/${question.id}`,
            topic: 'New question comment',
            scope: `question:comment:${question.id}`,
          },
        });
      }
    } catch (e) {
      this.logger.error(
        `Failed to send notification for new question comment: ${e}`,
      );
    }
  }

  async onNewAnswer(username: string, question: Question, answer: Answer) {
    if (!this.notifications) {
      return;
    }

    try {
      if (question.author !== username) {
        await this.notifications.send({
          recipients: { type: 'entity', entityRef: question.author },
          payload: {
            title: `New answer on your question`,
            description: this.formatDescription(
              `${username} answered your question: ${answer.content}`,
            ),
            link: `/qeta/questions/${question.id}#answer_${answer.id}`,
            topic: 'New answer on your question',
            scope: `question:answer:${question.id}:author`,
          },
        });
      }

      if (question.entities && question.entities.length > 0) {
        await this.notifications.send({
          recipients: { type: 'entity', entityRef: question.entities },
          payload: {
            title: `New answer on question about your entity`,
            description: this.formatDescription(
              `${username} answered a question about your entity: ${answer.content}`,
            ),
            link: `/qeta/questions/${question.id}#answer_${answer.id}`,
            topic: 'New answer on entity question',
            scope: `question:answer:${question.id}:entity`,
          },
        });
      }
    } catch (e) {
      this.logger.error(`Failed to send notification for new answer: ${e}`);
    }
  }

  async onAnswerComment(
    username: string,
    question: Question,
    answer: Answer,
    comment: string,
  ) {
    if (!this.notifications || answer.author === username) {
      return;
    }

    try {
      await this.notifications.send({
        recipients: { type: 'entity', entityRef: answer.author },
        payload: {
          title: `New comment on your answer`,
          description: this.formatDescription(
            `${username} commented your answer: ${comment}`,
          ),
          link: `/qeta/questions/${question.id}#answer_${answer.id}`,
          topic: 'New answer comment',
          scope: `answer:comment:${answer.id}`,
        },
      });

      const commenters = new Set<string>(
        answer.comments?.map(c => c.author).filter(a => a !== username),
      );
      if (commenters.size > 0) {
        await this.notifications.send({
          recipients: { type: 'entity', entityRef: Array.from(commenters) },
          payload: {
            title: `New comment on answer you commented`,
            description: this.formatDescription(
              `${username} commented on an answer you commented: ${comment}`,
            ),
            link: `/qeta/questions/${question.id}#answer_${answer.id}`,
            topic: 'New answer comment',
            scope: `answer:comment:${answer.id}`,
          },
        });
      }
    } catch (e) {
      this.logger.error(
        `Failed to send notification for new answer comment: ${e}`,
      );
    }
  }

  async onCorrectAnswer(username: string, question: Question, answer: Answer) {
    if (!this.notifications) {
      return;
    }

    try {
      if (answer.author !== username) {
        await this.notifications.send({
          recipients: { type: 'entity', entityRef: answer.author },
          payload: {
            title: `Correct answer on question`,
            description: this.formatDescription(
              `${username} marked your answer as correct: ${answer.content}`,
            ),
            link: `/qeta/questions/${question.id}#answer_${answer.id}`,
            topic: 'Correct answer on question',
            scope: `question:correct:${question.id}:answer`,
          },
        });
      }

      if (question.entities && question.entities.length > 0) {
        await this.notifications.send({
          recipients: { type: 'entity', entityRef: question.entities },
          payload: {
            title: `Correct answer on question about your entity`,
            description: this.formatDescription(
              `${username} marked answer correct on question about your entity: ${answer.content}`,
            ),
            link: `/qeta/questions/${question.id}#answer_${answer.id}`,
            topic: 'Correct answer on entity question',
            scope: `question:correct:${question.id}:entity`,
          },
        });
      }
    } catch (e) {
      this.logger.error(`Failed to send notification for correct answer: ${e}`);
    }
  }

  private formatDescription(description: string) {
    return description.length >= 103
      ? `${description.slice(0, 100)}...`
      : description;
  }
}
