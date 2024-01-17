import { Config } from '@backstage/config';
import {
  PluginEndpointDiscovery,
  TokenManager,
} from '@backstage/backend-common';
import { Readable } from 'stream';
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
import {
  QetaDocument,
  QuestionsResponseBody,
} from '@drodil/backstage-plugin-qeta-common';
import { LoggerService } from '@backstage/backend-plugin-api';

export type QetaCollatorFactoryOptions = {
  logger: LoggerService;
  discovery: PluginEndpointDiscovery;
  tokenManager?: TokenManager;
};

export class DefaultQetaCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'qeta';
  private readonly logger: LoggerService;
  private readonly discovery: PluginEndpointDiscovery;
  private readonly tokenManager?: TokenManager;

  private constructor(_config: Config, options: QetaCollatorFactoryOptions) {
    this.logger = options.logger;
    this.discovery = options.discovery;
    this.tokenManager = options.tokenManager;
  }

  static fromConfig(config: Config, options: QetaCollatorFactoryOptions) {
    return new DefaultQetaCollatorFactory(config, options);
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<QetaDocument> {
    this.logger.info('Executing QetaCollator');
    let headers = {};

    if (this.tokenManager) {
      const { token } = await this.tokenManager.getToken();
      headers = {
        Authorization: `Bearer ${token}`,
      };
    }
    const baseUrl = await this.discovery.getBaseUrl('qeta');

    const params = new URLSearchParams();
    params.append('includeAnswers', 'true');
    params.append('includeComments', 'true');
    const response = await fetch(`${baseUrl}/questions?${params.toString()}`, {
      headers,
    });
    const data = (await response.json()) as QuestionsResponseBody;

    if (!data || 'errors' in data) {
      this.logger.error(
        `Error while fetching questions from qeta: ${JSON.stringify(data)}`,
      );
      return;
    }

    const questions = data.questions ?? [];
    this.logger.info(`Indexing ${questions.length} questions`);

    for (const question of questions) {
      yield {
        title: question.title,
        text: question.content,
        location: `/qeta/questions/${question.id}`,
        docType: 'qeta',
        author: question.author,
        score: question.score,
        answerCount: question.answersCount,
        views: question.views,
        tags: question.tags,
      };

      for (const answer of question.answers ?? []) {
        yield {
          title: `Answer for ${question.title}`,
          text: answer.content,
          location: `/qeta/questions/${question.id}#answer_${answer.id}`,
          docType: 'qeta',
          author: answer.author,
          score: answer.score,
          tags: question.tags,
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
        };
      }
    }
  }
}
