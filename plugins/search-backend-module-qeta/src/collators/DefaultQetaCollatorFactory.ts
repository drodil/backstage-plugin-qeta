import { Config } from '@backstage/config';
import { Readable } from 'stream';
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
import {
  QetaDocument,
  QuestionsResponseBody,
} from '@drodil/backstage-plugin-qeta-common';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';

export type QetaCollatorFactoryOptions = {
  logger: LoggerService;
  discovery: DiscoveryService;
  auth?: AuthService;
};

export class DefaultQetaCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'qeta';
  private readonly logger: LoggerService;
  private readonly discovery: DiscoveryService;
  private readonly auth?: AuthService;

  private constructor(_config: Config, options: QetaCollatorFactoryOptions) {
    this.logger = options.logger;
    this.discovery = options.discovery;
    this.auth = options.auth;
  }

  static fromConfig(config: Config, options: QetaCollatorFactoryOptions) {
    return new DefaultQetaCollatorFactory(config, options);
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<QetaDocument> {
    this.logger.info('Executing QetaCollator');
    let totalQuestions = Number.MAX_VALUE;
    let indexedQuestions = 0;
    const baseUrl = await this.discovery.getBaseUrl('qeta');

    while (totalQuestions > indexedQuestions) {
      let headers = {};

      if (this.auth) {
        const { token } = await this.auth.getPluginRequestToken({
          onBehalfOf: await this.auth.getOwnServiceCredentials(),
          targetPluginId: 'qeta',
        });
        headers = {
          Authorization: `Bearer ${token}`,
        };
      }

      const params = new URLSearchParams();
      params.append('includeAnswers', 'true');
      params.append('includeComments', 'true');
      params.append('orderBy', 'created');
      params.append('order', 'asc');
      params.append('limit', '50');
      params.append('offset', indexedQuestions.toString(10));
      const response = await fetch(
        `${baseUrl}/questions?${params.toString()}`,
        {
          headers,
        },
      );
      const data = (await response.json()) as QuestionsResponseBody;

      if (!data || 'errors' in data || !('questions' in data)) {
        this.logger.error(
          `Error while fetching questions from qeta: ${JSON.stringify(data)}`,
        );
        return;
      }

      const questions = data.questions;
      this.logger.info(`Indexing ${questions.length} questions`);
      totalQuestions = data.total;
      indexedQuestions += questions.length;

      for (const question of questions) {
        yield {
          title: question.title,
          text: question.content,
          location: `/qeta/questions/${question.id}`,
          docType: 'qeta',
          author: question.author,
          score: question.score,
          entityRefs: question.entities,
          answerCount: question.answersCount,
          views: question.views,
          tags: question.tags,
        };

        for (const answer of question.answers ?? []) {
          yield {
            title: `${
              answer.correct ? 'Correct answer' : 'Answer'
            } for question ${question.title}`,
            text: answer.content,
            location: `/qeta/questions/${question.id}#answer_${answer.id}`,
            docType: 'qeta',
            entityRefs: question.entities,
            author: answer.author,
            score: answer.score,
            tags: question.tags,
            correctAnswer: answer.correct,
          };

          for (const comment of answer.comments ?? []) {
            yield {
              title: `Comment for ${question.title}`,
              text: comment.content,
              location: `/qeta/questions/${question.id}#answer_${answer.id}`,
              docType: 'qeta',
              author: comment.author,
              score: answer.score,
              tags: question.tags,
              entityRefs: question.entities,
            };
          }
        }

        for (const comment of question.comments ?? []) {
          yield {
            title: `Comment for ${question.title}`,
            text: comment.content,
            location: `/qeta/questions/${question.id}`,
            docType: 'qeta',
            author: comment.author,
            score: question.score,
            tags: question.tags,
            entityRefs: question.entities,
          };
        }
      }
    }
  }
}
