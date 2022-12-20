import {
  PluginDatabaseManager,
  resolvePackagePath,
} from '@backstage/backend-common';
import { Knex } from 'knex';
import {
  Answer,
  MaybeAnswer,
  MaybeQuestion,
  QetaStore,
  Question,
  Questions,
  QuestionsOptions,
  Vote,
} from './QetaStore';

const migrationsDir = resolvePackagePath(
  '@drodil/backstage-plugin-qeta-backend',
  'migrations',
);

export type RawQuestionEntity = {
  id: number;
  author: string;
  title: string;
  content: string;
  created: Date;
  updated: Date;
  updatedBy: string;
  score: number;
  views: number;
  answersCount: number;
  correctAnswers: number;
};

export type RawAnswerEntity = {
  id: number;
  questionId: number;
  author: string;
  content: string;
  correct: boolean;
  score: number;
  created: Date;
  updated: Date;
  updatedBy: string;
};

export type RawQuestionVoteEntity = {
  questionId: number;
  author: string;
  score: number;
  timestamp: Date;
};

export type RawAnswerVoteEntity = {
  answerId: number;
  author: string;
  score: number;
  timestamp: Date;
};

export type RawTagEntity = {
  id: number;
  tag: string;
};

export class DatabaseQetaStore implements QetaStore {
  static async create({
    database,
  }: {
    database: PluginDatabaseManager;
  }): Promise<DatabaseQetaStore> {
    const client = await database.getClient();

    if (!database.migrations?.skip) {
      // prettier-ignore
      await client.migrate.latest({ // nosonar
        directory: migrationsDir,
      });
    }

    return new DatabaseQetaStore(client);
  }

  private constructor(private readonly db: Knex) {}

  private async mapQuestion(
    val: RawQuestionEntity,
    addQuestions?: boolean,
    addVotes?: boolean,
  ): Promise<Question> {
    // TODO: This could maybe done with join
    const additionalInfo = await Promise.all([
      this.getQuestionTags(val.id),
      addQuestions ? this.getQuestionAnswers(val.id, addVotes) : undefined,
      addVotes ? this.getQuestionVotes(val.id) : undefined,
    ]);
    return {
      id: val.id,
      author: val.author,
      title: val.title,
      content: val.content,
      created: val.created,
      updated: val.updated,
      updatedBy: val.updatedBy,
      score: val.score ?? 0,
      views: val.views ?? 0,
      answersCount: val.answersCount ?? 0,
      correctAnswer: val.correctAnswers > 0,
      tags: additionalInfo[0],
      answers: additionalInfo[1],
      votes: additionalInfo[2],
    };
  }

  private async mapAnswer(
    val: RawAnswerEntity,
    addVotes?: boolean,
  ): Promise<Answer> {
    const votes = addVotes ? await this.getAnswerVotes(val.id) : undefined;
    return {
      id: val.id,
      questionId: val.questionId,
      author: val.author,
      content: val.content,
      correct: val.correct,
      created: val.created,
      updated: val.updated,
      updatedBy: val.updatedBy,
      score: val.score ?? 0,
      votes,
    };
  }

  private mapVote(val: RawQuestionVoteEntity | RawAnswerVoteEntity): Vote {
    return {
      author: val.author,
      score: val.score,
      timestamp: val.timestamp,
    };
  }

  private async getQuestionTags(questionId: number): Promise<string[]> {
    const rows = await this.db<RawTagEntity>('tags') // nosonar
      .leftJoin('question_tags', 'tags.id', 'question_tags.tagId')
      .where('question_tags.questionId', '=', questionId)
      .select();
    return rows.map(val => val.tag);
  }

  private async getQuestionVotes(questionId: number): Promise<Vote[]> {
    const rows = (await this.db<RawQuestionVoteEntity>('question_votes')
      .where('questionId', '=', questionId)
      .select()) as RawQuestionVoteEntity[];
    return rows.map(val => this.mapVote(val));
  }

  private async getAnswerVotes(answerId: number): Promise<Vote[]> {
    const rows = (await this.db<RawAnswerVoteEntity>('answer_votes')
      .where('answerId', '=', answerId)
      .select()) as RawAnswerVoteEntity[];
    return rows.map(val => this.mapVote(val));
  }

  private getAnswerBaseQuery() {
    const questionRef = this.db.ref('answers.id');

    const score = this.db('answer_votes')
      .where('answer_votes.answerId', questionRef)
      .sum('score')
      .as('score');

    return this.db<RawAnswerEntity>('answers') // nosonar
      .leftJoin('answer_votes', 'answers.id', 'answer_votes.answerId')
      .select('answers.*', score)
      .groupBy('answers.id');
  }

  private async getQuestionAnswers(
    questionId: number,
    addVotes?: boolean,
  ): Promise<Answer[]> {
    const rows = await this.getAnswerBaseQuery()
      .where('questionId', '=', questionId)
      .orderBy('answers.correct', 'desc')
      .orderBy('answers.created');
    return await Promise.all(
      rows.map(async val => {
        return this.mapAnswer(val, addVotes);
      }),
    );
  }

  private async recordQuestionView(
    questionId: number,
    user_ref: string,
  ): Promise<void> {
    await this.db
      .insert({
        author: user_ref,
        questionId,
        timestamp: new Date(),
      })
      .into('question_views');
  }

  private getQuestionBaseQuery() {
    const questionRef = this.db.ref('questions.id');

    const score = this.db('question_votes')
      .where('question_votes.questionId', questionRef)
      .sum('score')
      .as('score');

    const views = this.db('question_views')
      .where('question_views.questionId', questionRef)
      .count('*')
      .as('views');

    const answersCount = this.db('answers')
      .where('answers.questionId', questionRef)
      .count('*')
      .as('answersCount');

    const correctAnswers = this.db('answers')
      .where('answers.correct', '=', true)
      .count('*')
      .as('correctAnswers');

    return this.db<RawQuestionEntity>('questions') // nosonar
      .select('questions.*', score, views, answersCount, correctAnswers)
      .leftJoin('question_votes', 'questions.id', 'question_votes.questionId')
      .leftJoin('question_views', 'questions.id', 'question_views.questionId')
      .leftJoin('answers', 'questions.id', 'answers.questionId')
      .groupBy('questions.id');
  }

  async getQuestions(options: QuestionsOptions): Promise<Questions> {
    const query = this.getQuestionBaseQuery();

    if (options.author) {
      query.where('questions.author', '=', options.author);
    }

    if (options.tags) {
      query.leftJoin(
        'question_tags',
        'questions.id',
        'question_tags.questionId',
      );
      query.leftJoin('tags', 'question_tags.tagId', 'tags.id');
      query.whereIn('tags.tag', options.tags);
    }

    if (options.orderBy) {
      query.orderBy(options.orderBy, options.order ? options.order : 'desc');
    } else {
      query.orderBy('created', 'desc');
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    const rows = (await query) as RawQuestionEntity[];
    const total = (
      (await this.db<RawQuestionEntity>('questions')
        .count('id as CNT')
        .first()) as any
    )?.CNT;

    return {
      questions: await Promise.all(
        rows.map(async val => {
          return this.mapQuestion(val, options.includeAnswers);
        }),
      ),
      total,
    };
  }

  async getQuestion(
    user_ref: string,
    id: number,
    recordView?: boolean,
  ): Promise<MaybeQuestion> {
    const rows = await this.getQuestionBaseQuery().where(
      'questions.id',
      '=',
      id,
    );
    if (!rows || rows.length === 0) {
      return null;
    }
    if (recordView === undefined || recordView) {
      this.recordQuestionView(id, user_ref);
    }
    return await this.mapQuestion(
      rows[0] as unknown as RawQuestionEntity,
      true,
      true,
    );
  }

  async getQuestionByAnswerId(
    user_ref: string,
    answerId: number,
    recordView?: boolean,
  ): Promise<MaybeQuestion> {
    const rows = await this.getQuestionBaseQuery()
      .where('answers.id', '=', answerId)
      .select('questions.*');
    if (!rows || rows.length === 0) {
      return null;
    }
    if (recordView === undefined || recordView) {
      this.recordQuestionView(rows[0].id, user_ref);
    }
    return await this.mapQuestion(
      rows[0] as unknown as RawQuestionEntity,
      true,
      true,
    );
  }

  async postQuestion(
    user_ref: string,
    title: string,
    content: string,
    tags?: string[],
  ): Promise<Question> {
    const questions = await this.db
      .insert(
        {
          author: user_ref,
          title,
          content,
          created: new Date(),
        },
        ['id'],
      )
      .into('questions');

    if (tags && tags.length > 0) {
      const existingTags = await this.db('tags').whereIn('tag', tags).select();
      const newTags = tags.filter(t => !existingTags.some(e => e.tag === t));
      const tagIds = (
        await Promise.all(
          [...new Set(newTags)].map(
            async tag =>
              await this.db
                .insert({ tag })
                .into('tags')
                .onConflict('tag')
                .ignore(),
          ),
        )
      )
        .flat()
        .concat(existingTags.map(t => t.id));

      await Promise.all(
        tagIds.map(async tagId => {
          await this.db
            .insert({ questionId: questions[0].id, tagId })
            .into('question_tags')
            .onConflict()
            .ignore();
        }),
      );
    }
    return this.mapQuestion(questions[0]);
  }

  async deleteQuestion(user_ref: string, id: number): Promise<boolean> {
    return !!(await this.db('questions')
      .where('id', '=', id)
      .where('author', '=', user_ref)
      .delete());
  }

  async answerQuestion(
    user_ref: string,
    questionId: number,
    answer: string,
  ): Promise<MaybeAnswer> {
    const answers = await this.db
      .insert({
        questionId,
        author: user_ref,
        content: answer,
        correct: false,
        created: new Date(),
      })
      .into('answers');
    return this.getAnswer(answers[0]);
  }

  async getAnswer(answerId: number): Promise<MaybeAnswer> {
    const answers = await this.getAnswerBaseQuery().where('id', '=', answerId);
    return this.mapAnswer(answers[0], true);
  }

  async deleteAnswer(user_ref: string, id: number): Promise<boolean> {
    return !!(await this.db('answers')
      .where('id', '=', id)
      .where('author', '=', user_ref)
      .delete());
  }

  async voteQuestion(
    user_ref: string,
    questionId: number,
    score: number,
  ): Promise<boolean> {
    // delete old votes if exist
    await this.db('question_votes').where('author', '=', user_ref).delete();
    const id = await this.db
      .insert(
        {
          author: user_ref,
          questionId,
          score,
          timestamp: new Date(),
        },
        ['questionId'],
      )
      .onConflict()
      .ignore()
      .into('question_votes');
    return id && id.length > 0;
  }

  async voteAnswer(
    user_ref: string,
    answerId: number,
    score: number,
  ): Promise<boolean> {
    // delete old votes if exist
    await this.db('answer_votes').where('author', '=', user_ref).delete();
    const id = await this.db
      .insert(
        {
          author: user_ref,
          answerId,
          score,
          timestamp: new Date(),
        },
        ['answerId'],
      )
      .onConflict()
      .ignore()
      .into('answer_votes');
    return id && id.length > 0;
  }

  private async markAnswer(
    user_ref: string,
    questionId: number,
    answerId: number,
    correct: boolean,
  ): Promise<boolean> {
    // There can be only one correct answer
    if (correct) {
      const exists = await this.db('answers')
        .select('id')
        .where('correct', '=', true)
        .where('questionId', '=', questionId);
      if (exists && exists.length > 0) {
        return false;
      }
    }

    const ret = await this.db('answers')
      .update({ correct }, ['id'])
      .onConflict()
      .ignore()
      .where('answers.id', '=', answerId)
      .where('questionId', '=', questionId)
      // Need to do with subquery as missing join functionality for update in knex.
      // See: https://github.com/knex/knex/issues/2796
      // eslint-disable-next-line
      .whereIn('questionId', function () {
        this.from('questions')
          .select('id')
          .where('id', '=', questionId)
          .where('author', '=', user_ref);
      });

    return ret !== undefined && ret?.length > 0;
  }

  async markAnswerCorrect(
    user_ref: string,
    questionId: number,
    answerId: number,
  ): Promise<boolean> {
    return await this.markAnswer(user_ref, questionId, answerId, true);
  }

  async markAnswerIncorrect(
    user_ref: string,
    questionId: number,
    answerId: number,
  ): Promise<boolean> {
    return await this.markAnswer(user_ref, questionId, answerId, false);
  }

  async getTags(): Promise<string[]> {
    const tags = await this.db('tags').select('tag');
    return tags.map(tag => tag.tag);
  }
}
