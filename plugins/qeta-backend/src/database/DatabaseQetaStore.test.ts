import { Knex } from 'knex';
import {
  DatabaseQetaStore,
  RawAnswerEntity,
  RawPostEntity,
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

type InsertPostType = Partial<RawPostEntity>;
type InsertAnswerType = Partial<RawAnswerEntity>;

const post: InsertPostType = {
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

    const insertPost = async (data: InsertPostType) =>
      (await knex<InsertPostType>('posts').insert(data).returning('id'))[0]
        .id ?? -1;

    const insertAnswer = async (data: InsertAnswerType) =>
      (await knex<InsertAnswerType>('answers').insert(data).returning('id'))[0]
        .id ?? -1;

    const insertTag = async (tag: string) =>
      (await knex('tags').insert({ tag }).returning('id'))[0].id ?? -1;

    const votePost = (postId: number, user: string) =>
      knex('post_votes').insert({
        postId,
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

      await knex('posts').del();
      await knex('answers').del();
      await knex('post_votes').del();
      await knex('answer_votes').del();
      await knex('post_views').del();
      await knex('tags').del();
      await knex('comments').del();
      await knex('user_tags').del();
    });

    describe('posts and answers database', () => {
      it('should fetch post and answers', async () => {
        const id = await insertPost(post);
        const answerId = await insertAnswer({ postId: id, ...answer });
        await votePost(id, 'user3');
        await votePost(id, 'user4');
        await voteAnswer(answerId, 'user3');
        await voteAnswer(answerId, 'user4');

        let ret = await storage.getPost('user', id);
        expect(ret).toBeDefined();
        expect(ret?.author).toEqual('user');
        expect(ret?.title).toEqual('title');
        expect(ret?.content).toEqual('content');
        expect(ret?.score).toEqual(2);
        expect(ret?.views).toEqual(0);
        const answers = ret?.answers;
        expect(answers?.length).toEqual(1);
        expect(answers?.at(0)?.content).toEqual('content');

        ret = await storage.getPost('user', id);
        expect(ret?.views).toEqual(1);

        const ans = await storage.getPost('user', answerId);
        expect(ans).toBeDefined();
      });

      it('should be able to answer post', async () => {
        const id = await insertPost(post);

        const ans = await storage.answerPost('user', id, 'answer', new Date());
        expect(ans).toBeDefined();
        expect(ans?.content).toEqual('answer');
        expect(ans?.postId).toEqual(id);

        const ans2 = await storage.commentAnswer(
          ans?.id ?? 0,
          'user:default/user',
          'this is comment',
          new Date(),
        );
        expect(ans2?.comments?.length).toEqual(1);
      });

      it('should fetch list of questions', async () => {
        await insertPost(post);
        await insertPost({ ...post, title: 'title2' });
        const ret = await storage.getPosts('user1', { type: 'question' });
        expect(ret?.posts.length).toEqual(2);
      });

      it('should fetch questions within fromDate and toDate DateRange', async () => {
        await insertPost({
          ...post,
          title: 'title2',
          content: 'content',
          created: '2024-05-08 20:51:55.715+05:30',
        });
        await insertPost({
          ...post,
          title: 'title2',
          created: '2024-04-02 13:08:32.821+05:30',
        });
        const ret = await storage.getPosts('user', {
          fromDate: '2024-04-02',
          toDate: '2024-04-02',
          type: 'question',
        });

        expect(ret?.posts.length).toEqual(1);
      });

      it('should fetch list of random questions', async () => {
        await insertPost(post);
        await insertPost({ ...post, title: 'title2' });
        const ret = await storage.getPosts('user1', {
          random: true,
          type: 'question',
        });
        expect(ret?.posts.length).toEqual(2);
      });

      it('should fetch list of questions based on searchQuery', async () => {
        await insertPost(post);
        await insertPost({
          ...post,
          title: 'title2',
          content: 'content to search for',
        });
        const ret = await storage.getPosts('user1', {
          searchQuery: 'to search',
          type: 'question',
        });

        expect(ret?.posts.length).toEqual(1);

        const noPosts = await storage.getPosts('user1', {
          searchQuery: 'missing',
          type: 'question',
        });
        expect(noPosts?.posts.length).toEqual(0);
      });

      it('should fetch list of questions with special characters in searchQuery', async () => {
        await insertPost({
          ...post,
          content: 'Cannot read config file:',
        });
        const ret = await storage.getPosts('user1', {
          searchQuery: 'config file:',
          type: 'question',
        });
        expect(ret?.posts.length).toEqual(1);
      });

      it('should fetch questions with specific component', async () => {
        const q1 = await storage.createPost({
          user_ref: 'user1',
          title: 'title',
          content: 'content',
          created: new Date(),
          tags: ['java', 'xml', ''],
          entities: ['component:default/comp1', 'component:default/comp2'],
        });
        const q2 = await storage.createPost({
          user_ref: 'user2',
          title: 'title2',
          content: 'content2',
          created: new Date(),
          tags: ['java', 'mysql'],
          entities: ['component:default/comp2', 'component:default/comp3'],
        });

        const ret1 = await storage.getPosts('user1', {
          entities: ['component:default/comp1'],
          type: 'question',
        });
        expect(ret1.posts.length).toEqual(1);
        expect(ret1.posts.at(0)?.id).toEqual(q1.id);

        const ret2 = await storage.getPosts('user1', {
          entities: ['component:default/comp2'],
          type: 'question',
        });

        expect(ret2.posts.length).toEqual(2);
        expect(ret2.posts.at(0)?.id).toEqual(q2.id);
        expect(ret2.posts.at(1)?.id).toEqual(q1.id);
      });

      it('should mark post as favorite', async () => {
        const q1 = await storage.createPost({
          user_ref: 'user1',
          title: 'title',
          content: 'content',
          created: new Date(),
          tags: ['java', 'xml', ''],
          entities: ['component:default/comp1', 'component:default/comp2'],
        });
        await storage.createPost({
          user_ref: 'user2',
          title: 'title2',
          content: 'content2',
          created: new Date(),
          tags: ['java', 'mysql'],
          entities: ['component:default/comp2', 'component:default/comp3'],
        });

        const favorite = await storage.favoritePost('user1', q1.id);
        expect(favorite).toBeTruthy();

        const ret1 = await storage.getPosts('user1', {
          favorite: true,
          author: 'user1',
          type: 'question',
        });

        expect(ret1.posts.length).toEqual(1);
        expect(ret1.posts.at(0)?.id).toEqual(q1.id);
        expect(ret1.posts.at(0)?.favorite).toBeTruthy();

        const unfavorite = await storage.unfavoritePost('user1', q1.id);
        expect(unfavorite).toBeTruthy();

        const ret2 = await storage.getPosts('user1', {
          favorite: true,
          author: 'user1',
          type: 'question',
        });
        expect(ret2.posts.length).toEqual(0);
      });

      it('should add new post', async () => {
        const id1 = await storage.createPost({
          user_ref: 'user1',
          title: 'title',
          content: 'content',
          created: new Date(),
          tags: ['java', 'xml', ''],
          entities: [
            'component:default/comp1',
            'component:default/comp2',
            'invalidComponent',
            '',
          ],
        });
        const id2 = await storage.createPost({
          user_ref: 'user2',
          title: 'title2',
          content: 'content2',
          created: new Date(),
          tags: ['java', 'mysql'],
          entities: ['component:default/comp2', 'component:default/comp3'],
        });

        const ret1 = await storage.getPost('user', id1.id);
        expect(ret1?.tags?.sort()).toEqual(['xml', 'java'].sort());
        expect(ret1?.entities?.sort()).toEqual(
          ['component:default/comp1', 'component:default/comp2'].sort(),
        );

        const ret2 = await storage.getPost('user', id2.id);
        expect(ret2?.tags?.sort()).toEqual(['java', 'mysql'].sort());
        expect(ret2?.entities?.sort()).toEqual(
          ['component:default/comp2', 'component:default/comp3'].sort(),
        );

        const ret3 = await storage.commentPost(
          id1.id,
          'user:default/user',
          'this is comment',
          new Date(),
        );
        expect(ret3?.comments?.length).toEqual(1);
      });

      it('should update post', async () => {
        const id1 = await storage.createPost({
          user_ref: 'user1',
          title: 'title',
          content: 'content',
          created: new Date(),
          tags: ['java', 'xml', ''],
          entities: [
            'component:default/comp1',
            'component:default/comp2',
            'invalidComponent',
            '',
          ],
        });

        const ret = await storage.updatePost({
          id: id1.id,
          user_ref: 'user1',
          title: 'title2',
          content: 'content2',
          tags: ['java'],
          entities: ['component:default/comp2'],
        });

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

      it('should delete post', async () => {
        const id1 = await storage.createPost({
          user_ref: 'user1',
          title: 'title',
          content: 'content',
          created: new Date(),
        });
        let ret1 = await storage.getPost('user', id1.id);
        expect(ret1?.title).toEqual('title');

        const deleted = await storage.deletePost(id1.id);
        expect(deleted).toBeTruthy();

        ret1 = await storage.getPost('user', id1.id);
        expect(ret1?.status).toEqual('deleted');
      });

      it('should get post by answer', async () => {
        const id = await insertPost(post);
        const answerId = await insertAnswer({ postId: id, ...answer });
        const ret = await storage.getPostByAnswerId('user', answerId);
        expect(ret).not.toBeNull();
        expect(ret?.title).toEqual('title');
      });

      it('should vote post', async () => {
        const id = await insertPost(post);
        const voted = await storage.votePost('user', id, 1);
        expect(voted).toBeTruthy();

        const ret = await storage.getPost('user', id);
        expect(ret?.score).toEqual(1);
      });

      it('should vote answer', async () => {
        const id = await insertPost(post);
        const answerId = await insertAnswer({ postId: id, ...answer });
        const voted = await storage.voteAnswer('user', answerId, 1);
        expect(voted).toBeTruthy();

        const ret = await storage.getPost('user', id);
        const answers = ret?.answers;
        expect(answers?.length).toEqual(1);
        expect(answers?.at(0)?.score).toEqual(1);
      });

      it('should mark answer correct or incorrect', async () => {
        const id = await insertPost(post);
        const answerId = await insertAnswer({ postId: id, ...answer });
        const anotherAnswerId = await insertAnswer({
          postId: id,
          ...answer,
        });
        let marked = await storage.markAnswerCorrect(id, answerId);
        expect(marked).toBeTruthy();

        const ret = await storage.getPost('user', id);
        const answers = ret?.answers;
        expect(answers?.length).toEqual(2);
        expect(answers?.at(0)?.correct).toBeTruthy();

        // should not allow setting correct with wrong user
        marked = await storage.markAnswerCorrect(id, answerId);
        expect(marked).toBeFalsy();

        // should not allow setting two answers correct for one post
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

      it('should return empty collections in getCollections', async () => {
        const collection = await storage.createCollection({
          user_ref: 'user1',
          title: 'Empty Collection',
          description: 'A collection with no posts',
          created: new Date(),
        });

        const result = await storage.getCollections('user1', {});
        const found = result.collections.find(
          c => c.id === collection.id && c.title === 'Empty Collection',
        );
        expect(found).toBeDefined();
        expect(found?.postsCount).toBe(0);
        expect(found?.posts).toEqual([]);
      });
    });

    describe('links', () => {
      it('should store url for link posts', async () => {
        const url = 'https://example.com';
        const linkPost = await storage.createPost({
          user_ref: 'user',
          title: 'A link post',
          content: 'This is a link post',
          created: new Date(),
          type: 'link',
          url,
        });
        expect(linkPost.type).toBe('link');
        expect(linkPost.url).toBe(url);
        expect(linkPost.content).not.toContain(url);
      });

      it('should update url for link posts', async () => {
        const url1 = 'https://first.com';
        const url2 = 'https://second.com';
        const linkPost = await storage.createPost({
          user_ref: 'user',
          title: 'A link post',
          content: 'Initial content',
          created: new Date(),
          type: 'link',
          url: url1,
        });
        const updated = await storage.updatePost({
          id: linkPost.id,
          user_ref: 'user',
          url: url2,
        });
        expect(updated).toBeDefined();
        expect(updated?.type).toBe('link');
        expect(updated?.url).toBe(url2);
        expect(updated?.content).toBe('Initial content');
      });

      it('should not set url for non-link posts unless provided', async () => {
        const nonLinkPost = await storage.createPost({
          user_ref: 'user',
          title: 'Normal post',
          content: 'Some content',
          created: new Date(),
          type: 'question',
        });
        expect(nonLinkPost.type).toBe('question');
        expect(nonLinkPost.url).toBeNull();
      });

      it('should delete link posts properly', async () => {
        const url = 'https://delete-me.com';
        const linkPost = await storage.createPost({
          user_ref: 'user',
          title: 'Delete link',
          content: 'Delete this link',
          created: new Date(),
          type: 'link',
          url,
        });
        const deleted = await storage.deletePost(linkPost.id, true);
        expect(deleted).toBeTruthy();
        const fetched = await storage.getPost('user', linkPost.id);
        expect(fetched).toBeNull();
      });

      it('should allow favoriting and unfavoriting link posts', async () => {
        const url = 'https://favorite-link.com';
        const linkPost = await storage.createPost({
          user_ref: 'user',
          title: 'Favorite link',
          content: 'Favorite this link',
          created: new Date(),
          type: 'link',
          url,
        });
        const favorited = await storage.favoritePost('user', linkPost.id);
        expect(favorited).toBeTruthy();
        let posts = await storage.getPosts('user', {
          favorite: true,
          type: 'link',
        });
        expect(posts.posts.length).toBe(1);
        expect(posts.posts[0].id).toBe(linkPost.id);
        const unfavorited = await storage.unfavoritePost('user', linkPost.id);
        expect(unfavorited).toBeTruthy();
        posts = await storage.getPosts('user', {
          favorite: true,
          type: 'link',
        });
        expect(posts.posts.length).toBe(0);
      });

      it('should allow tagging and untagging link posts', async () => {
        const url = 'https://tag-link.com';
        const linkPost = await storage.createPost({
          user_ref: 'user',
          title: 'Tag link',
          content: 'Tag this link',
          created: new Date(),
          type: 'link',
          url,
          tags: ['tag-a', 'tag-b'],
        });
        let fetched = await storage.getPost('user', linkPost.id);
        expect(fetched?.tags?.sort()).toEqual(['tag-a', 'tag-b']);
        await storage.updatePost({
          id: linkPost.id,
          user_ref: 'user',
          tags: ['tag-b'],
        });
        fetched = await storage.getPost('user', linkPost.id);
        expect(fetched?.tags).toEqual(['tag-b']);
      });

      it('should allow connecting and disconnecting entities for link posts', async () => {
        const url = 'https://entity-link.com';
        const linkPost = await storage.createPost({
          user_ref: 'user',
          title: 'Entity link',
          content: 'Entity this link',
          created: new Date(),
          type: 'link',
          url,
          entities: ['component:default/ent1', 'component:default/ent2'],
        });
        let fetched = await storage.getPost('user', linkPost.id);
        expect(fetched?.entities?.sort()).toEqual([
          'component:default/ent1',
          'component:default/ent2',
        ]);
        await storage.updatePost({
          id: linkPost.id,
          user_ref: 'user',
          entities: ['component:default/ent1'],
        });
        fetched = await storage.getPost('user', linkPost.id);
        expect(fetched?.entities).toEqual(['component:default/ent1']);
      });
    });

    describe('Clicking posts', () => {
      const getVotes = async (user_ref: string, postId: number) =>
        knex('post_votes')
          .where('author', '=', user_ref)
          .where('postId', '=', postId);
      const user_ref = 'user';

      it('should insert a new post_votes row if none exists', async () => {
        const postId = await insertPost(post);
        await storage.clickPost(user_ref, postId);
        const votes = await getVotes(user_ref, postId);
        expect(votes.length).toBe(1);
        expect(votes[0].score).toBe(1);
      });

      it('should increment score if row exists', async () => {
        const postId = await insertPost(post);
        await storage.clickPost(user_ref, postId);
        await storage.clickPost(user_ref, postId);
        const votes = await getVotes(user_ref, postId);
        expect(votes.length).toBe(1);
        expect(votes[0].score).toBe(2);
      });

      it('should create a new row for a different post', async () => {
        const postId1 = await insertPost({ ...post, title: 'post1' });
        const postId2 = await insertPost({ ...post, title: 'post2' });
        await storage.clickPost(user_ref, postId1);
        await storage.clickPost(user_ref, postId2);
        const votes1 = await getVotes(user_ref, postId1);
        expect(votes1.length).toBe(1);
        expect(votes1[0].score).toBe(1);
        const votes2 = await getVotes(user_ref, postId2);
        expect(votes2.length).toBe(1);
        expect(votes2[0].score).toBe(1);
      });
    });
  },
);
