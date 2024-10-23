import { Config } from '@backstage/config';
import { Readable } from 'stream';
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
import {
  QetaApi,
  QetaClient,
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
  private readonly auth?: AuthService;
  private readonly api: QetaApi;

  private constructor(_config: Config, options: QetaCollatorFactoryOptions) {
    this.logger = options.logger;
    this.auth = options.auth;
    this.api = new QetaClient({ discoveryApi: options.discovery });
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

    while (totalQuestions > indexedQuestions) {
      let tok = undefined;

      if (this.auth) {
        const { token } = await this.auth.getPluginRequestToken({
          onBehalfOf: await this.auth.getOwnServiceCredentials(),
          targetPluginId: 'qeta',
        });
        tok = token;
      }

      const data = await this.api.getPosts(
        {
          includeAnswers: true,
          includeComments: true,
          orderBy: 'created',
          order: 'asc',
          limit: 50,
          offset: indexedQuestions,
        },
        { token: tok },
      );

      if (!data || 'errors' in data || !('posts' in data)) {
        this.logger.error(
          `Error while fetching posts from qeta: ${JSON.stringify(data)}`,
        );
        return;
      }

      const posts = data.posts;
      this.logger.info(`Indexing ${posts.length} posts`);
      totalQuestions = data.total;
      indexedQuestions += posts.length;

      for (const post of posts) {
        const questionContent = `# Question: ${post.title}\n\n${post.content}`;
        const answersContent = (post.answers ?? []).map(a => {
          return `## ${a.correct ? 'Correct answer' : 'Answer'} by ${
            a.author
          }: ${a.content}`;
        });

        const allComments = (post.comments ?? []).concat(
          (post.answers ?? []).flatMap(a => a.comments ?? []),
        );
        const commentsContent = allComments.map(c => {
          return `* Comment by ${c.author}: ${c.content}`;
        });

        yield {
          title: post.title,
          text: `${questionContent}\n\n${answersContent.join(
            '\n\n',
          )}\n\nComments:\n\n${commentsContent.join('\n\n')}`,
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
      }
    }
  }
}
