import {
  PluginDatabaseManager,
  resolvePackagePath,
} from '@backstage/backend-common';
import { Knex } from 'knex';
import {
  AttachmentParameters,
  EntityResponse,
  MaybeAnswer,
  MaybeQuestion,
  QetaStore,
  Questions,
  QuestionsOptions,
  TagResponse,
} from './QetaStore';
import {
  Answer,
  Attachment,
  filterTags,
  Question,
  Statistic,
  StatisticsRequestParameters,
  Vote,
} from '@drodil/backstage-plugin-qeta-common';

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
  score: number | string;
  views: number | string;
  answersCount: number | string;
  correctAnswers: number | string;
  favorite: number | string;
  trend: number | string;
  anonymous: boolean;
};

export type RawAnswerEntity = {
  id: number;
  questionId: number;
  author: string;
  content: string;
  correct: boolean;
  score: number | string;
  created: Date;
  updated: Date;
  updatedBy: string;
  anonymous: boolean;
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

export type RawCommentEntity = {
  id: number;
  author: string;
  content: string;
  created: Date;
  updated: Date;
  updatedBy: string;
};

export class DatabaseQetaStore implements QetaStore {
  private constructor(private readonly db: Knex) {}

  static async create({
    database,
    skipMigrations,
  }: {
    database: PluginDatabaseManager;
    skipMigrations?: boolean;
  }): Promise<DatabaseQetaStore> {
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      // prettier-ignore
      await client.migrate.latest({ // nosonar
        directory: migrationsDir,
      });
    }

    return new DatabaseQetaStore(client);
  }

  async getQuestions(
    user_ref: string,
    options: QuestionsOptions,
  ): Promise<Questions> {
    const query = this.getQuestionBaseQuery(user_ref);

    if (options.author) {
      query.where('questions.author', '=', options.author);
    }

    if (options.searchQuery) {
      if (this.db.client.config.client === 'pg') {
        query.whereRaw(
          `(to_tsvector('english', questions.title || ' ' || questions.content) @@ websearch_to_tsquery('english', quote_literal(?))
          or to_tsvector('english', questions.title || ' ' || questions.content) @@ to_tsquery('english',quote_literal(?)))`,
          [
            `${options.searchQuery}`,
            `${options.searchQuery.replaceAll(/\s/g, '+')}:*`,
          ],
        );
      } else {
        query.whereRaw(
          `LOWER(questions.title || ' ' || questions.content) LIKE LOWER(?)`,
          [`%${options.searchQuery}%`],
        );
      }
    }

    const tags = filterTags(options.tags);
    if (tags) {
      tags.forEach((t, i) => {
        query.innerJoin(
          `question_tags AS qt${i}`,
          'questions.id',
          `qt${i}.questionId`,
        );
        query.innerJoin(`tags AS t${i}`, `qt${i}.tagId`, `t${i}.id`);
        query.where(`t${i}.tag`, '=', t);
      });
    }

    if (options.entity) {
      query.leftJoin(
        'question_entities',
        'questions.id',
        'question_entities.questionId',
      );
      query.leftJoin('entities', 'question_entities.entityId', 'entities.id');
      query.where('entities.entity_ref', '=', options.entity);
    }

    if (options.noAnswers) {
      query.whereNull('answers.questionId');
    }

    if (options.noCorrectAnswer) {
      query.leftJoin('answers as correct_answer', builder => {
        builder
          .on('questions.id', 'correct_answer.questionId')
          .on('correct_answer.correct', this.db.raw('?', [true]));
      });
      query.whereNull('correct_answer.questionId');
    }

    if (options.noVotes) {
      query.whereNull('question_votes.questionId');
    }

    if (options.favorite) {
      query.where('user_favorite.user', '=', user_ref);
      query.whereNotNull('user_favorite.questionId');
    }

    if (options.includeTrend) {
      query.select(
        this.db.raw(
          '((EXTRACT(EPOCH FROM questions.created) / EXTRACT(EPOCH FROM now())) * (SELECT coalesce(NULLIF(COUNT(*),0), 1) FROM question_views WHERE ?? = ??) * (SELECT coalesce(NULLIF(COUNT(*),0), 1) FROM answers WHERE ?? = ??) * (SELECT coalesce(NULLIF(SUM(score),0), 1) FROM question_votes WHERE ?? = ??)) as trend',
          [
            'questionId',
            'questions.id',
            'questionId',
            'questions.id',
            'questionId',
            'questions.id',
          ],
        ),
      );
    }

    console.log(query.toString());
    const totalQuery = query.clone();

    if (options.random) {
      query.orderByRaw('RANDOM()');
    } else if (options.orderBy) {
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

    const results = await Promise.all([
      query,
      this.db(totalQuery.as('totalQuery')).count('* as CNT').first(),
    ]);
    const rows = results[0] as RawQuestionEntity[];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      questions: await Promise.all(
        rows.map(async val => {
          return this.mapQuestion(
            val,
            user_ref,
            options.includeAnswers,
            options.includeVotes,
            options.includeEntities,
          );
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
    const rows = await this.getQuestionBaseQuery(user_ref).where(
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
      user_ref,
      true,
      true,
      true,
      true,
    );
  }

  async getQuestionByAnswerId(
    user_ref: string,
    answerId: number,
    recordView?: boolean,
  ): Promise<MaybeQuestion> {
    const rows = await this.getQuestionBaseQuery(user_ref)
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
      user_ref,
      true,
      true,
      true,
    );
  }

  async postQuestion(
    user_ref: string,
    title: string,
    content: string,
    created: Date,
    tags?: string[],
    entities?: string[],
    images?: number[],
    anonymous?: boolean,
  ): Promise<Question> {
    const questions = await this.db
      .insert(
        {
          author: user_ref,
          title,
          content,
          created,
          anonymous: anonymous ?? false,
        },
        ['id'],
      )
      .into('questions')
      .returning(['id', 'author', 'title', 'content', 'created', 'anonymous']);

    await Promise.all([
      this.addQuestionTags(questions[0].id, tags),
      this.addQuestionEntities(questions[0].id, entities),
    ]);

    if (images && images.length > 0) {
      await this.db('attachments')
        .whereIn('id', images)
        .update({ questionId: questions[0].id });
    }

    return this.mapQuestion(questions[0], user_ref, false, false, true);
  }

  async commentQuestion(
    question_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<MaybeQuestion> {
    await this.db
      .insert({
        author: user_ref,
        content,
        created,
        questionId: question_id,
      })
      .into('question_comments');

    return await this.getQuestion(user_ref, question_id, false);
  }

  async deleteQuestionComment(
    question_id: number,
    id: number,
    user_ref: string,
    moderator?: boolean,
  ): Promise<MaybeQuestion> {
    const query = this.db('question_comments')
      .where('id', '=', id)
      .where('questionId', '=', question_id);
    if (!moderator) {
      query.where('author', '=', user_ref);
    }
    await query.delete();
    return this.getQuestion(user_ref, question_id, false);
  }

  async commentAnswer(
    answer_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<MaybeAnswer> {
    await this.db
      .insert({
        author: user_ref,
        content,
        created,
        answerId: answer_id,
      })
      .into('answer_comments');
    return this.getAnswer(answer_id, user_ref);
  }

  async deleteAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
    moderator?: boolean,
  ): Promise<MaybeAnswer> {
    const query = this.db('answer_comments')
      .where('id', '=', id)
      .where('answerId', '=', answer_id);

    if (!moderator) {
      query.where('author', '=', user_ref);
    }
    await query.delete();
    return this.getAnswer(answer_id, user_ref);
  }

  async updateQuestion(
    id: number,
    user_ref: string,
    title: string,
    content: string,
    tags?: string[],
    entities?: string[],
    images?: number[],
    moderator?: boolean,
  ): Promise<MaybeQuestion> {
    const query = this.db('questions').where('questions.id', '=', id);
    if (!moderator) {
      query.where('questions.author', '=', user_ref);
    }
    const rows = await query.update({
      title,
      content,
      updatedBy: user_ref,
      updated: new Date(),
    });

    if (!rows) {
      return null;
    }

    await Promise.all([
      this.addQuestionTags(id, tags, true),
      this.addQuestionEntities(id, entities, true),
    ]);

    if (images && images.length > 0) {
      await this.db('attachments')
        .whereIn('id', images)
        .update({ questionId: id });
    }

    return await this.getQuestion(user_ref, id, false);
  }

  async deleteQuestion(
    user_ref: string,
    id: number,
    moderator?: boolean,
  ): Promise<boolean> {
    const query = this.db('questions').where('id', '=', id);
    if (!moderator) {
      query.where('author', '=', user_ref);
    }
    return !!(await query.delete());
  }

  async answerQuestion(
    user_ref: string,
    questionId: number,
    answer: string,
    created: Date,
    images?: number[],
    anonymous?: boolean,
  ): Promise<MaybeAnswer> {
    const answers = await this.db
      .insert({
        questionId,
        author: user_ref,
        content: answer,
        correct: false,
        created,
        anonymous: anonymous ?? false,
      })
      .into('answers')
      .returning('id');

    if (images && images.length > 0) {
      await this.db('attachments')
        .whereIn('id', images)
        .update({ answerId: answers[0].id });
    }

    return this.getAnswer(answers[0].id, user_ref);
  }

  async updateAnswer(
    user_ref: string,
    questionId: number,
    answerId: number,
    answer: string,
    images?: number[],
    moderator?: boolean,
  ): Promise<MaybeAnswer> {
    const query = this.db('answers')
      .where('answers.id', '=', answerId)
      .where('answers.questionId', '=', questionId);
    if (!moderator) {
      query.where('answers.author', '=', user_ref);
    }

    const rows = await query.update({
      content: answer,
      updatedBy: user_ref,
      updated: new Date(),
    });

    if (!rows) {
      return null;
    }

    if (images && images.length > 0) {
      await this.db('attachments')
        .whereIn('id', images)
        .update({ answerId: answerId });
    }

    return this.getAnswer(answerId, user_ref);
  }

  async getAnswer(answerId: number, user_ref: string): Promise<MaybeAnswer> {
    const answers = await this.getAnswerBaseQuery().where('id', '=', answerId);
    return this.mapAnswer(answers[0], user_ref, true, true);
  }

  async deleteAnswer(
    user_ref: string,
    id: number,
    moderator?: boolean,
  ): Promise<boolean> {
    const query = this.db('answers').where('id', '=', id);
    if (!moderator) {
      query.where('author', '=', user_ref);
    }

    return !!(await query.delete());
  }

  async voteQuestion(
    user_ref: string,
    questionId: number,
    score: number,
  ): Promise<boolean> {
    await this.db('question_votes')
      .where('author', '=', user_ref)
      .where('questionId', '=', questionId)
      .delete();

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

  async favoriteQuestion(
    user_ref: string,
    questionId: number,
  ): Promise<boolean> {
    const id = await this.db
      .insert(
        {
          user: user_ref,
          questionId,
        },
        ['questionId'],
      )
      .onConflict()
      .ignore()
      .into('user_favorite');
    return id && id.length > 0;
  }

  async unfavoriteQuestion(
    user_ref: string,
    questionId: number,
  ): Promise<boolean> {
    return !!(await this.db('user_favorite')
      .where('user', '=', user_ref)
      .where('questionId', '=', questionId)
      .delete());
  }

  async voteAnswer(
    user_ref: string,
    answerId: number,
    score: number,
  ): Promise<boolean> {
    await this.db('answer_votes')
      .where('author', '=', user_ref)
      .where('answerId', '=', answerId)
      .delete();

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

  async markAnswerCorrect(
    user_ref: string,
    questionId: number,
    answerId: number,
    moderator?: boolean,
  ): Promise<boolean> {
    return await this.markAnswer(
      user_ref,
      questionId,
      answerId,
      true,
      moderator,
    );
  }

  async markAnswerIncorrect(
    user_ref: string,
    questionId: number,
    answerId: number,
    moderator?: boolean,
  ): Promise<boolean> {
    return await this.markAnswer(
      user_ref,
      questionId,
      answerId,
      false,
      moderator,
    );
  }

  async getTags(): Promise<TagResponse[]> {
    const tagRef = this.db.ref('tags.id');
    const questionsCount = this.db('question_tags')
      .where('question_tags.tagId', tagRef)
      .count('*')
      .as('questionsCount');

    const tags = await this.db('tags')
      .leftJoin('question_tags', 'tags.id', 'question_tags.tagId')
      .orderBy('questionsCount', 'desc')
      .select('tag', questionsCount)
      .groupBy('tags.id');

    return tags.map(tag => {
      return {
        tag: tag.tag,
        questionsCount: this.mapToInteger(tag.questionsCount),
      };
    });
  }

  async getEntities(): Promise<EntityResponse[]> {
    const entityRef = this.db.ref('entities.id');
    const questionsCount = this.db('question_entities')
      .where('question_entities.entityId', entityRef)
      .count('*')
      .as('questionsCount');

    const entities = await this.db('entities')
      .leftJoin(
        'question_entities',
        'entities.id',
        'question_entities.entityId',
      )
      .orderBy('questionsCount', 'desc')
      .select('entity_ref', questionsCount)
      .groupBy('entities.id');

    return entities.map(entity => {
      return {
        entityRef: entity.entity_ref,
        questionsCount: this.mapToInteger(entity.questionsCount),
      };
    });
  }

  async getMostUpvotedQuestions({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    const query = this.db<Statistic>('questions as q')
      .sum('qv.score as total')
      .select('q.author')
      .join('question_votes as qv', 'q.id', 'qv.questionId')
      .groupBy('q.author')
      .orderBy('total', 'desc')
      .where('anonymous', '!=', true);

    if (author) {
      query.where('q.author', '=', author);
    }

    if (options?.period) {
      query.where('q.created', '>', options.period);
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = (await query) as unknown as Statistic[];

    // This can probably be replaced to use
    // DENSE_RANK() over (total) directly by the  query
    rows.map((row, index) => {
      row.position = index + 1;
    });

    return rows;
  }

  async getTotalQuestions({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    const query = this.db<Statistic>('questions as q')
      .count('q.id as total')
      .select('q.author')
      .groupBy('author')
      .orderBy('total', 'desc')
      .where('q.anonymous', '!=', true);

    if (author) {
      query.where('q.author', '=', author);
    }

    if (options?.period) {
      query.where('q.created', '>', options.period);
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = (await query) as unknown as Statistic[];
    if (!author) {
      rows.map((row, index) => {
        row.position = index + 1;
      });
    }

    return rows;
  }

  async getMostUpvotedAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    const query = this.db<Statistic>('answers as a')
      .sum('av.score as total')
      .select('a.author')
      .join('answer_votes as av', 'a.id', 'av.answerId')
      .groupBy('a.author')
      .orderBy('total', 'desc')
      .where('a.anonymous', '!=', true);

    if (author) {
      query.where('a.author', '=', author);
    }

    if (options?.period) {
      query.where('a.created', '>', options.period);
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = (await query) as unknown as Statistic[];

    rows.map((row, index) => {
      row.position = index + 1;
    });

    return rows;
  }

  async getMostUpvotedCorrectAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    const query = this.db<Statistic>('answers as a')
      .sum('av.score as total')
      .select('a.author')
      .join('answer_votes as av', 'a.id', 'av.answerId')
      .groupBy('a.author')
      .orderBy('total', 'desc')
      .where('a.correct', '=', true)
      .where('a.anonymous', '!=', true);

    if (author) {
      query.where('a.author', '=', author);
    }

    if (options?.period) {
      query.where('a.created', '>', options.period);
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = (await query) as unknown as Statistic[];

    rows.map((row, index) => {
      row.position = index + 1;
    });

    return rows;
  }

  async getTotalAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    const query = this.db<Statistic>('answers as a')
      .count('a.id as total')
      .select('a.author')
      .groupBy('author')
      .orderBy('total', 'desc')
      .where('a.anonymous', '!=', true);

    if (author) {
      query.where('a.author', '=', author);
    }

    if (options?.period) {
      query.where('a.created', '>', options.period);
    }
    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = (await query) as unknown as Statistic[];

    if (!author) {
      rows.map((row, index) => {
        row.position = index + 1;
      });
    }

    return rows;
  }

  async postAttachment({
    uuid,
    locationType,
    locationUri,
    extension,
    mimeType,
    binaryImage,
    path,
    creator,
  }: AttachmentParameters): Promise<Attachment> {
    const attachments: Attachment[] = await this.db
      .insert(
        {
          uuid: uuid,
          locationType: locationType,
          locationUri: locationUri,
          extension: extension,
          mimeType: mimeType,
          path: path,
          binaryImage: binaryImage,
          creator: creator,
          created: new Date(),
        },
        ['id', 'uuid', 'locationUri', 'locationType'],
      )
      .into('attachments');

    return attachments[0];
  }

  async getAttachment(uuid: string): Promise<Attachment | undefined> {
    const attachment = await this.db<Attachment>('attachments')
      .where('uuid', '=', uuid)
      .first();

    return attachment;
  }

  /**
   * Maps string or number value to integer. This is due to fact that postgres returns
   * strings instead numbers for count and sum functions.
   * @param val
   */
  private mapToInteger = (val: string | number | undefined): number => {
    return typeof val === 'string' ? Number.parseInt(val, 10) : val ?? 0;
  };

  private async mapQuestion(
    val: RawQuestionEntity,
    user_ref: string,
    addAnswers?: boolean,
    addVotes?: boolean,
    addEntities?: boolean,
    addComments?: boolean,
  ): Promise<Question> {
    // TODO: This could maybe done with join
    const additionalInfo = await Promise.all([
      this.getQuestionTags(val.id),
      addAnswers
        ? this.getQuestionAnswers(val.id, user_ref, addVotes, addComments)
        : undefined,
      addVotes ? this.getQuestionVotes(val.id) : undefined,
      addEntities ? this.getQuestionEntities(val.id) : undefined,
      addComments ? this.getQuestionComments(val.id) : undefined,
    ]);
    return {
      id: val.id,
      author:
        val.anonymous && val.author !== user_ref ? 'anonymous' : val.author,
      title: val.title,
      content: val.content,
      created: val.created,
      updated: val.updated,
      updatedBy: val.updatedBy,
      score: this.mapToInteger(val.score),
      views: this.mapToInteger(val.views),
      answersCount: this.mapToInteger(val.answersCount),
      correctAnswer: this.mapToInteger(val.correctAnswers) > 0,
      favorite: this.mapToInteger(val.favorite) > 0,
      tags: additionalInfo[0],
      answers: additionalInfo[1],
      votes: additionalInfo[2],
      entities: additionalInfo[3],
      trend: this.mapToInteger(val.trend),
      comments: additionalInfo[4],
      anonymous: val.anonymous,
    };
  }

  private async mapAnswer(
    val: RawAnswerEntity,
    user_ref: string,
    addVotes?: boolean,
    addComments?: boolean,
  ): Promise<Answer> {
    const additionalInfo = await Promise.all([
      addVotes ? this.getAnswerVotes(val.id) : undefined,
      addComments ? this.getAnswerComments(val.id) : undefined,
    ]);
    return {
      id: val.id,
      questionId: val.questionId,
      author:
        val.anonymous && val.author !== user_ref ? 'anonymous' : val.author,
      content: val.content,
      correct: val.correct,
      created: val.created,
      updated: val.updated,
      updatedBy: val.updatedBy,
      score: this.mapToInteger(val.score),
      votes: additionalInfo[0],
      comments: additionalInfo[1],
      anonymous: val.anonymous,
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

  private async getQuestionComments(
    questionId: number,
  ): Promise<RawCommentEntity[]> {
    return this.db<RawCommentEntity>('question_comments') // nosonar
      .where('question_comments.questionId', '=', questionId)
      .select();
  }

  private async getAnswerComments(
    answerId: number,
  ): Promise<RawCommentEntity[]> {
    return this.db<RawCommentEntity>('answer_comments') // nosonar
      .where('answer_comments.answerId', '=', answerId)
      .select();
  }

  private async getQuestionEntities(questionId: number): Promise<string[]> {
    const rows = await this.db<RawTagEntity>('entities') // nosonar
      .leftJoin(
        'question_entities',
        'entities.id',
        'question_entities.entityId',
      )
      .where('question_entities.questionId', '=', questionId)
      .select();
    return rows.map(val => val.entity_ref);
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
    user_ref: string,
    addVotes?: boolean,
    addComments?: boolean,
  ): Promise<Answer[]> {
    const rows = await this.getAnswerBaseQuery()
      .where('questionId', '=', questionId)
      .orderBy('answers.correct', 'desc')
      .orderBy('answers.created');
    return await Promise.all(
      rows.map(async val => {
        return this.mapAnswer(val, user_ref, addVotes, addComments);
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

  private getQuestionBaseQuery(user: string) {
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
      .where('answers.questionId', questionRef)
      .where('answers.correct', '=', true)
      .count('*')
      .as('correctAnswers');

    const favorite = this.db('user_favorite')
      .where('user_favorite.user', '=', user)
      .where('user_favorite.questionId', questionRef)
      .count('*')
      .as('favorite');

    return this.db<RawQuestionEntity>('questions') // nosonar
      .select(
        'questions.*',
        score,
        views,
        answersCount,
        correctAnswers,
        favorite,
      )
      .leftJoin('question_votes', 'questions.id', 'question_votes.questionId')
      .leftJoin('question_views', 'questions.id', 'question_views.questionId')
      .leftJoin('answers', 'questions.id', 'answers.questionId')
      .leftJoin('user_favorite', 'questions.id', 'user_favorite.questionId')
      .groupBy('questions.id');
  }

  private async addQuestionTags(
    questionId: number,
    tagsInput?: string[],
    removeOld?: boolean,
  ) {
    const tags = filterTags(tagsInput);
    if (removeOld) {
      await this.db('question_tags')
        .where('questionId', '=', questionId)
        .delete();
    }

    if (!tags || tags.length === 0) {
      return;
    }
    const existingTags = await this.db('tags')
      .whereIn('tag', tags)
      .returning('id')
      .select();
    const newTags = tags.filter(t => !existingTags.some(e => e.tag === t));
    const tagIds = (
      await Promise.all(
        [...new Set(newTags)].map(
          async tag =>
            await this.db
              .insert({ tag: tag.trim() })
              .into('tags')
              .returning('id')
              .onConflict('tag')
              .ignore(),
        ),
      )
    )
      .flat()
      .map(tag => tag.id)
      .concat(existingTags.map(t => t.id));

    await Promise.all(
      tagIds.map(async tagId => {
        await this.db
          .insert({ questionId, tagId })
          .into('question_tags')
          .onConflict()
          .ignore();
      }),
    );
  }

  private async addQuestionEntities(
    questionId: number,
    entitiesInput?: string[],
    removeOld?: boolean,
  ) {
    if (removeOld) {
      await this.db('question_entities')
        .where('questionId', '=', questionId)
        .delete();
    }

    const regex = /\w+:\w+\/\w+/g;
    const entities = entitiesInput?.filter(input => input.match(regex));
    if (!entities || entities.length === 0) {
      return;
    }

    const existingEntities = await this.db('entities')
      .whereIn('entity_ref', entities)
      .returning('id')
      .select();
    const newEntities = entities.filter(
      t => !existingEntities.some(e => e.entity_ref === t),
    );
    const entityIds = (
      await Promise.all(
        [...new Set(newEntities)].map(
          async entity =>
            await this.db
              .insert({ entity_ref: entity })
              .into('entities')
              .returning('id')
              .onConflict('entity_ref')
              .ignore(),
        ),
      )
    )
      .flat()
      .map(entity => entity.id)
      .concat(existingEntities.map(c => c.id));

    await Promise.all(
      entityIds.map(async entityId => {
        await this.db
          .insert({ questionId, entityId })
          .into('question_entities')
          .onConflict()
          .ignore();
      }),
    );
  }

  private async markAnswer(
    user_ref: string,
    questionId: number,
    answerId: number,
    correct: boolean,
    moderator?: boolean,
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

    const query = this.db('answers')
      .onConflict()
      .ignore()
      .where('answers.id', '=', answerId)
      .where('questionId', '=', questionId);
    if (!moderator) {
      // Need to do with subquery as missing join functionality for update in knex.
      // See: https://github.com/knex/knex/issues/2796
      // eslint-disable-next-line
      query.whereIn('questionId', function () {
        this.from('questions')
          .select('id')
          .where('id', '=', questionId)
          .where('author', '=', user_ref);
      });
    }

    const ret = await query.update({ correct }, ['id']);
    return ret !== undefined && ret?.length > 0;
  }
}
