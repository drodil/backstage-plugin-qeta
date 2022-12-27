import { Knex } from 'knex';
import {
  DatabaseQetaStore,
  RawAnswerEntity,
  RawQuestionEntity,
} from './DatabaseQetaStore';
import { TestDatabaseId, TestDatabases } from '@backstage/backend-test-utils';

jest.setTimeout(60_000);

const databases = TestDatabases.create({
  ids: ['POSTGRES_13', 'SQLITE_3'],
  // disableDocker: false,
});

async function createStore(databaseId: TestDatabaseId) {
  const knex = await databases.init(databaseId);
  const databaseManager = {
    getClient: async () => knex,
    migrations: {
      skip: false,
    },
  };

  return {
    knex,
    storage: await DatabaseQetaStore.create({
      database: databaseManager,
    }),
  };
}

type InsertQuestionType = Partial<RawQuestionEntity>;
type InsertAnswerType = Partial<RawAnswerEntity>;

const question: InsertQuestionType = {
  author: 'user',
  title: 'title',
  content: 'content',
  created: new Date(),
  updated: new Date(),
  updatedBy: 'user',
};

const answer: InsertAnswerType = {
  author: 'user',
  content: 'content',
  correct: false,
  created: new Date(),
  updated: new Date(),
  updatedBy: 'user',
};

describe.each(databases.eachSupportedId())(
  'DatabaseQetaStore (%s)',
  databaseId => {
    let storage: DatabaseQetaStore;
    let knex: Knex;

    const insertQuestion = async (data: InsertQuestionType) =>
      (
        await knex<InsertQuestionType>('questions').insert(data).returning('id')
      )[0].id ?? -1;

    const insertAnswer = async (data: InsertAnswerType) =>
      (await knex<InsertAnswerType>('answers').insert(data).returning('id'))[0]
        .id ?? -1;

    const voteQuestion = (questionId: number, user: string) =>
      knex('question_votes').insert({
        questionId,
        author: user,
        score: 1,
        timestamp: new Date(),
      });

    const voteAnswer = (answerId: number, user: string) =>
      knex('answer_votes').insert({
        answerId,
        author: user,
        score: 1,
        timestamp: new Date(),
      });

    beforeAll(async () => {
      ({ storage, knex } = await createStore(databaseId));
    });

    afterEach(async () => {
      jest.resetAllMocks();

      await knex('questions').del();
      await knex('answers').del();
      await knex('question_votes').del();
      await knex('answer_votes').del();
      await knex('question_views').del();
      await knex('tags').del();
    });

    describe('questions and answers database', () => {
      it('should fetch question and answers', async () => {
        const id = await insertQuestion(question);
        const answerId = await insertAnswer({ questionId: id, ...answer });
        await voteQuestion(id, 'user3');
        await voteQuestion(id, 'user4');
        await voteAnswer(answerId, 'user3');
        await voteAnswer(answerId, 'user4');

        let ret = await storage.getQuestion('user', id);
        expect(ret).toBeDefined();
        expect(ret?.author).toEqual('user');
        expect(ret?.title).toEqual('title');
        expect(ret?.content).toEqual('content');
        expect(ret?.score).toEqual(2);
        expect(ret?.views).toEqual(0);
        const answers = ret?.answers;
        expect(answers?.length).toEqual(1);
        expect(answers?.at(0)?.content).toEqual('content');

        ret = await storage.getQuestion('user', id);
        expect(ret?.views).toEqual(1);

        const ans = await storage.getQuestion('user', answerId);
        expect(ans).toBeDefined();
      });

      it('should be able to answer question', async () => {
        const id = await insertQuestion(question);

        const ans = await storage.answerQuestion('user', id, 'answer');
        expect(ans).toBeDefined();
        expect(ans?.content).toEqual('answer');
        expect(ans?.questionId).toEqual(id);
      });

      it('should fetch list of questions', async () => {
        await insertQuestion(question);
        await insertQuestion({ ...question, title: 'title2' });
        const ret = await storage.getQuestions({});
        expect(ret?.questions.length).toEqual(2);
      });

      it('should fetch list of random questions', async () => {
        await insertQuestion(question);
        await insertQuestion({ ...question, title: 'title2' });
        const ret = await storage.getQuestions({ random: true });
        expect(ret?.questions.length).toEqual(2);
      });

      it('should add new question', async () => {
        const id1 = await storage.postQuestion(
          'user1',
          'title',
          'content',
          ['java', 'xml', ''],
          [
            'component:default/comp1',
            'component:default/comp2',
            'invalidComponent',
            '',
          ],
        );
        const id2 = await storage.postQuestion(
          'user2',
          'title2',
          'content2',
          ['java', 'mysql'],
          ['component:default/comp2', 'component:default/comp3'],
        );

        const ret1 = await storage.getQuestion('user', id1.id);
        expect(ret1?.tags?.sort()).toEqual(['xml', 'java'].sort());
        expect(ret1?.components?.sort()).toEqual(
          ['component:default/comp1', 'component:default/comp2'].sort(),
        );

        const ret2 = await storage.getQuestion('user', id2.id);
        expect(ret2?.tags?.sort()).toEqual(['java', 'mysql'].sort());
        expect(ret2?.components?.sort()).toEqual(
          ['component:default/comp2', 'component:default/comp3'].sort(),
        );
      });

      it('should delete question', async () => {
        const id1 = await storage.postQuestion('user1', 'title', 'content');
        let ret1 = await storage.getQuestion('user', id1.id);
        expect(ret1?.title).toEqual('title');

        // should not allow delete other users question
        let deleted = await storage.deleteQuestion('user2', id1.id);
        expect(deleted).toBeFalsy();

        deleted = await storage.deleteQuestion('user1', id1.id);
        expect(deleted).toBeTruthy();

        ret1 = await storage.getQuestion('user', id1.id);
        expect(ret1).toBeNull();
      });

      it('should get question by answer', async () => {
        const id = await insertQuestion(question);
        const answerId = await insertAnswer({ questionId: id, ...answer });
        const ret = await storage.getQuestionByAnswerId('user', answerId);
        expect(ret).not.toBeNull();
        expect(ret?.title).toEqual('title');
      });

      it('should vote question', async () => {
        const id = await insertQuestion(question);
        const voted = await storage.voteQuestion('user', id, 1);
        expect(voted).toBeTruthy();

        const ret = await storage.getQuestion('user', id);
        expect(ret?.score).toEqual(1);
      });

      it('should vote answer', async () => {
        const id = await insertQuestion(question);
        const answerId = await insertAnswer({ questionId: id, ...answer });
        const voted = await storage.voteAnswer('user', answerId, 1);
        expect(voted).toBeTruthy();

        const ret = await storage.getQuestion('user', id);
        const answers = ret?.answers;
        expect(answers?.length).toEqual(1);
        expect(answers?.at(0)?.score).toEqual(1);
      });

      it('should mark answer correct or incorrect', async () => {
        const id = await insertQuestion(question);
        const answerId = await insertAnswer({ questionId: id, ...answer });
        const anotherAnswerId = await insertAnswer({
          questionId: id,
          ...answer,
        });
        let marked = await storage.markAnswerCorrect('user', id, answerId);
        expect(marked).toBeTruthy();

        const ret = await storage.getQuestion('user', id);
        const answers = ret?.answers;
        expect(answers?.length).toEqual(2);
        expect(answers?.at(0)?.correct).toBeTruthy();

        // should not allow setting correct with wrong user
        marked = await storage.markAnswerCorrect('wrong_user', id, answerId);
        expect(marked).toBeFalsy();

        // should not allow setting two answers correct for one question
        marked = await storage.markAnswerCorrect('user', id, anotherAnswerId);
        expect(marked).toBeFalsy();

        marked = await storage.markAnswerIncorrect('user', id, answerId);
        expect(marked).toBeTruthy();

        marked = await storage.markAnswerCorrect('user', id, anotherAnswerId);
        expect(marked).toBeTruthy();
      });
    });
  },
);
