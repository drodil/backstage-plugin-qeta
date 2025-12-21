import {
  TagResponse,
  TagsQuery,
  TagsResponse,
  UserTagsResponse,
  filterTags,
} from '@drodil/backstage-plugin-qeta-common';
import { Knex } from 'knex';
import { TagDatabase } from '@drodil/backstage-plugin-qeta-node';
import { QetaFilters } from '../../service/util';
import { PermissionCriteria } from '@backstage/plugin-permission-common';
import { TAGS } from '../../tagDb';
import { BaseStore } from './BaseStore';

export interface RawTagEntity {
  id: number;
  tag: string;
  description?: string;
  postsCount: number | string;
  questionsCount: number | string;
  articlesCount: number | string;
  linksCount: number | string;
  followerCount: number | string;
}

export interface RawTagExpert {
  tagId: number;
  entityRef: string;
}

export class TagsStore extends BaseStore {
  constructor(
    protected readonly db: Knex,
    private readonly tagDatabase?: TagDatabase,
  ) {
    super(db);
  }

  async getTags(
    options?: { noDescription?: boolean; ids?: number[] } & TagsQuery,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<TagsResponse> {
    const query = this.getTagBaseQuery();

    if (options?.ids) {
      query.whereIn('tags.id', options.ids);
    }

    if (options?.searchQuery) {
      this.applySearchQuery(query, ['tag'], options.searchQuery);
    }

    if (filters) {
      this.parseFilter(filters, query, this.db, 'tags');
    }

    const totalQuery = query.clone();

    if (options?.orderBy) {
      query.orderBy(options?.orderBy, options?.order || 'desc');
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const results = await Promise.all([
      query,
      this.db(totalQuery.as('totalQuery')).count('* as CNT').first(),
    ]);
    const rows = results[0] as RawTagEntity[];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      tags: await this.mapTagEntities(rows, options),
      total,
    };
  }

  async getTagById(id: number): Promise<TagResponse | null> {
    const query = this.getTagBaseQuery();
    const rows = await query.where('tags.id', id);
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0] as RawTagEntity;
    return (await this.mapTagEntities([row]))[0];
  }

  async getTag(tag: string): Promise<TagResponse | null> {
    const query = this.getTagBaseQuery();
    const rows = await query.where('tag', tag);
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0] as RawTagEntity;
    return (await this.mapTagEntities([row]))[0];
  }

  async createTag(
    tag: string,
    description?: string,
    experts?: string[],
  ): Promise<TagResponse | null> {
    const ids = await this.db
      .insert({
        tag,
        description,
      })
      .into('tags')
      .returning('id');

    if (experts && experts.length > 0) {
      await this.updateTagExperts(ids[0].id, experts);
    }

    return this.getTagById(ids[0].id);
  }

  async updateTag(
    id: number,
    description?: string,
    experts?: string[],
  ): Promise<TagResponse | null> {
    await this.db('tags').where('id', id).update({
      description,
    });

    if (experts) {
      await this.updateTagExperts(id, experts);
    }
    return this.getTagById(id);
  }

  async deleteTag(id: number): Promise<boolean> {
    const rows = await this.db('tags').where('id', id).delete();
    return rows > 0;
  }

  async getTagExperts(tags: string[]): Promise<string[]> {
    const rows = await this.db('tag_experts')
      .leftJoin('tags', 'tag_experts.tagId', 'tags.id')
      .whereIn('tags.tag', tags)
      .select('tag_experts.entityRef');
    return [...new Set(rows.map(r => r.entityRef))];
  }

  async getUserTags(
    user_ref: string,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<UserTagsResponse> {
    const query = this.db('user_tags')
      .leftJoin('tags', 'user_tags.tagId', 'tags.id')
      .where('userRef', user_ref)
      .select('tags.tag');

    if (filters) {
      this.parseFilter(filters, query, this.db, 'tags');
    }
    const tags = await query;

    return {
      tags: tags.map(tag => tag.tag),
      count: tags.length,
    };
  }

  async followTag(user_ref: string, tag: string): Promise<boolean> {
    const tagId = await this.db('tags').where('tag', tag).select('id').first();
    if (!tagId) {
      return false;
    }
    await this.db
      .insert(
        {
          userRef: user_ref,
          tagId: tagId.id,
        },
        ['tagId'],
      )
      .into('user_tags');
    return true;
  }

  async unfollowTag(user_ref: string, tag: string): Promise<boolean> {
    const tagId = await this.db('tags').where('tag', tag).select('id').first();
    if (!tagId) {
      return false;
    }
    await this.db('user_tags')
      .where('userRef', user_ref)
      .where('tagId', tagId.id)
      .delete();
    return true;
  }

  async getUsersForTags(tags?: string[]): Promise<string[]> {
    if (!tags || tags.length === 0) {
      return [];
    }

    const users = await this.db('user_tags')
      .leftJoin('tags', 'user_tags.tagId', 'tags.id')
      .whereIn('tags.tag', tags)
      .select('userRef');
    return users.map(u => u.userRef);
  }

  async getRelatedTags(
    ids: number[],
    tableName: string = 'post_tags',
    columnName: string = 'postId',
    tagsFilter?: PermissionCriteria<QetaFilters>,
  ): Promise<Map<number, string[]>> {
    if (ids.length === 0) {
      return new Map();
    }
    const query = this.db<RawTagEntity>('tags')
      .leftJoin(tableName, 'tags.id', `${tableName}.tagId`)
      .whereIn(`${tableName}.${columnName}`, ids)
      .select('tags.tag', `${tableName}.${columnName} as entityId`);

    if (tagsFilter) {
      this.parseFilter(tagsFilter, query, this.db, 'tags');
    }

    const result = new Map<number, string[]>();
    const rows = await query.select();
    rows.forEach((row: any) => {
      const ps = result.get(row.entityId) || [];
      ps.push(row.tag);
      result.set(row.entityId, ps);
    });
    return result;
  }

  async addTags(
    id: number,
    tagsInput?: string[],
    removeOld?: boolean,
    tableName: string = 'post_tags',
    columnName: string = 'postId',
  ) {
    const tags = filterTags(tagsInput);
    if (removeOld) {
      await this.db(tableName).where(columnName, '=', id).delete();
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
          .insert({ [columnName]: id, tagId })
          .into(tableName)
          .onConflict()
          .ignore();
      }),
    );
  }

  private getTagBaseQuery() {
    const tagRef = this.db.ref('tags.id');
    const postsCount = this.db('post_tags')
      .where('post_tags.tagId', tagRef)
      .count('*')
      .as('postsCount');

    const questionsCount = this.db('post_tags')
      .leftJoin('posts', 'post_tags.postId', 'posts.id')
      .where('post_tags.tagId', tagRef)
      .where('posts.type', 'question')
      .count('*')
      .as('questionsCount');

    const articlesCount = this.db('post_tags')
      .leftJoin('posts', 'post_tags.postId', 'posts.id')
      .where('post_tags.tagId', tagRef)
      .where('posts.type', 'article')
      .count('*')
      .as('articlesCount');

    const linksCount = this.db('post_tags')
      .leftJoin('posts', 'post_tags.postId', 'posts.id')
      .where('post_tags.tagId', tagRef)
      .where('posts.type', 'link')
      .count('*')
      .as('linksCount');

    const followerCount = this.db('user_tags')
      .where('user_tags.tagId', tagRef)
      .count('*')
      .as('followerCount');

    return this.db('tags')
      .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
      .orderBy('postsCount', 'desc')
      .select(
        'id',
        'tag',
        'description',
        postsCount,
        questionsCount,
        articlesCount,
        linksCount,
        followerCount,
      )
      .groupBy('tags.id');
  }

  async getTagExpertsForTags(tagIds: number[]): Promise<Map<number, string[]>> {
    if (tagIds.length === 0) {
      return new Map();
    }
    const rows = await this.db<RawTagExpert>('tag_experts')
      .whereIn('tagId', tagIds)
      .select();
    const result = new Map<number, string[]>();
    rows.forEach(row => {
      const ps = result.get(row.tagId) || [];
      ps.push(row.entityRef);
      result.set(row.tagId, ps);
    });
    return result;
  }

  private async mapTagEntities(
    rows: RawTagEntity[],
    options?: { noDescription?: boolean },
  ): Promise<TagResponse[]> {
    const tagIds = rows.map(r => r.id);
    const expertsMap = await this.getTagExpertsForTags(tagIds);
    return rows.map(row => {
      return {
        id: row.id,
        tag: row.tag,
        description: options?.noDescription ? undefined : row.description,
        postsCount: this.mapToInteger(row.postsCount),
        questionsCount: this.mapToInteger(row.questionsCount),
        articlesCount: this.mapToInteger(row.articlesCount),
        linksCount: this.mapToInteger(row.linksCount),
        followerCount: this.mapToInteger(row.followerCount),
        experts: expertsMap.get(row.id) ?? [],
      };
    });
  }

  private async updateTagExperts(id: number, experts: string[]) {
    await this.db('tag_experts').where('tagId', id).delete();
    await this.db
      .insert(experts.map(e => ({ tagId: id, entityRef: e })))
      .into('tag_experts')
      .onConflict(['tagId', 'entityRef'])
      .merge();
  }
}
