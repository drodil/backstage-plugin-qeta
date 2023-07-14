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

export interface QetaDocument extends IndexableDocument {
  docType: string;
  author: string;
  score: number;
  answerCount?: number;
}

export class QetaCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'qeta';
  private readonly logger: Logger;
  private readonly database: PluginDatabaseManager;

  private constructor(_config: Config, options: QetaCollatorFactoryOptions) {
    this.logger = options.logger;
    this.database = options.database;
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

    const questions = await db.getQuestions('', {
      includeAnswers: true,
    });

    for (const question of questions.questions) {
      yield {
        title: question.title,
        text: question.content,
        location: `/qeta/questions/${question.id}`,
        docType: 'qeta',
        author: question.author,
        score: question.score,
        answerCount: question.answersCount,
      };

      for (const answer of question.answers ?? []) {
        yield {
          title: `Answer for ${question.title}`,
          text: answer.content,
          location: `/qeta/questions/${question.id}`,
          docType: 'qeta',
          author: answer.author,
          score: answer.score,
        };
      }
    }
  }
}
