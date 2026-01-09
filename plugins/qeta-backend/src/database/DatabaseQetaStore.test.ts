import { Knex } from 'knex';
import { DatabaseQetaStore } from './DatabaseQetaStore';
import { RawAnswerEntity } from './stores/AnswersStore';
import { RawPostEntity } from './stores/PostsStore';
import { TestDatabaseId, TestDatabases } from '@backstage/backend-test-utils';
import { PermissionCriteria } from '@backstage/plugin-permission-common';
import { PostFilter } from '@drodil/backstage-plugin-qeta-common';

jest.setTimeout(60_000);

const databases = TestDatabases.create({
  ids: ['POSTGRES_17', 'SQLITE_3'],
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

    const votePost = async (postId: number, user: string) => {
      await knex('post_votes').insert({
        postId,
        author: user,
        score: 1,
        timestamp: new Date(),
      });
      await knex('posts').where('id', postId).increment('score', 1);
    };

    const voteAnswer = async (answerId: number, user: string) => {
      await knex('answer_votes').insert({
        answerId,
        author: user,
        score: 1,
        timestamp: new Date(),
      });
      await knex('answers').where('id', answerId).increment('score', 1);
    };

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
      await knex('post_entities').del();
      await knex('entities').del();
    });

    describe('posts and answers database', () => {
      it('should fetch post and answers', async () => {
        const id = await insertPost(post);
        const answerId = await insertAnswer({ postId: id, ...answer });
        await votePost(id, 'user3');
        await votePost(id, 'user4');
        await voteAnswer(answerId, 'user3');
        await voteAnswer(answerId, 'user4');

        let ret = await storage.getPost('user', id, true);
        expect(ret).toBeDefined();
        expect(ret?.author).toEqual('user');
        expect(ret?.title).toEqual('title');
        expect(ret?.content).toEqual('content');
        expect(ret?.score).toEqual(2);
        expect(ret?.views).toEqual(0);
        const answers = ret?.answers;
        expect(answers?.length).toEqual(1);
        expect(answers?.at(0)?.content).toEqual('content');

        ret = await storage.getPost('user', id, false);
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

        // should allow setting correct again (idempotent)
        marked = await storage.markAnswerCorrect(id, answerId);
        expect(marked).toBeTruthy();

        // should allow setting another answer correct (switching)
        marked = await storage.markAnswerCorrect(id, anotherAnswerId);
        expect(marked).toBeTruthy();

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
          c => c.id === collection?.id && c.title === 'Empty Collection',
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
        expect(nonLinkPost.url).toBeUndefined();
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
        const deleted = await storage.deletePost(linkPost!.id, true);
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

    describe('getEntityLinks', () => {
      const insertEntity = async (entityRef: string) => {
        const result = await knex('entities')
          .insert({ entity_ref: entityRef })
          .returning('id');
        return result[0].id;
      };

      const insertPostEntity = async (postId: number, entityId: number) => {
        await knex('post_entities').insert({ postId, entityId });
      };

      it('should return empty array when no entity links exist', async () => {
        const result = await storage.getEntityLinks();
        expect(result).toEqual([]);
      });

      it('should return entity links for link posts', async () => {
        // Insert entities with unique references
        const entity1Id = await insertEntity(
          'component:default/links-service1',
        );
        const entity2Id = await insertEntity(
          'component:default/links-service2',
        );

        // Insert link posts
        const linkPost1 = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'Documentation Link',
          url: 'https://example.com/docs',
          status: 'active',
        });

        const linkPost2 = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'GitHub Repository',
          url: 'https://github.com/example/repo',
          status: 'active',
        });

        const linkPost3 = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'API Endpoint',
          url: 'https://api.example.com',
          status: 'active',
        });

        // Connect posts to entities
        await insertPostEntity(linkPost1, entity1Id);
        await insertPostEntity(linkPost2, entity1Id);
        await insertPostEntity(linkPost3, entity2Id);

        const result = await storage.getEntityLinks();

        expect(result).toHaveLength(2);

        const service1Links = result.find(
          r => r.entityRef === 'component:default/links-service1',
        );
        expect(service1Links).toBeDefined();
        expect(service1Links?.links).toHaveLength(2);
        expect(service1Links?.links).toEqual(
          expect.arrayContaining([
            {
              title: 'Documentation Link',
              type: 'qeta',
              url: 'https://example.com/docs',
            },
            {
              title: 'GitHub Repository',
              type: 'qeta',
              url: 'https://github.com/example/repo',
            },
          ]),
        );

        const service2Links = result.find(
          r => r.entityRef === 'component:default/links-service2',
        );
        expect(service2Links).toBeDefined();
        expect(service2Links?.links).toHaveLength(1);
        expect(service2Links?.links).toEqual([
          {
            title: 'API Endpoint',
            url: 'https://api.example.com',
            type: 'qeta',
          },
        ]);
      });

      it('should exclude inactive posts', async () => {
        const entityId = await insertEntity('component:default/inactive-test');

        // Insert active link post
        const activeLinkPost = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'Active Link',
          url: 'https://example.com/active',
          status: 'active',
        });

        // Insert inactive link post
        const inactiveLinkPost = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'Inactive Link',
          url: 'https://example.com/inactive',
          status: 'inactive',
        });

        await insertPostEntity(activeLinkPost, entityId);
        await insertPostEntity(inactiveLinkPost, entityId);

        const result = await storage.getEntityLinks();

        expect(result).toHaveLength(1);
        expect(result[0].entityRef).toBe('component:default/inactive-test');
        expect(result[0].links).toHaveLength(1);
        expect(result[0].links[0]).toEqual({
          title: 'Active Link',
          url: 'https://example.com/active',
          type: 'qeta',
        });
      });

      it('should exclude non-link posts', async () => {
        const entityId = await insertEntity('component:default/non-link-test');

        // Insert question post
        const questionPost = await insertPost({
          ...post,
          type: 'question' as const,
          title: 'Question Post',
          url: 'https://example.com/question',
          status: 'active',
        });

        // Insert link post
        const linkPost = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'Link Post',
          url: 'https://example.com/link',
          status: 'active',
        });

        await insertPostEntity(questionPost, entityId);
        await insertPostEntity(linkPost, entityId);

        const result = await storage.getEntityLinks();

        expect(result).toHaveLength(1);
        expect(result[0].entityRef).toBe('component:default/non-link-test');
        expect(result[0].links).toHaveLength(1);
        expect(result[0].links[0]).toEqual({
          title: 'Link Post',
          url: 'https://example.com/link',
          type: 'qeta',
        });
      });

      it('should exclude posts without URLs', async () => {
        const entityId = await insertEntity('component:default/no-url-test');

        // Insert link post without URL
        const linkPostNoUrl = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'Link Without URL',
          url: null,
          status: 'active',
        });

        // Insert link post with URL
        const linkPostWithUrl = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'Link With URL',
          url: 'https://example.com/link',
          status: 'active',
        });

        await insertPostEntity(linkPostNoUrl, entityId);
        await insertPostEntity(linkPostWithUrl, entityId);

        const result = await storage.getEntityLinks();

        expect(result).toHaveLength(1);
        expect(result[0].entityRef).toBe('component:default/no-url-test');
        expect(result[0].links).toHaveLength(1);
        expect(result[0].links[0]).toEqual({
          title: 'Link With URL',
          url: 'https://example.com/link',
          type: 'qeta',
        });
      });

      it('should handle multiple links for the same entity', async () => {
        const entityId = await insertEntity(
          'component:default/multi-links-service',
        );

        // Insert multiple link posts for the same entity
        const linkPost1 = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'Documentation',
          url: 'https://example.com/docs',
          status: 'active',
        });

        const linkPost2 = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'Source Code',
          url: 'https://github.com/example/repo',
          status: 'active',
        });

        const linkPost3 = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'API Reference',
          url: 'https://api.example.com/reference',
          status: 'active',
        });

        await insertPostEntity(linkPost1, entityId);
        await insertPostEntity(linkPost2, entityId);
        await insertPostEntity(linkPost3, entityId);

        const result = await storage.getEntityLinks();

        expect(result).toHaveLength(1);
        expect(result[0].entityRef).toBe(
          'component:default/multi-links-service',
        );
        expect(result[0].links).toHaveLength(3);
        expect(result[0].links).toEqual(
          expect.arrayContaining([
            {
              title: 'Documentation',
              url: 'https://example.com/docs',
              type: 'qeta',
            },
            {
              title: 'Source Code',
              url: 'https://github.com/example/repo',
              type: 'qeta',
            },
            {
              title: 'API Reference',
              url: 'https://api.example.com/reference',
              type: 'qeta',
            },
          ]),
        );
      });

      it('should return results in database query order', async () => {
        // Insert entities in reverse alphabetical order
        const entity1Id = await insertEntity('system:default/z-system');
        const entity2Id = await insertEntity('component:default/a-component');
        const entity3Id = await insertEntity('component:default/m-component');

        // Insert link posts
        const linkPost1 = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'Z System Link',
          url: 'https://example.com/z',
          status: 'active',
        });

        const linkPost2 = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'A Component Link',
          url: 'https://example.com/a',
          status: 'active',
        });

        const linkPost3 = await insertPost({
          ...post,
          type: 'link' as const,
          title: 'M Component Link',
          url: 'https://example.com/m',
          status: 'active',
        });

        await insertPostEntity(linkPost1, entity1Id);
        await insertPostEntity(linkPost2, entity2Id);
        await insertPostEntity(linkPost3, entity3Id);

        const result = await storage.getEntityLinks();

        expect(result).toHaveLength(3);
        // Results should be in the order they appear in the database query
        const entityRefs = result.map(r => r.entityRef);
        expect(entityRefs).toContain('system:default/z-system');
        expect(entityRefs).toContain('component:default/a-component');
        expect(entityRefs).toContain('component:default/m-component');
      });
    });

    describe('statistics', () => {
      it('should get most upvoted posts', async () => {
        const id1 = await insertPost(post);
        const id2 = await insertPost({ ...post, author: 'user2' });
        await votePost(id1, 'user3');
        await votePost(id1, 'user4');
        await votePost(id2, 'user3');

        const ret = await storage.getMostUpvotedPosts({
          options: { limit: 5 },
        });
        expect(ret.length).toBe(2);
        expect(ret[0].author).toBe('user');
        expect(Number(ret[0].total)).toBe(2);
        expect(ret[1].author).toBe('user2');
        expect(Number(ret[1].total)).toBe(1);
      });

      it('should get most upvoted answers', async () => {
        const id = await insertPost(post);
        const a1 = await insertAnswer({ ...answer, postId: id });
        const a2 = await insertAnswer({
          ...answer,
          postId: id,
          author: 'user2',
        });

        await voteAnswer(a1, 'user3');
        await voteAnswer(a1, 'user4');
        await voteAnswer(a2, 'user3');

        const ret = await storage.getMostUpvotedAnswers({
          options: { limit: 5 },
        });
        expect(ret.length).toBe(2);
        expect(ret[0].author).toBe('user');
        expect(Number(ret[0].total)).toBe(2);
        expect(ret[1].author).toBe('user2');
        expect(Number(ret[1].total)).toBe(1);
      });
    });

    describe('permission filters', () => {
      beforeEach(async () => {
        // Create posts with different tag combinations
        await storage.createPost({
          user_ref: 'user1',
          title: 'Post with tag1',
          content: 'content1',
          created: new Date(),
          tags: ['tag1'],
        });

        await storage.createPost({
          user_ref: 'user1',
          title: 'Post with tag2',
          content: 'content2',
          created: new Date(),
          tags: ['tag2'],
        });

        await storage.createPost({
          user_ref: 'user1',
          title: 'Post with tag1 and tag2',
          content: 'content3',
          created: new Date(),
          tags: ['tag1', 'tag2'],
        });

        await storage.createPost({
          user_ref: 'user1',
          title: 'Post with tag3',
          content: 'content4',
          created: new Date(),
          tags: ['tag3'],
        });

        // Create posts with different entity combinations
        await storage.createPost({
          user_ref: 'user1',
          title: 'Post with entity1',
          content: 'content5',
          created: new Date(),
          entities: ['component:default/test1'],
        });

        await storage.createPost({
          user_ref: 'user1',
          title: 'Post with entity2',
          content: 'content6',
          created: new Date(),
          entities: ['component:default/test2'],
        });

        await storage.createPost({
          user_ref: 'user1',
          title: 'Post with entity1 and entity2',
          content: 'content7',
          created: new Date(),
          entities: ['component:default/test1', 'component:default/test2'],
        });

        await storage.createPost({
          user_ref: 'user1',
          title: 'Post with entity3',
          content: 'content8',
          created: new Date(),
          entities: ['component:default/test3'],
        });
      });

      describe('tag filters', () => {
        it('should filter posts with ANY of the specified tags (OR logic)', async () => {
          // This simulates postHasAnyTag rule: anyOf [tag1, tag2]
          const filters = {
            property: 'tags' as const,
            values: ['tag1', 'tag2'],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(3);
          const titles = result.posts.map(p => p.title).sort();
          expect(titles).toEqual([
            'Post with tag1',
            'Post with tag1 and tag2',
            'Post with tag2',
          ]);
        });

        it('should filter posts with ALL of the specified tags (AND logic)', async () => {
          // This simulates postHasTags rule: allOf [tag1, tag2]
          const filters: PermissionCriteria<PostFilter> = {
            allOf: [
              {
                property: 'tags',
                values: ['tag1'],
              },
              {
                property: 'tags',
                values: ['tag2'],
              },
            ],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(1);
          expect(result.posts[0].title).toBe('Post with tag1 and tag2');
          expect(result.posts[0].tags).toContain('tag1');
          expect(result.posts[0].tags).toContain('tag2');
        });

        it('should return empty when filtering with non-existent tag', async () => {
          const filters = {
            property: 'tags' as const,
            values: ['nonexistent'],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(0);
        });

        it('should filter posts with ANY of 3 tags', async () => {
          const filters = {
            property: 'tags' as const,
            values: ['tag1', 'tag2', 'tag3'],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(4);
        });

        it('should filter posts with ALL of 3 tags (none match)', async () => {
          const filters: PermissionCriteria<PostFilter> = {
            allOf: [
              {
                property: 'tags',
                values: ['tag1'],
              },
              {
                property: 'tags',
                values: ['tag2'],
              },
              {
                property: 'tags',
                values: ['tag3'],
              },
            ],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(0);
        });
      });

      describe('entity filters', () => {
        it('should filter posts with ANY of the specified entities (OR logic)', async () => {
          // This simulates postHasAnyEntity rule: anyOf [entity1, entity2]
          const filters = {
            property: 'entityRefs' as const,
            values: ['component:default/test1', 'component:default/test2'],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(3);
          const titles = result.posts.map(p => p.title).sort();
          expect(titles).toEqual([
            'Post with entity1',
            'Post with entity1 and entity2',
            'Post with entity2',
          ]);
        });

        it('should filter posts with ALL of the specified entities (AND logic)', async () => {
          // This simulates postHasEntities rule: allOf [entity1, entity2]
          const filters: PermissionCriteria<PostFilter> = {
            allOf: [
              {
                property: 'entityRefs',
                values: ['component:default/test1'],
              },
              {
                property: 'entityRefs',
                values: ['component:default/test2'],
              },
            ],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(1);
          expect(result.posts[0].title).toBe('Post with entity1 and entity2');
          expect(result.posts[0].entities).toContain('component:default/test1');
          expect(result.posts[0].entities).toContain('component:default/test2');
        });

        it('should return empty when filtering with non-existent entity', async () => {
          const filters = {
            property: 'entityRefs' as const,
            values: ['component:default/nonexistent'],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(0);
        });

        it('should filter posts with ANY of 3 entities', async () => {
          const filters = {
            property: 'entityRefs' as const,
            values: [
              'component:default/test1',
              'component:default/test2',
              'component:default/test3',
            ],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(4);
        });

        it('should filter posts with ALL of 3 entities (none match)', async () => {
          const filters: PermissionCriteria<PostFilter> = {
            allOf: [
              {
                property: 'entityRefs',
                values: ['component:default/test1'],
              },
              {
                property: 'entityRefs',
                values: ['component:default/test2'],
              },
              {
                property: 'entityRefs',
                values: ['component:default/test3'],
              },
            ],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(0);
        });
      });

      describe('combined filters', () => {
        it('should filter posts with ANY tag AND ANY entity', async () => {
          // Create a post with both tags and entities
          await storage.createPost({
            user_ref: 'user1',
            title: 'Post with tag1 and entity1',
            content: 'combined content',
            created: new Date(),
            tags: ['tag1'],
            entities: ['component:default/test1'],
          });

          const filters: PermissionCriteria<PostFilter> = {
            allOf: [
              {
                property: 'tags',
                values: ['tag1'],
              },
              {
                property: 'entityRefs',
                values: ['component:default/test1'],
              },
            ],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(1);
          expect(result.posts[0].title).toBe('Post with tag1 and entity1');
          expect(result.posts[0].tags).toContain('tag1');
          expect(result.posts[0].entities).toContain('component:default/test1');
        });

        it('should filter posts with (tag1 OR tag2) AND entity1', async () => {
          // Create posts for testing
          await storage.createPost({
            user_ref: 'user1',
            title: 'Post with tag1 and entity1',
            content: 'content',
            created: new Date(),
            tags: ['tag1'],
            entities: ['component:default/test1'],
          });

          await storage.createPost({
            user_ref: 'user1',
            title: 'Post with tag2 and entity1',
            content: 'content',
            created: new Date(),
            tags: ['tag2'],
            entities: ['component:default/test1'],
          });

          const filters: PermissionCriteria<PostFilter> = {
            allOf: [
              {
                property: 'tags',
                values: ['tag1', 'tag2'],
              },
              {
                property: 'entityRefs',
                values: ['component:default/test1'],
              },
            ],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(2);
          const titles = result.posts.map(p => p.title).sort();
          expect(titles).toEqual([
            'Post with tag1 and entity1',
            'Post with tag2 and entity1',
          ]);
        });

        it('should support complex nested filters', async () => {
          // (tag1 OR tag2) AND (entity1 OR entity2)
          await storage.createPost({
            user_ref: 'user1',
            title: 'Complex post 1',
            content: 'content',
            created: new Date(),
            tags: ['tag1'],
            entities: ['component:default/test1'],
          });

          await storage.createPost({
            user_ref: 'user1',
            title: 'Complex post 2',
            content: 'content',
            created: new Date(),
            tags: ['tag2'],
            entities: ['component:default/test2'],
          });

          const filters: PermissionCriteria<PostFilter> = {
            allOf: [
              {
                property: 'tags',
                values: ['tag1', 'tag2'],
              },
              {
                property: 'entityRefs',
                values: ['component:default/test1', 'component:default/test2'],
              },
            ],
          };

          const result = await storage.getPosts('user1', {}, filters);

          expect(result.posts.length).toBe(2);
          const titles = result.posts.map(p => p.title).sort();
          expect(titles).toEqual(['Complex post 1', 'Complex post 2']);
        });
      });

      describe('NOT filters', () => {
        it('should filter posts NOT having specific tag', async () => {
          const filters = {
            not: {
              property: 'tags' as const,
              values: ['tag1'],
            },
          };

          const result = await storage.getPosts('user1', {}, filters);

          // Should get posts without tag1 (both "Post with tag1" and "Post with tag1 and tag2" should be excluded)
          const titles = result.posts.map(p => p.title);
          expect(titles).not.toContain('Post with tag1');
          expect(titles).not.toContain('Post with tag1 and tag2');
          expect(titles).toContain('Post with tag2');
          expect(titles).toContain('Post with tag3');
        });

        it('should filter posts NOT having ANY of multiple tags', async () => {
          const filters = {
            not: {
              property: 'tags' as const,
              values: ['tag1', 'tag2'],
            },
          };

          const result = await storage.getPosts('user1', {}, filters);

          // Should only get posts that have neither tag1 nor tag2
          const titles = result.posts.map(p => p.title);
          expect(titles).not.toContain('Post with tag1');
          expect(titles).not.toContain('Post with tag2');
          expect(titles).not.toContain('Post with tag1 and tag2');
          expect(titles).toContain('Post with tag3');
        });

        it('should filter posts NOT having specific entity', async () => {
          const filters = {
            not: {
              property: 'entityRefs' as const,
              values: ['component:default/test1'],
            },
          };

          const result = await storage.getPosts('user1', {}, filters);

          // Should get posts without entity1 (both "Post with entity1" and "Post with entity1 and entity2" should be excluded)
          const titles = result.posts.map(p => p.title);
          expect(titles).not.toContain('Post with entity1');
          expect(titles).not.toContain('Post with entity1 and entity2');
          expect(titles).toContain('Post with entity2');
          expect(titles).toContain('Post with entity3');
        });

        it('should filter posts NOT having ANY of multiple entities', async () => {
          const filters = {
            not: {
              property: 'entityRefs' as const,
              values: ['component:default/test1', 'component:default/test2'],
            },
          };

          const result = await storage.getPosts('user1', {}, filters);

          // Should only get posts that have neither entity1 nor entity2
          const titles = result.posts.map(p => p.title);
          expect(titles).not.toContain('Post with entity1');
          expect(titles).not.toContain('Post with entity2');
          expect(titles).not.toContain('Post with entity1 and entity2');
          expect(titles).toContain('Post with entity3');
        });

        it('should combine NOT filter with positive filter', async () => {
          // Get posts with tag2 but NOT tag1
          const filters: PermissionCriteria<PostFilter> = {
            allOf: [
              {
                property: 'tags',
                values: ['tag2'],
              },
              {
                not: {
                  property: 'tags',
                  values: ['tag1'],
                },
              },
            ],
          };

          const result = await storage.getPosts('user1', {}, filters);

          // Should only get "Post with tag2"
          expect(result.posts.length).toBe(1);
          expect(result.posts[0].title).toBe('Post with tag2');
        });
      });
    });

    describe('users', () => {
      it('should return user stats', async () => {
        await insertPost({ ...post, author: 'user1', title: 't1' });
        await insertPost({ ...post, author: 'user1', title: 't2' });
        const user = await storage.getUser('user1');
        expect(user).toBeDefined();
        expect(user?.totalQuestions).toBe(2);
        expect(user?.userRef).toBe('user1');
      });

      it('should return users', async () => {
        await insertPost({ ...post, author: 'user1', title: 't1' });
        await insertPost({ ...post, author: 'user2', title: 't2' });
        const users = await storage.getUsers();
        expect(users.users.length).toBe(2);
        expect(users.total).toBe(2);
      });

      it('should return users count', async () => {
        await insertPost({ ...post, author: 'user1', title: 't1' });
        await insertPost({ ...post, author: 'user2', title: 't2' });
        const count = await storage.getUsersCount();
        expect(count).toBe(2);
      });
    });

    describe('Automatic Collections', () => {
      it('should automatically add post to collection based on tags', async () => {
        await insertTag('java');
        const collection = await storage.createCollection({
          user_ref: 'user1',
          title: 'Java Collection',
          created: new Date(),
          tags: ['java'],
        });

        const post1 = await storage.createPost({
          user_ref: 'user1',
          title: 'Java Post',
          content: 'content',
          created: new Date(),
          tags: ['java'],
        });

        const collectionPosts = await storage.getCollection(
          'user1',
          collection.id,
        );
        expect(collectionPosts?.posts?.length).toBe(1);
        expect(collectionPosts?.posts?.[0]?.id).toBe(post1.id);
      });

      it('should automatically add post to collection based on users', async () => {
        const collection = await storage.createCollection({
          user_ref: 'user1',
          title: 'User Collection',
          created: new Date(),
          users: ['user:default/author1'],
        });

        const post1 = await storage.createPost({
          user_ref: 'user:default/author1',
          title: 'User Post',
          content: 'content',
          created: new Date(),
        });

        const collectionPosts = await storage.getCollection(
          'user1',
          collection.id,
        );
        expect(collectionPosts?.posts?.length).toBe(1);
        expect(collectionPosts?.posts?.[0]?.id).toBe(post1.id);
      });

      it('should automatically add post to collection based on entities', async () => {
        const collection = await storage.createCollection({
          user_ref: 'user1',
          title: 'Component Collection',
          created: new Date(),
          entities: ['component:default/comp1'],
        });

        const post1 = await storage.createPost({
          user_ref: 'user1',
          title: 'Component Post',
          content: 'content',
          created: new Date(),
          entities: ['component:default/comp1'],
        });

        const collectionPosts = await storage.getCollection(
          'user1',
          collection.id,
        );
        expect(collectionPosts?.posts?.length).toBe(1);
        expect(collectionPosts?.posts?.[0]?.id).toBe(post1.id);
      });

      it('should sync existing posts when creating collection', async () => {
        const post1 = await storage.createPost({
          user_ref: 'user1',
          title: 'Java Post',
          content: 'content',
          created: new Date(),
          tags: ['java'],
        });

        const collection = await storage.createCollection({
          user_ref: 'user1',
          title: 'Java Collection',
          created: new Date(),
          tags: ['java'],
        });

        const collectionPosts = await storage.getCollection(
          'user1',
          collection.id,
        );
        expect(collectionPosts?.posts?.length).toBe(1);
        expect(collectionPosts?.posts?.[0]?.id).toBe(post1.id);
      });

      it('should sync existing posts when updating collection', async () => {
        const post1 = await storage.createPost({
          user_ref: 'user1',
          title: 'Java Post',
          content: 'content',
          created: new Date(),
          tags: ['java'],
        });

        const collection = await storage.createCollection({
          user_ref: 'user1',
          title: 'Java Collection',
          created: new Date(),
        });

        let collectionPosts = await storage.getCollection(
          'user1',
          collection.id,
        );
        expect(collectionPosts?.posts?.length).toBe(0);

        await storage.updateCollection({
          id: collection.id,
          user_ref: 'user1',
          title: 'Java Collection',
          tags: ['java'],
        });

        collectionPosts = await storage.getCollection('user1', collection.id);
        expect(collectionPosts?.posts?.length).toBe(1);
        expect(collectionPosts?.posts?.[0]?.id).toBe(post1.id);
      });

      it('should remove post from collection if tags change', async () => {
        const collection = await storage.createCollection({
          user_ref: 'user1',
          title: 'Java Collection',
          created: new Date(),
          tags: ['java'],
        });

        const post1 = await storage.createPost({
          user_ref: 'user1',
          title: 'Java Post',
          content: 'content',
          created: new Date(),
          tags: ['java'],
        });

        let collectionPosts = await storage.getCollection(
          'user1',
          collection.id,
        );
        expect(collectionPosts?.posts?.length).toBe(1);

        await storage.updatePost({
          id: post1.id,
          user_ref: 'user1',
          tags: ['python'],
        });

        collectionPosts = await storage.getCollection('user1', collection.id);
        expect(collectionPosts?.posts?.length).toBe(0);
      });

      it('should not remove manually added posts even if tags mismatch', async () => {
        const collection = await storage.createCollection({
          user_ref: 'user1',
          title: 'Java Collection',
          created: new Date(),
          tags: ['java'],
        });

        const post1 = await storage.createPost({
          user_ref: 'user1',
          title: 'Python Post',
          content: 'content',
          created: new Date(),
          tags: ['python'],
        });

        await storage.addPostToCollection('user1', collection.id, post1.id);

        let collectionPosts = await storage.getCollection(
          'user1',
          collection.id,
        );
        expect(collectionPosts?.posts?.length).toBe(1);

        // Update post tags - should trigger sync but not remove manually added post
        await storage.updatePost({
          id: post1.id,
          user_ref: 'user1',
          tags: ['ruby'],
        });

        collectionPosts = await storage.getCollection('user1', collection.id);
        expect(collectionPosts?.posts?.length).toBe(1);
      });
    });
  },
);
