import {
  EntitiesQuery,
  EntitiesResponse,
  EntityLinks,
  EntityResponse,
  UserEntitiesResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Knex } from 'knex';
import { EntityLink } from '@backstage/catalog-model';
import { BaseStore } from './BaseStore';
import { RawTagEntity } from './TagsStore';

export class EntitiesStore extends BaseStore {
  constructor(protected readonly db: Knex) {
    super(db);
  }

  async getEntities(
    options?: { entityRefs?: string[] } & EntitiesQuery,
  ): Promise<EntitiesResponse> {
    const query = this.getEntitiesBaseQuery();
    if (options?.entityRefs) {
      query.whereIn('entities.entity_ref', options.entityRefs);
    }

    const totalQuery = query.clone();

    if (options?.orderBy) {
      const orderBy =
        options.orderBy === 'entityRef'
          ? 'entities.entity_ref'
          : options.orderBy;
      query.orderBy(orderBy, options?.order || 'desc');
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

    const rows = results[0];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      total,
      entities: rows.map((entity: any) => {
        return {
          id: entity.id,
          entityRef: entity.entity_ref,
          postsCount: this.mapToInteger(entity.postsCount),
          questionsCount: this.mapToInteger(entity.questionsCount),
          articlesCount: this.mapToInteger(entity.articlesCount),
          linksCount: this.mapToInteger(entity.linksCount),
          followerCount: this.mapToInteger(entity.followerCount),
        };
      }),
    };
  }

  async getEntity(entity_ref: string): Promise<EntityResponse | null> {
    const query = this.getEntitiesBaseQuery();
    const rows = await query.where('entity_ref', '=', entity_ref);
    if (rows.length === 0) {
      return null;
    }
    return {
      id: rows[0].id,
      entityRef: rows[0].entity_ref,
      postsCount: this.mapToInteger(rows[0].postsCount),
      questionsCount: this.mapToInteger(rows[0].questionsCount),
      articlesCount: this.mapToInteger(rows[0].articlesCount),
      linksCount: this.mapToInteger(rows[0].linksCount),
      followerCount: this.mapToInteger(rows[0].followerCount),
    };
  }

  async getUserEntities(user_ref: string): Promise<UserEntitiesResponse> {
    const entities = await this.db('user_entities')
      .where('userRef', user_ref)
      .select('entityRef');

    return {
      entityRefs: entities.map(e => e.entityRef),
      count: entities.length,
    };
  }

  async getUsersForEntities(entityRefs?: string[]): Promise<string[]> {
    if (!entityRefs || entityRefs.length === 0) {
      return [];
    }

    const users = await this.db('user_entities')
      .whereIn('entityRef', entityRefs)
      .select('userRef');
    return users.map(user => user.userRef);
  }

  async followEntity(user_ref: string, entityRef: string): Promise<boolean> {
    await this.db
      .insert({
        userRef: user_ref,
        entityRef: entityRef,
      })
      .into('user_entities');
    return true;
  }

  async unfollowEntity(user_ref: string, entityRef: string): Promise<boolean> {
    await this.db('user_entities')
      .where('userRef', user_ref)
      .where('entityRef', entityRef)
      .delete();
    return true;
  }

  async getEntityLinks(): Promise<EntityLinks[]> {
    const rows = await this.db('posts')
      .leftJoin('post_entities', 'posts.id', 'post_entities.postId')
      .leftJoin('entities', 'post_entities.entityId', 'entities.id')
      .whereNotNull('posts.url')
      .where('posts.status', 'active')
      .where('posts.type', 'link')
      .whereNotNull('entities.entity_ref')
      .select('entities.entity_ref as entityRef', 'posts.title', 'posts.url');

    const entityLinksMap = new Map<string, EntityLink[]>();

    for (const row of rows) {
      const entityRef = row.entityRef;
      const link: EntityLink = {
        title: row.title,
        url: row.url,
        type: 'qeta',
      };

      if (!entityLinksMap.has(entityRef)) {
        entityLinksMap.set(entityRef, []);
      }
      entityLinksMap.get(entityRef)!.push(link);
    }

    // Convert map to array format
    return Array.from(entityLinksMap.entries()).map(([entityRef, links]) => ({
      entityRef,
      links,
    }));
  }

  async getRelatedEntities(
    ids: number[],
    tableName: string = 'post_entities',
    columnName: string = 'postId',
  ): Promise<Map<number, string[]>> {
    if (ids.length === 0) {
      return new Map();
    }
    const rows = await this.db<RawTagEntity>('entities')
      .leftJoin(tableName, 'entities.id', `${tableName}.entityId`)
      .whereIn(`${tableName}.${columnName}`, ids)
      .select('entities.entity_ref', `${tableName}.${columnName} as entityId`);

    const result = new Map<number, string[]>();
    rows.forEach((row: any) => {
      const ps = result.get(row.entityId) || [];
      ps.push(row.entity_ref);
      result.set(row.entityId, ps);
    });
    return result;
  }

  async addEntities(
    id: number,
    entitiesInput?: string[],
    removeOld?: boolean,
    tableName: string = 'post_entities',
    columnName: string = 'postId',
  ) {
    if (removeOld) {
      await this.db(tableName).where(columnName, '=', id).delete();
    }

    const regex = /\w+:\w+\/\w+/;
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
          .insert({ [columnName]: id, entityId })
          .into(tableName)
          .onConflict()
          .ignore();
      }),
    );
  }

  private getEntitiesBaseQuery() {
    const entityId = this.db.ref('entities.id');
    const entityRef = this.db.ref('entities.entity_ref');
    const postsCount = this.db('post_entities')
      .where('post_entities.entityId', entityId)
      .count('*')
      .as('postsCount');

    const questionsCount = this.db('post_entities')
      .leftJoin('posts', 'post_entities.postId', 'posts.id')
      .where('post_entities.entityId', entityId)
      .where('posts.type', 'question')
      .count('*')
      .as('questionsCount');

    const articlesCount = this.db('post_entities')
      .leftJoin('posts', 'post_entities.postId', 'posts.id')
      .where('post_entities.entityId', entityId)
      .where('posts.type', 'article')
      .count('*')
      .as('articlesCount');

    const linksCount = this.db('post_entities')
      .leftJoin('posts', 'post_entities.postId', 'posts.id')
      .where('post_entities.entityId', entityId)
      .where('posts.type', 'link')
      .count('*')
      .as('linksCount');

    const followerCount = this.db('user_entities')
      .where('user_entities.entityRef', entityRef)
      .count('*')
      .as('followerCount');

    return this.db('entities')
      .rightJoin('post_entities', 'entities.id', 'post_entities.entityId')
      .orderBy('postsCount', 'desc')
      .select(
        'id',
        'entity_ref',
        postsCount,
        questionsCount,
        articlesCount,
        linksCount,
        followerCount,
      )
      .groupBy('entities.id');
  }
}
