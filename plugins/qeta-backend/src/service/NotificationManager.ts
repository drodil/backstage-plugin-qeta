import { NotificationService } from '@backstage/plugin-notifications-node';
import type { Answer, Question } from '@drodil/backstage-plugin-qeta-common';
import { LoggerService } from '@backstage/backend-plugin-api';

export class NotificationManager {
  constructor(
    private readonly logger: LoggerService,
    private readonly notifications?: NotificationService,
  ) {}

  async onNewQuestion(question: Question) {
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
          description: `${question.title}`,
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
          description: `${comment}`,
          link: `/qeta/questions/${question.id}`,
          topic: 'New question comment',
          scope: `question:comment:${question.id}`,
        },
      });
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
            description: `${answer.content}`,
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
            description: `${answer.content}`,
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
          description: `${comment}`,
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
            description: `${answer.content}`,
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
            description: `${answer.content}`,
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
}
