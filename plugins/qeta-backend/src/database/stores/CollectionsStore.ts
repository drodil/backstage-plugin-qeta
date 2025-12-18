import {
  Collection,
  CollectionsQuery,
} from '@drodil/backstage-plugin-qeta-common';
import {
  CollectionOptions,
  CollectionPostRank,
  Collections,
  PostOptions,
} from '../QetaStore';
import { Knex } from 'knex';
import { compact } from 'lodash';
import { BaseStore } from './BaseStore';
import { AttachmentsStore } from './AttachmentsStore';

export interface RawCollectionEntity {
  id: number;
  title: string;
  description: string;
  created: Date;
  owner: string;
  headerImage: string;
  postsCount: number | string;
}

export class CollectionsStore extends BaseStore {
  constructor(
    protected readonly db: Knex,
    private readonly postsStore: {
      getPosts(
        user_ref: string,
        options: any,
        filters?: any,
        opts?: PostOptions,
      ): Promise<any>;
    },
    private readonly attachmentsStore: AttachmentsStore,
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
      // headers, // Removed unused
      created,
      images,
      headerImage,
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

    await this.updateAttachments(
      'collectionId',
      description ?? '',
      images ?? [],
      collections[0].id,
      headerImage,
    );

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
    const { id, user_ref, title, description, images, headerImage, opts } =
      options;

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

    await this.updateAttachments(
      'collectionId',
      description ?? '',
      images ?? [],
      id,
      headerImage,
    );

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
      .where('collection_id', collectionId)
      .where('post_id', postId)
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
      .where('collection_id', collectionId)
      .orderBy('rank', 'asc')
      .first();

    return post ? { postId: post.post_id, rank: post.rank } : null;
  }

  async getBottomRankedPostId(
    collectionId: number,
  ): Promise<CollectionPostRank | null> {
    const post = await this.db('collection_posts')
      .where('collection_id', collectionId)
      .orderBy('rank', 'desc')
      .first();

    return post ? { postId: post.post_id, rank: post.rank } : null;
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
      .where('collection_id', collectionId)
      .where('rank', '>', currentPostRank)
      .orderBy('rank', 'asc')
      .first();

    return post ? { postId: post.post_id, rank: post.rank } : null;
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
      .where('collection_id', collectionId)
      .where('rank', '<', currentPostRank)
      .orderBy('rank', 'desc')
      .first();

    return post ? { postId: post.post_id, rank: post.rank } : null;
  }

  async updatePostRank(
    collectionId: number,
    postId: number,
    rank: number,
  ): Promise<void> {
    await this.db('collection_posts')
      .where('collection_id', collectionId)
      .where('post_id', postId)
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

    const [posts, attachments, followers, experts] = await Promise.all([
      includePosts && this.postsStore
        ? this.postsStore.getPosts(
            user_ref,
            { collectionIds: collectionIds, includeEntities: true },
            postFilters,
            {
              tagsFilter: options?.tagFilters,
              includeComments: false,
              includeAnswers: false,
              includeAttachments: false,
              includeVotes: false,
              includeTotal: false,
              includeExperts: includeExperts ?? false,
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
    ]);

    const postsMap = new Map<number, any[]>();
    (posts as any).posts?.forEach((p: any) => {
      const ps = postsMap.get(p.collectionId) || [];
      ps.push(p);
      postsMap.set(p.collectionId, ps);
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
      const entities = compact([
        ...new Set(collectionPosts.map((p: any) => p.entities).flat()),
      ]);
      const tags = compact([
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
        entities: entities as string[],
        tags: tags as string[],
        images: attachmentsMap.get(val.id) || [],
        followers: followersMap.get(val.id) || 0,
        experts: expertsMap.get(val.id),
      };
    });
  }

  private getCollectionsBaseQuery() {
    return this.db<RawCollectionEntity>('collections')
      .select('collections.*')
      .groupBy('collections.id');
  }
}
