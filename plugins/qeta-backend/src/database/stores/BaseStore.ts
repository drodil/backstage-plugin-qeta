import { Knex } from 'knex';
import { QetaFilter, QetaFilters } from '../../service/util';
import { PermissionCriteria } from '@backstage/plugin-permission-common';
import {
  isAndCriteria,
  isNotCriteria,
  isOrCriteria,
} from '@backstage/plugin-permission-node';
import { compact } from 'lodash';

function isQetaFilter(filter: any): filter is QetaFilter {
  return filter.hasOwnProperty('property');
}

export abstract class BaseStore {
  constructor(protected readonly db: Knex) {}

  protected mapToInteger(val: string | number | undefined): number {
    return typeof val === 'string' ? Number.parseInt(val, 10) : val ?? 0;
  }

  protected mapToBoolean(val: string | number | boolean | undefined): boolean {
    if (typeof val === 'string') {
      return val === 'true' || val === '1';
    }
    return typeof val === 'number' ? val > 0 : !!val;
  }

  protected applySearchQuery(
    query: Knex.QueryBuilder,
    columns: string[],
    searchQuery: string,
  ) {
    if (this.db.client.config.client === 'pg') {
      const formattedQuery = searchQuery
        .trim()
        .split(/\s+/)
        .map(term => `'${term.replace(/'/g, "''")}':*`)
        .join(' & ');

      query.whereRaw(
        `((to_tsvector('english', CONCAT_WS(' ', ${columns.join(
          ',',
        )})) @@ to_tsquery('english', ?)))`,
        [formattedQuery],
      );
    } else {
      query.whereRaw(`LOWER(CONCAT(${columns.join(',')})) LIKE LOWER(?)`, [
        `%${searchQuery}%`,
      ]);
    }
  }

  protected async updateAttachments(
    key: 'postId' | 'answerId' | 'collectionId',
    content: string,
    images: number[],
    id: number,
    headerImage?: string,
  ) {
    if (images.length > 0) {
      await this.db('attachments')
        .whereIn('id', images)
        .update({ [key]: id });
    }

    const attachments = await this.db('attachments')
      .where(key, id)
      .select('uuid');
    const uuids = attachments.map(a => a.uuid);
    const toRemove = uuids.filter(uuid => {
      return !(content.includes(uuid) || headerImage?.includes(uuid));
    });
    await this.db('attachments')
      .whereIn('uuid', toRemove)
      .update({ [key]: null });
  }

  protected parseFilter(
    filter: PermissionCriteria<QetaFilters>,
    query: Knex.QueryBuilder,
    db: Knex,
    type: 'post' | 'answer' | 'collection' | 'tags' | 'comments' = 'post',
    negate: boolean = false,
  ): Knex.QueryBuilder {
    if (isNotCriteria(filter)) {
      return this.parseFilter(filter.not, query, db, type, !negate);
    }

    if (isQetaFilter(filter)) {
      const values: string[] = compact(filter.values) ?? [];

      let fk = 'posts.id';
      if (type === 'answer') {
        fk = 'answers.postId';
      } else if (type === 'collection') {
        fk = 'collection_posts.postId';
      }
      if (filter.property === 'tags') {
        const postIds = db('tags')
          .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
          .where('tags.tag', 'in', values)
          .select('post_tags.postId');
        query[negate ? 'whereNotIn' : 'whereIn'](fk, postIds);
        return query;
      }
      if (filter.property === 'tag.experts') {
        if (type === 'post') {
          const postIds = db('tags')
            .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
            .leftJoin('tag_experts', 'tag_experts.tagId', 'tags.id')
            .where('tag_experts.entityRef', 'in', values)
            .select('post_tags.postId');
          query[negate ? 'whereNotIn' : 'whereIn'](fk, postIds);
          return query;
        } else if (type === 'answer') {
          const answerIds = db('answers')
            .leftJoin('posts', 'answers.postId', 'posts.id')
            .leftJoin('post_tags', 'post_tags.postId', 'posts.id')
            .leftJoin('tags', 'post_tags.tagId', 'tags.id')
            .leftJoin('tag_experts', 'tag_experts.tagId', 'tags.id')
            .where('tag_experts.entityRef', 'in', values)
            .select('answers.id');
          query[negate ? 'whereNotIn' : 'whereIn'](fk, answerIds);
          return query;
        } else if (type === 'tags') {
          const tagIds = db('tag_experts')
            .leftJoin('tags', 'tag_experts.tagId', 'tags.id')
            .where('tag_experts.entityRef', 'in', values)
            .select('tag_experts.tagId');
          query[negate ? 'whereNotIn' : 'whereIn'](fk, tagIds);
          return query;
        } else if (type === 'collection') {
          const collectionIds = db('collection_posts')
            .leftJoin('posts', 'collection_posts.postId', 'posts.id')
            .leftJoin('post_tags', 'post_tags.postId', 'posts.id')
            .leftJoin('tags', 'post_tags.tagId', 'tags.id')
            .leftJoin('tag_experts', 'tag_experts.tagId', 'tags.id')
            .where('tag_experts.entityRef', 'in', values)
            .select('collection_posts.collectionId');
          query[negate ? 'whereNotIn' : 'whereIn'](fk, collectionIds);
          return query;
        }
      }

      if (filter.property === 'entityRefs') {
        const postIds = db('entities')
          .leftJoin('post_entities', 'entities.id', 'post_entities.entityId')
          .where('entities.entity_ref', 'in', values)
          .select('post_entities.postId');
        query[negate ? 'whereNotIn' : 'whereIn'](fk, postIds);
        return query;
      }

      if (values.length === 0) {
        return negate
          ? query.whereNotNull(filter.property)
          : query.whereNull(filter.property);
      }

      return query[negate ? 'whereNotIn' : 'whereIn'](filter.property, values);
    }

    return query[negate ? 'andWhereNot' : 'andWhere'](builder => {
      const f = filter as PermissionCriteria<QetaFilters>;
      if (isOrCriteria(f)) {
        for (const subFilter of f.anyOf ?? []) {
          builder.orWhere((subQuery: Knex.QueryBuilder) =>
            this.parseFilter(subFilter, subQuery, db, type, false),
          );
        }
      } else if (isAndCriteria(f)) {
        for (const subFilter of f.allOf ?? []) {
          builder.andWhere((subQuery: Knex.QueryBuilder) =>
            this.parseFilter(subFilter, subQuery, db, type, false),
          );
        }
      } else if (isNotCriteria(f)) {
        builder.whereNot((subQuery: Knex.QueryBuilder) =>
          this.parseFilter(f.not, subQuery, db, type, false),
        );
      }
    });
  }
}
