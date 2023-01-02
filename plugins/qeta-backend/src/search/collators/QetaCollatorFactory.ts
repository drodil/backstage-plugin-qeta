import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { Readable } from 'stream';
import {
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import { PluginDatabaseManager } from '@backstage/backend-common';
import { DatabaseQetaStore } from '../../database';

export type QetaCollatorFactoryOptions = {
  logger: Logger;
  database: PluginDatabaseManager;
};

export type QetaDocument = IndexableDocument & {
  tags?: string[];
  entities?: string[];
  author: string;
  views: number;
  score: number;
  answersCount: number;
  created: Date;
  updatedBy?: string;
  updated?: Date;
  answers?: string[];
};

export class QetaCollatorFactory implements DocumentCollatorFactory {
  private readonly logger: Logger;
  private readonly database: PluginDatabaseManager;
  private readonly appBaseUrl: string;
  public readonly type: string = 'qeta';

  private constructor(config: Config, options: QetaCollatorFactoryOptions) {
    this.logger = options.logger;
    this.database = options.database;
    this.appBaseUrl = config.getString('app.baseUrl');
  }

  static fromConfig(config: Config, options: QetaCollatorFactoryOptions) {
    return new QetaCollatorFactory(config, options);
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<QetaDocument> {
    this.logger.info('Executing QetaCollator');
    const db = await DatabaseQetaStore.create({
      database: this.database,
      skipMigrations: true,
    });

    const questions = await db.getQuestions({
      includeAnswers: true,
      includeEntities: true,
    });

    for (const question of questions.questions) {
      yield {
        ...question,
        text: question.content,
        location: `${this.appBaseUrl}/qeta/questions/${question.id}`,
        answers: question.answers?.map(a => a.content),
      };
    }
  }
}
