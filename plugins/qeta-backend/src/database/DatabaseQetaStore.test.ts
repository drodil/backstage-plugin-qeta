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
  disableDocker: !process.env.GITHUB_ACTIONS,
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

    const insertTag = async (tag: string) =>
      (await knex('tags').insert({ tag }).returning('id'))[0].id ?? -1;

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
      await knex('question_comments').del();
      await knex('answer_comments').del();
      await knex('user_tags').del();
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

        const ans = await storage.answerQuestion(
          'user',
          id,
          'answer',
          new Date(),
        );
        expect(ans).toBeDefined();
        expect(ans?.content).toEqual('answer');
        expect(ans?.questionId).toEqual(id);

        const ans2 = await storage.commentAnswer(
          ans?.id ?? 0,
          'user:default/user',
          'this is comment',
          new Date(),
        );
        expect(ans2?.comments?.length).toEqual(1);
      });

      it('should fetch list of questions', async () => {
        await insertQuestion(question);
        await insertQuestion({ ...question, title: 'title2' });
        const ret = await storage.getQuestions('user1', {});
        expect(ret?.questions.length).toEqual(2);
      });

      it('should fetch questions within fromDate and toDate DateRange', async () => {
        await insertQuestion({
          ...question,
          title: 'title2',
          content: 'content',
          created: '2024-05-08 20:51:55.715+05:30',
        });
        await insertQuestion({
          ...question,
          title: 'title2',
          created: '2024-04-02 13:08:32.821+05:30',
        });
        const ret = await storage.getQuestions('user', {
          fromDate: '2024-04-02',
          toDate: '2024-04-02',
        });

        expect(ret?.questions.length).toEqual(1);
      });

      it('should fetch list of random questions', async () => {
        await insertQuestion(question);
        await insertQuestion({ ...question, title: 'title2' });
        const ret = await storage.getQuestions('user1', { random: true });
        expect(ret?.questions.length).toEqual(2);
      });

      it('should fetch list of questions based on searchQuery', async () => {
        await insertQuestion(question);
        await insertQuestion({
          ...question,
          title: 'title2',
          content: 'content to search for',
        });
        const ret = await storage.getQuestions('user1', {
          searchQuery: 'to search',
        });
        expect(ret?.questions.length).toEqual(1);

        const noQuestions = await storage.getQuestions('user1', {
          searchQuery: 'missing',
        });
        expect(noQuestions?.questions.length).toEqual(0);
      });

      it('should fetch list of questions with special characters in searchQuery', async () => {
        await insertQuestion({
          ...question,
          content: 'Cannot read config file:',
        });
        const ret = await storage.getQuestions('user1', {
          searchQuery: 'Cannot read config file:',
        });
        expect(ret?.questions.length).toEqual(1);
      });

      it('should fetch questions with specific component', async () => {
        const q1 = await storage.postQuestion(
          'user1',
          'title',
          'content',
          new Date(),
          ['java', 'xml', ''],
          ['component:default/comp1', 'component:default/comp2'],
        );
        const q2 = await storage.postQuestion(
          'user2',
          'title2',
          'content2',
          new Date(),
          ['java', 'mysql'],
          ['component:default/comp2', 'component:default/comp3'],
        );

        const ret1 = await storage.getQuestions('user1', {
          entity: 'component:default/comp1',
        });
        expect(ret1.questions.length).toEqual(1);
        expect(ret1.questions.at(0)?.id).toEqual(q1.id);

        const ret2 = await storage.getQuestions('user1', {
          entity: 'component:default/comp2',
        });

        expect(ret2.questions.length).toEqual(2);
        expect(ret2.questions.at(0)?.id).toEqual(q2.id);
        expect(ret2.questions.at(1)?.id).toEqual(q1.id);
      });

      it('should mark question as favorite', async () => {
        const q1 = await storage.postQuestion(
          'user1',
          'title',
          'content',
          new Date(),
          ['java', 'xml', ''],
          ['component:default/comp1', 'component:default/comp2'],
        );
        await storage.postQuestion(
          'user2',
          'title2',
          'content2',
          new Date(),
          ['java', 'mysql'],
          ['component:default/comp2', 'component:default/comp3'],
        );

        const favorite = await storage.favoriteQuestion('user1', q1.id);
        expect(favorite).toBeTruthy();

        const ret1 = await storage.getQuestions('user1', {
          favorite: true,
          author: 'user1',
        });

        expect(ret1.questions.length).toEqual(1);
        expect(ret1.questions.at(0)?.id).toEqual(q1.id);
        expect(ret1.questions.at(0)?.favorite).toBeTruthy();

        const unfavorite = await storage.unfavoriteQuestion('user1', q1.id);
        expect(unfavorite).toBeTruthy();

        const ret2 = await storage.getQuestions('user1', {
          favorite: true,
          author: 'user1',
        });
        expect(ret2.questions.length).toEqual(0);
      });

      it('should add new question', async () => {
        const id1 = await storage.postQuestion(
          'user1',
          'title',
          'content',
          new Date(),
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
          new Date(),
          ['java', 'mysql'],
          ['component:default/comp2', 'component:default/comp3'],
        );

        const ret1 = await storage.getQuestion('user', id1.id);
        expect(ret1?.tags?.sort()).toEqual(['xml', 'java'].sort());
        expect(ret1?.entities?.sort()).toEqual(
          ['component:default/comp1', 'component:default/comp2'].sort(),
        );

        const ret2 = await storage.getQuestion('user', id2.id);
        expect(ret2?.tags?.sort()).toEqual(['java', 'mysql'].sort());
        expect(ret2?.entities?.sort()).toEqual(
          ['component:default/comp2', 'component:default/comp3'].sort(),
        );

        const ret3 = await storage.commentQuestion(
          id1.id,
          'user:default/user',
          'this is comment',
          new Date(),
        );
        expect(ret3?.comments?.length).toEqual(1);
      });

      it('should update question', async () => {
        const id1 = await storage.postQuestion(
          'user1',
          'title',
          'content',
          new Date(),
          ['java', 'xml', ''],
          [
            'component:default/comp1',
            'component:default/comp2',
            'invalidComponent',
            '',
          ],
        );

        const ret = await storage.updateQuestion(
          id1.id,
          'user1',
          'title2',
          'content2',
          ['java'],
          ['component:default/comp2'],
        );

        expect(ret?.id).toEqual(id1.id);
        expect(ret?.title).toEqual('title2');
        expect(ret?.content).toEqual('content2');
        expect(ret?.tags?.length).toEqual(1);
        expect(ret?.tags?.at(0)).toEqual('java');
        expect(ret?.entities?.length).toEqual(1);
        expect(ret?.entities?.at(0)).toEqual('component:default/comp2');
        expect(ret?.updatedBy).toEqual('user1');
        expect(ret?.updated).toBeDefined();
      });

      it('should delete question', async () => {
        const id1 = await storage.postQuestion(
          'user1',
          'title',
          'content',
          new Date(),
        );
        let ret1 = await storage.getQuestion('user', id1.id);
        expect(ret1?.title).toEqual('title');

        const deleted = await storage.deleteQuestion(id1.id);
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
        let marked = await storage.markAnswerCorrect(id, answerId);
        expect(marked).toBeTruthy();

        const ret = await storage.getQuestion('user', id);
        const answers = ret?.answers;
        expect(answers?.length).toEqual(2);
        expect(answers?.at(0)?.correct).toBeTruthy();

        // should not allow setting correct with wrong user
        marked = await storage.markAnswerCorrect(id, answerId);
        expect(marked).toBeFalsy();

        // should not allow setting two answers correct for one question
        marked = await storage.markAnswerCorrect(id, anotherAnswerId);
        expect(marked).toBeFalsy();

        marked = await storage.markAnswerIncorrect(id, answerId);
        expect(marked).toBeTruthy();

        marked = await storage.markAnswerCorrect(id, anotherAnswerId);
        expect(marked).toBeTruthy();
      });

      it('should allow following and unfollowing tag', async () => {
        await insertTag('tag1');
        const followed = await storage.followTag('user', 'tag1');
        expect(followed).toBeTruthy();
        const tags = await storage.getUserTags('user');
        expect(tags).toEqual({ tags: ['tag1'], count: 1 });
        const users = await storage.getUsersForTags(['tag1']);
        expect(users).toEqual(['user']);
        const unfollowed = await storage.unfollowTag('user', 'tag1');
        expect(unfollowed).toBeTruthy();
        const tags2 = await storage.getUserTags('user');
        expect(tags2).toEqual({ tags: [], count: 0 });
      });

      it('should allow following and unfollowing entity', async () => {
        const followed = await storage.followEntity('user', 'component');
        expect(followed).toBeTruthy();
        const tags = await storage.getUserEntities('user');
        expect(tags).toEqual({ entityRefs: ['component'], count: 1 });
        const users = await storage.getUsersForEntities(['component']);
        expect(users).toEqual(['user']);
        const unfollowed = await storage.unfollowEntity('user', 'component');
        expect(unfollowed).toBeTruthy();
        const tags2 = await storage.getUserEntities('user');
        expect(tags2).toEqual({ entityRefs: [], count: 0 });
      });
    });
  },
);
