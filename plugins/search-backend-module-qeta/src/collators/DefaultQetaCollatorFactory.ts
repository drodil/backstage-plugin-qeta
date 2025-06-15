import { Config } from '@backstage/config';
import { Readable } from 'stream';
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
import {
  QetaApi,
  QetaClient,
  QetaCollectionDocument,
  QetaPostDocument,
  qetaReadPostPermission,
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
  visibilityPermission = qetaReadPostPermission;
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

  async *execute(): AsyncGenerator<QetaPostDocument | QetaCollectionDocument> {
    this.logger.info('Executing QetaCollator');
    let totalPosts = Number.MAX_VALUE;
    let indexedPosts = 0;

    while (totalPosts > indexedPosts) {
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
          includeExperts: false,
          includeAttachments: false,
          orderBy: 'created',
          order: 'asc',
          limit: 50,
          offset: indexedPosts,
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
      totalPosts = data.total;
      indexedPosts += posts.length;

      for (const post of posts) {
        const postContent = `# ${
          post.type === 'question' ? 'Question' : 'Article'
        }: ${post.title}\n\n${post.content}`;
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
          text: `${postContent}\n\n${answersContent.join('\n\n')}\n\n${
            commentsContent.length > 0
              ? `Comments:\n\n${commentsContent.join('\n\n')}`
              : ''
          }`,
          location:
            post.type === 'question'
              ? `/qeta/questions/${post.id}`
              : `/qeta/articles/${post.id}`,
          docType: 'qeta_post',
          author: post.author,
          created: post.created,
          score: post.score,
          trend: post.trend,
          entityRefs: post.entities,
          answerCount: post.answersCount,
          views: post.views,
          tags: post.tags,
          postType: post.type,
          authorization: {
            resourceRef: `qeta:post:${post.id}`,
          },
        };
      }

      // Give some slack for the processing
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    let totalCollections = Number.MAX_VALUE;
    let indexedCollections = 0;

    while (totalCollections > indexedCollections) {
      let tok = undefined;

      if (this.auth) {
        const { token } = await this.auth.getPluginRequestToken({
          onBehalfOf: await this.auth.getOwnServiceCredentials(),
          targetPluginId: 'qeta',
        });
        tok = token;
      }

      const data = await this.api.getCollections(
        {
          orderBy: 'created',
          order: 'asc',
          limit: 50,
          offset: indexedCollections,
          includePosts: false,
          includeExperts: false,
        },
        { token: tok },
      );

      if (!data || 'errors' in data || !('collections' in data)) {
        this.logger.error(
          `Error while fetching collections from qeta: ${JSON.stringify(data)}`,
        );
        return;
      }

      const collections = data.collections;
      this.logger.info(`Indexing ${collections.length} collections`);
      totalCollections = data.total;
      indexedCollections += collections.length;

      for (const collection of collections) {
        yield {
          title: collection.title,
          text: collection.description ?? '',
          location: `/qeta/collections/${collection.id}`,
          docType: 'qeta_collection',
          postsCount: collection.postsCount,
          owner: collection.owner,
          created: collection.created,
          headerImage: collection.headerImage,
        };
      }

      // Give some slack for the processing
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
