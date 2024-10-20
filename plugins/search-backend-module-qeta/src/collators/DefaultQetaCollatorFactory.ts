import { Config } from '@backstage/config';
import { Readable } from 'stream';
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
import {
  PostsResponseBody,
  QetaDocument,
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
      const response = await fetch(`${baseUrl}/posts?${params.toString()}`, {
        headers,
      });
      const data = (await response.json()) as PostsResponseBody;

      if (!data || 'errors' in data || !('posts' in data)) {
        this.logger.error(
          `Error while fetching questions from qeta: ${JSON.stringify(data)}`,
        );
        return;
      }

      const posts = data.posts;
      this.logger.info(`Indexing ${posts.length} posts`);
      totalQuestions = data.total;
      indexedQuestions += posts.length;

      for (const post of posts) {
        yield {
          title: post.title,
          text: post.content,
          location:
            post.type === 'question'
              ? `/qeta/questions/${post.id}`
              : `/qeta/articles/${post.id}`,
          docType: 'qeta',
          author: post.author,
          score: post.score,
          entityRefs: post.entities,
          answerCount: post.answersCount,
          views: post.views,
          tags: post.tags,
        };

        for (const answer of post.answers ?? []) {
          yield {
            title: `${
              answer.correct ? 'Correct answer' : 'Answer'
            } for question ${post.title}`,
            text: answer.content,
            location: `/qeta/questions/${post.id}#answer_${answer.id}`,
            docType: 'qeta',
            entityRefs: post.entities,
            author: answer.author,
            score: answer.score,
            tags: post.tags,
            correctAnswer: answer.correct,
          };

          for (const comment of answer.comments ?? []) {
            yield {
              title: `Comment for ${post.title}`,
              text: comment.content,
              location: `/qeta/questions/${post.id}#answer_${answer.id}`,
              docType: 'qeta',
              author: comment.author,
              score: answer.score,
              tags: post.tags,
              entityRefs: post.entities,
            };
          }
        }

        for (const comment of post.comments ?? []) {
          yield {
            title: `Comment for ${post.title}`,
            text: comment.content,
            location: `/qeta/questions/${post.id}`,
            docType: 'qeta',
            author: comment.author,
            score: post.score,
            tags: post.tags,
            entityRefs: post.entities,
          };
        }
      }
    }
  }
}
