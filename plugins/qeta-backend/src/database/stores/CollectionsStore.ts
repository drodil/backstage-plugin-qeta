import {
  Collection,
  CollectionsQuery,
  filterTags,
} from '@drodil/backstage-plugin-qeta-common';
import {
  CollectionOptions,
  CollectionPostRank,
  Collections,
} from '../QetaStore';
import { Knex } from 'knex';
import { compact } from 'lodash';
import { BaseStore } from './BaseStore';
import { AttachmentsStore } from './AttachmentsStore';
import { PostsStore } from './PostsStore';
import { TAGS } from '../../tagDb';
import { TagDatabase } from '@drodil/backstage-plugin-qeta-node';

export interface RawCollectionEntity {
  id: number;
  title: string;
  description: string;
  created: Date;
  owner: string;
  headerImage: string;
  postsCount: number | string;
  questionsCount: number | string;
  articlesCount: number | string;
  linksCount: number | string;
  followerCount: number | string;
}

export class CollectionsStore extends BaseStore {
  constructor(
    protected readonly db: Knex,
    private readonly postsStore: PostsStore,
    private readonly attachmentsStore: AttachmentsStore,
    private readonly tagDatabase?: TagDatabase,
  ) {
    super(db);
  }

  async getCollections(
    user_ref: string,
    options: CollectionsQuery,
    opts?: CollectionOptions,
  ): Promise<Collections> {
    const query = this.getCollectionsBaseQuery();

    if (options.searchQuery) {
      this.applySearchQuery(
        query,
        ['collections.title', 'collections.description'],
        options.searchQuery,
      );
    }

    if (opts?.filters) {
      this.parseFilter(opts.filters, query, this.db, 'collection');
    }

    if (options.owner) {
      query.where('collections.owner', '=', options.owner);
    }

    if (options.ids && options.ids.length > 0) {
      query.whereIn('collections.id', options.ids);
    }

    const totalQuery = query.clone();

    if (options.orderBy) {
      query.orderBy(options.orderBy, options.order ? options.order : 'desc');
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

    const rows = results[0] as RawCollectionEntity[];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      collections: await this.mapCollectionEntities(rows, user_ref, opts),
      total,
    };
  }

  async getCollection(
    user_ref: string,
    id: number,
    options?: CollectionOptions,
  ): Promise<Collection | null> {
    const query = this.getCollectionsBaseQuery();
    const rows = await query.where('collections.id', '=', id);
    if (rows.length === 0) {
      return null;
    }
    return (
      await this.mapCollectionEntities(
        [rows[0] as RawCollectionEntity],
        user_ref,
        options,
      )
    )[0];
  }

  async createCollection(options: {
    user_ref: string;
    title: string;
    description?: string;
    created: Date;
    images?: number[];
    headerImage?: string;
    opts?: CollectionOptions;
  }): Promise<Collection> {
    const {
      user_ref,
      title,
      description,
      created,
      images,
      headerImage,
      tags,
      entities,
      users,
      opts,
    } = options as any;

    const collections = await this.db
      .insert(
        {
          owner: user_ref,
          title,
          description,
          created,
          headerImage,
        },
        ['id'],
      )
      .into('collections')
      .returning('*');

    await Promise.all([
      this.updateAttachments(
        'collectionId',
        description ?? '',
        images ?? [],
        collections[0].id,
        headerImage,
      ),
      this.addCollectionTags(collections[0].id, tags),
      this.addCollectionEntities(collections[0].id, entities),
      this.addCollectionUsers(collections[0].id, users),
    ]);

    // Automatically sync posts to this collection based on tags, entities, and users
    await this.syncCollectionToPosts(collections[0].id);

    return (
      await this.mapCollectionEntities([collections[0]], user_ref, opts)
    )[0];
  }

  async updateCollection(options: {
    id: number;
    user_ref: string;
    title: string;
    description?: string;
    images?: number[];
    headerImage?: string;
    opts?: CollectionOptions;
  }): Promise<Collection | null> {
    const {
      id,
      user_ref,
      title,
      description,
      images,
      headerImage,
      tags,
      entities,
      users,
      opts,
    } = options as any;

    const rows = await this.db('collections')
      .where('id', '=', id)
      .update({
        title,
        description,
        headerImage,
      })
      .returning('*');

    if (!rows || rows.length === 0) {
      return null;
    }

    await Promise.all([
      this.updateAttachments(
        'collectionId',
        description ?? '',
        images ?? [],
        id,
        headerImage,
      ),
      this.addCollectionTags(id, tags, true),
      this.addCollectionEntities(id, entities, true),
      this.addCollectionUsers(id, users, true),
    ]);

    return (await this.mapCollectionEntities([rows[0]], user_ref, opts))[0];
  }

  async deleteCollection(id: number): Promise<boolean> {
    const rows = await this.db('collections').where('id', '=', id).delete();
    return rows > 0;
  }

  async getUserCollections(
    user_ref: string,
    options?: CollectionOptions,
  ): Promise<{ collections: Collection[]; count: number }> {
    const results = await this.getCollections(user_ref, options || {});
    return { collections: results.collections, count: results.total };
  }

  async getPostRank(
    collectionId: number,
    postId: number,
  ): Promise<number | null> {
    const post = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .where('postId', postId)
      .first();

    if (!post) {
      return null;
    }

    return post.rank;
  }

  async getTopRankedPostId(
    collectionId: number,
  ): Promise<CollectionPostRank | null> {
    const post = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .orderBy('rank', 'asc')
      .first();

    return post ? { postId: post.postId, rank: post.rank } : null;
  }

  async getBottomRankedPostId(
    collectionId: number,
  ): Promise<CollectionPostRank | null> {
    const post = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .orderBy('rank', 'desc')
      .first();

    return post ? { postId: post.postId, rank: post.rank } : null;
  }

  async getNextRankedPostId(
    collectionId: number,
    postId: number,
  ): Promise<CollectionPostRank | null> {
    const currentPostRank = await this.getPostRank(collectionId, postId);
    if (currentPostRank === null) {
      return null;
    }

    const post = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .where('rank', '>', currentPostRank)
      .orderBy('rank', 'asc')
      .first();

    return post ? { postId: post.postId, rank: post.rank } : null;
  }

  async getPreviousRankedPostId(
    collectionId: number,
    postId: number,
  ): Promise<CollectionPostRank | null> {
    const currentPostRank = await this.getPostRank(collectionId, postId);
    if (currentPostRank === null) {
      return null;
    }

    const post = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .where('rank', '<', currentPostRank)
      .orderBy('rank', 'desc')
      .first();

    return post ? { postId: post.postId, rank: post.rank } : null;
  }

  async updatePostRank(
    collectionId: number,
    postId: number,
    rank: number,
  ): Promise<void> {
    await this.db('collection_posts')
      .where('collectionId', collectionId)
      .where('postId', postId)
      .update({ rank });
  }

  async addPostToCollection(
    user_ref: string,
    id: number,
    postId: number,
    options?: CollectionOptions,
  ): Promise<Collection | null> {
    await this.db
      .insert({
        collectionId: id,
        postId,
      })
      .into('collection_posts');
    await this.db('collections').where('id', id).increment('postsCount', 1);
    return this.getCollection(user_ref, id, options);
  }

  async removePostFromCollection(
    user_ref: string,
    id: number,
    postId: number,
    options?: CollectionOptions,
  ): Promise<Collection | null> {
    const rows = await this.db('collection_posts')
      .where('collectionId', id)
      .where('postId', postId)
      .delete();
    if (rows > 0) {
      await this.db('collections').where('id', id).decrement('postsCount', 1);
    }
    return this.getCollection(user_ref, id, options);
  }

  async getUsersForCollection(collectionId: number): Promise<string[]> {
    const users = await this.db('user_collections')
      .where('collectionId', collectionId)
      .select('userRef');
    return users.map(user => user.userRef);
  }

  async getUsersForCollections(
    collectionIds: number[],
  ): Promise<Map<number, string[]>> {
    if (collectionIds.length === 0) {
      return new Map();
    }

    const users = await this.db('user_collections')
      .whereIn('collectionId', collectionIds)
      .select('collectionId', 'userRef');

    const usersByCollection = new Map<number, string[]>();
    for (const user of users) {
      const existing = usersByCollection.get(user.collectionId) || [];
      existing.push(user.userRef);
      usersByCollection.set(user.collectionId, existing);
    }

    return usersByCollection;
  }

  async syncCollectionToPosts(collectionId: number): Promise<number[]> {
    const tags = await this.getCollectionTags([collectionId]);
    const entities = await this.getCollectionEntities([collectionId]);
    const users = await this.getCollectionUsers([collectionId]);

    const collectionTags = tags.get(collectionId) || [];
    const collectionEntities = entities.get(collectionId) || [];
    const collectionUsers = users.get(collectionId) || [];

    if (
      collectionTags.length === 0 &&
      collectionEntities.length === 0 &&
      collectionUsers.length === 0
    ) {
      await this.db('collection_posts')
        .where('collectionId', collectionId)
        .where('automatic', true)
        .delete();
      return [];
    }

    // Get existing automatic posts before adding new ones
    const existingPosts = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .where('automatic', true)
      .select('postId');
    const existingPostIds = new Set(existingPosts.map(p => p.postId));

    const posts = await this.db('posts')
      .leftJoin('post_tags', 'posts.id', 'post_tags.postId')
      .leftJoin('tags', 'post_tags.tagId', 'tags.id')
      .leftJoin('post_entities', 'posts.id', 'post_entities.postId')
      .leftJoin('entities', 'post_entities.entityId', 'entities.id')
      .where(builder => {
        if (collectionTags.length > 0) {
          builder.orWhereIn('tags.tag', collectionTags);
        }
        if (collectionEntities.length > 0) {
          builder.orWhereIn('entities.entity_ref', collectionEntities);
        }
        if (collectionUsers.length > 0) {
          builder.orWhereIn('posts.author', collectionUsers);
        }
      })
      .select('posts.id')
      .distinct();

    const postIds = posts.map(p => p.id);

    const newPostIds = postIds.filter(postId => !existingPostIds.has(postId));

    if (postIds.length > 0) {
      await this.db
        .insert(
          postIds.map(postId => ({
            collectionId,
            postId,
            automatic: true,
          })),
        )
        .into('collection_posts')
        .onConflict(['collectionId', 'postId'])
        .ignore();
    }

    const deleteQuery = this.db('collection_posts')
      .where('collectionId', collectionId)
      .where('automatic', true);

    if (postIds.length > 0) {
      deleteQuery.whereNotIn('postId', postIds);
    }

    await deleteQuery.delete();
    const count = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .count('* as CNT')
      .first();
    await this.db('collections')
      .where('id', collectionId)
      .update('postsCount', this.mapToInteger((count as any)?.CNT));

    return newPostIds;
  }

  async syncPostToCollections(postId: number): Promise<number[]> {
    const post = await this.postsStore.getPost('', postId);

    if (!post) {
      return [];
    }

    const postTags = post.tags || [];
    const postEntities = post.entities || [];
    const postAuthor = post.author;

    // Get existing automatic collections before adding new ones
    const existingCollections = await this.db('collection_posts')
      .where('postId', postId)
      .where('automatic', true)
      .select('collectionId');
    const existingCollectionIds = new Set(
      existingCollections.map(c => c.collectionId),
    );

    const collections = await this.db('collections')
      .leftJoin(
        'collection_tags',
        'collections.id',
        'collection_tags.collectionId',
      )
      .leftJoin('tags', 'collection_tags.tagId', 'tags.id')
      .leftJoin(
        'collection_entities',
        'collections.id',
        'collection_entities.collectionId',
      )
      .leftJoin('entities', 'collection_entities.entityId', 'entities.id')
      .leftJoin(
        'collection_users',
        'collections.id',
        'collection_users.collectionId',
      )
      .where(builder => {
        if (postTags.length > 0) {
          builder.orWhereIn('tags.tag', postTags);
        }
        if (postEntities.length > 0) {
          builder.orWhereIn('entities.entity_ref', postEntities);
        }
        if (postAuthor) {
          builder.orWhere('collection_users.userRef', postAuthor);
        }
      })
      .select('collections.id')
      .distinct();

    const collectionIds = collections.map(c => c.id);

    const newCollectionIds = collectionIds.filter(
      collectionId => !existingCollectionIds.has(collectionId),
    );

    if (collectionIds.length > 0) {
      await this.db
        .insert(
          collectionIds.map(collectionId => ({
            collectionId,
            postId,
            automatic: true,
          })),
        )
        .into('collection_posts')
        .onConflict(['collectionId', 'postId'])
        .ignore();
    }

    const deleteQuery = this.db('collection_posts')
      .where('postId', postId)
      .where('automatic', true);

    if (collectionIds.length > 0) {
      deleteQuery.whereNotIn('collectionId', collectionIds);
    }

    await deleteQuery.delete();

    if (collectionIds.length > 0) {
      await Promise.all(
        collectionIds.map(async collectionId => {
          const count = await this.db('collection_posts')
            .where('collectionId', collectionId)
            .count('* as CNT')
            .first();
          await this.db('collections')
            .where('id', collectionId)
            .update('postsCount', this.mapToInteger((count as any)?.CNT));
        }),
      );
    }

    return newCollectionIds;
  }

  async followCollection(
    user_ref: string,
    collectionId: number,
  ): Promise<boolean> {
    await this.db
      .insert({
        userRef: user_ref,
        collectionId,
      })
      .into('user_collections');
    return true;
  }

  async unfollowCollection(
    user_ref: string,
    collectionId: number,
  ): Promise<boolean> {
    await this.db('user_collections')
      .where('userRef', user_ref)
      .where('collectionId', collectionId)
      .delete();
    return true;
  }

  async getFollowerCounts(ids: number[]): Promise<Map<number, number>> {
    if (ids.length === 0) {
      return new Map();
    }
    const followers = await this.db('user_collections')
      .select('collectionId')
      .count('* as count')
      .whereIn('collectionId', ids)
      .groupBy('collectionId');

    const result = new Map<number, number>();
    followers.forEach((f: any) => {
      result.set(f.collectionId, this.mapToInteger(f.count));
    });
    return result;
  }

  async getCollectionTags(ids: number[]): Promise<Map<number, string[]>> {
    const rows = await this.db('collection_tags')
      .leftJoin('tags', 'collection_tags.tagId', 'tags.id')
      .whereIn('collection_tags.collectionId', ids)
      .select('collection_tags.collectionId', 'tags.tag');

    const result = new Map<number, string[]>();
    rows.forEach(row => {
      const tags = result.get(row.collectionId) || [];
      tags.push(row.tag);
      result.set(row.collectionId, tags);
    });
    return result;
  }

  async getCollectionEntities(ids: number[]): Promise<Map<number, string[]>> {
    const rows = await this.db('collection_entities')
      .leftJoin('entities', 'collection_entities.entityId', 'entities.id')
      .whereIn('collection_entities.collectionId', ids)
      .select('collection_entities.collectionId', 'entities.entity_ref');

    const result = new Map<number, string[]>();
    rows.forEach(row => {
      const entities = result.get(row.collectionId) || [];
      entities.push(row.entity_ref);
      result.set(row.collectionId, entities);
    });
    return result;
  }

  async getCollectionUsers(ids: number[]): Promise<Map<number, string[]>> {
    const rows = await this.db('collection_users')
      .whereIn('collectionId', ids)
      .select('collectionId', 'userRef');

    const result = new Map<number, string[]>();
    rows.forEach(row => {
      const users = result.get(row.collectionId) || [];
      users.push(row.userRef);
      result.set(row.collectionId, users);
    });
    return result;
  }

  private async mapCollectionEntities(
    rows: RawCollectionEntity[],
    user_ref: string,
    options?: CollectionOptions,
  ): Promise<Collection[]> {
    if (rows.length === 0) {
      return [];
    }

    const collectionIds = rows.map(r => r.id);
    const {
      postFilters,
      includePosts = true,
      includeExperts = true,
    } = options ?? {};

    const [posts, attachments, followers, experts, tags, entities, users] =
      await Promise.all([
        includePosts && this.postsStore
          ? this.postsStore.getPosts(
              user_ref,
              { includeEntities: true },
              postFilters,
              {
                tagsFilter: options?.tagFilters,
                includeComments: false,
                includeAnswers: false,
                includeAttachments: false,
                includeVotes: false,
                includeTotal: false,
                includeExperts: includeExperts ?? false,
                includeHealth: false,
                includeTags: true,
                includeCollections: true,
                collectionIds: collectionIds,
              },
            )
          : { posts: [] },
        this.attachmentsStore.getAttachments(collectionIds, 'collectionId'),
        this.getFollowerCounts(collectionIds),
        includeExperts
          ? this.db('tag_experts')
              .leftJoin('tags', 'tag_experts.tagId', 'tags.id')
              .leftJoin('post_tags', 'post_tags.tagId', 'tags.id')
              .leftJoin(
                'collection_posts',
                'collection_posts.postId',
                'post_tags.postId',
              )
              .whereIn('collection_posts.collectionId', collectionIds)
              .select('collection_posts.collectionId', 'tag_experts.entityRef')
          : undefined,
        this.getCollectionTags(collectionIds),
        this.getCollectionEntities(collectionIds),
        this.getCollectionUsers(collectionIds),
      ]);

    const postsMap = new Map<number, any[]>();
    posts.posts?.forEach((p: any) => {
      if (p.collectionIds && Array.isArray(p.collectionIds)) {
        p.collectionIds.forEach((collectionId: number) => {
          const ps = postsMap.get(collectionId) || [];
          ps.push(p);
          postsMap.set(collectionId, ps);
        });
      }
    });

    const attachmentsMap = attachments ?? new Map<number, number[]>();

    const followersMap = followers ?? new Map<number, number>();

    const expertsMap = new Map<number, string[]>();
    experts?.forEach((e: any) => {
      const ps = expertsMap.get(e.collectionId) || [];
      ps.push(e.entityRef);
      expertsMap.set(e.collectionId, ps);
    });

    return rows.map(val => {
      const collectionPosts = postsMap.get(val.id) || [];
      const postEntities = compact([
        ...new Set(collectionPosts.map((p: any) => p.entities).flat()),
      ]);
      const postTags = compact([
        ...new Set(collectionPosts.map((p: any) => p.tags).flat()),
      ]);

      return {
        id: val.id,
        title: val.title,
        owner: val.owner,
        description: val.description,
        created: val.created as Date,
        posts: collectionPosts,
        headerImage: val.headerImage,
        postsCount: this.mapToInteger(val.postsCount),
        questionsCount: this.mapToInteger(val.questionsCount),
        articlesCount: this.mapToInteger(val.articlesCount),
        linksCount: this.mapToInteger(val.linksCount),
        entities: entities.get(val.id) || [],
        tags: tags.get(val.id) || [],
        users: users.get(val.id) || [],
        postEntities: postEntities as string[],
        postTags: postTags as string[],
        images: attachmentsMap.get(val.id) || [],
        followers: followersMap.get(val.id) || 0,
        experts: expertsMap.get(val.id),
      };
    });
  }

  private getCollectionsBaseQuery() {
    const questionsCount = this.db('collection_posts')
      .leftJoin('posts', 'collection_posts.postId', 'posts.id')
      .where('collection_posts.collectionId', this.db.ref('collections.id'))
      .where('posts.type', 'question')
      .count('*')
      .as('questionsCount');

    const articlesCount = this.db('collection_posts')
      .leftJoin('posts', 'collection_posts.postId', 'posts.id')
      .where('collection_posts.collectionId', this.db.ref('collections.id'))
      .where('posts.type', 'article')
      .count('*')
      .as('articlesCount');

    const linksCount = this.db('collection_posts')
      .leftJoin('posts', 'collection_posts.postId', 'posts.id')
      .where('collection_posts.collectionId', this.db.ref('collections.id'))
      .where('posts.type', 'link')
      .count('*')
      .as('linksCount');

    const followerCount = this.db('user_collections')
      .where('user_collections.collectionId', this.db.ref('collections.id'))
      .count('*')
      .as('followerCount');

    return this.db<RawCollectionEntity>('collections')
      .select(
        'collections.*',
        questionsCount,
        articlesCount,
        linksCount,
        followerCount,
      )
      .groupBy('collections.id');
  }

  private async addCollectionTags(
    id: number,
    tagsInput?: string[],
    removeOld?: boolean,
  ) {
    const tags = filterTags(tagsInput);
    if (removeOld) {
      await this.db('collection_tags').where('collectionId', '=', id).delete();
    }

    if (!tags || tags.length === 0) {
      return;
    }

    const existingTags = await this.db('tags')
      .whereIn('tag', tags)
      .returning('id')
      .select();
    const newTags = tags.filter(t => !existingTags.some(e => e.tag === t));
    const allTags: Record<string, string> = {
      ...TAGS,
      ...(await this.tagDatabase?.getTags()),
    };

    const tagIds = (
      await Promise.all(
        [...new Set(newTags)].map(async tag => {
          const trimmed = tag.trim();
          const description = trimmed in allTags ? allTags[trimmed] : undefined;

          return this.db
            .insert({ tag: trimmed, description })
            .into('tags')
            .returning('id')
            .onConflict('tag')
            .ignore();
        }),
      )
    )
      .flat()
      .map(tag => tag.id)
      .concat(existingTags.map(t => t.id));

    await Promise.all(
      tagIds.map(async tagId => {
        await this.db
          .insert({ collectionId: id, tagId })
          .into('collection_tags')
          .onConflict()
          .ignore();
      }),
    );
  }

  private async addCollectionEntities(
    id: number,
    entitiesInput?: string[],
    removeOld?: boolean,
  ) {
    if (removeOld) {
      await this.db('collection_entities')
        .where('collectionId', '=', id)
        .delete();
    }

    const regex = /\w+:\w+\/\w+/;
    const entities =
      entitiesInput
        ?.filter(t => regex.test(t))
        .map(t => t.toLowerCase())
        .filter(t => t.length > 0) ?? [];

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
        [...new Set(newEntities)].map(async entityRef =>
          this.db
            .insert({ entity_ref: entityRef })
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
          .insert({ collectionId: id, entityId })
          .into('collection_entities')
          .onConflict()
          .ignore();
      }),
    );
  }

  private async addCollectionUsers(
    id: number,
    usersInput?: string[],
    removeOld?: boolean,
  ) {
    if (removeOld) {
      await this.db('collection_users').where('collectionId', '=', id).delete();
    }

    const users = [...new Set(usersInput?.filter(u => u.length > 0) ?? [])];

    if (users.length === 0) {
      return;
    }

    await Promise.all(
      users.map(async userRef => {
        await this.db
          .insert({ collectionId: id, userRef })
          .into('collection_users');
      }),
    );
  }
}
