import { Knex } from 'knex';
import { BaseStore } from './BaseStore';
import { Badge, UserBadge } from '@drodil/backstage-plugin-qeta-common';
import { AwardBadgeResult } from '../QetaStore';

export class BadgesStore extends BaseStore {
  constructor(protected readonly db: Knex) {
    super(db);
  }

  async getBadges(): Promise<Badge[]> {
    return this.db('badges').select('*');
  }

  async getBadge(key: string): Promise<Badge | undefined> {
    return this.db('badges').where('key', key).first();
  }

  async getUserBadges(userRef: string): Promise<UserBadge[]> {
    const rows = await this.db('user_badges')
      .join('badges', 'user_badges.badgeId', 'badges.id')
      .where('userRef', userRef)
      .select('user_badges.*', 'badges.*');

    return rows.map((row: any) => ({
      id: row.id,
      userRef: row.userRef,
      created: row.created,
      badge: {
        id: row.badgeId,
        key: row.key,
        name: row.name,
        description: row.description,
        icon: row.icon,
        level: row.level,
        type: row.type,
        system: row.system,
        reputation: row.reputation,
      },
      uniqueKey: row.uniqueKey,
    }));
  }

  async awardBadge(
    userRef: string,
    badgeKey: string,
    uniqueKey?: string,
  ): Promise<AwardBadgeResult | null> {
    const badge = await this.getBadge(badgeKey);
    if (!badge) {
      return null;
    }

    let existing;
    if (uniqueKey) {
      existing = await this.db('user_badges')
        .where('userRef', userRef)
        .where('badgeId', badge.id)
        .where('uniqueKey', uniqueKey)
        .first();
    } else {
      existing = await this.db('user_badges')
        .where('userRef', userRef)
        .where('badgeId', badge.id)
        .first();
    }

    if (existing) {
      return {
        badge: {
          id: existing.id,
          userRef: existing.userRef,
          badge,
          created: existing.created,
          uniqueKey: existing.uniqueKey,
        },
        isNew: false,
      };
    }

    const created = new Date();
    const [id] = await this.db('user_badges')
      .insert({
        userRef,
        badgeId: badge.id,
        created,
        uniqueKey,
      })
      .returning('id');

    return {
      badge: {
        id,
        userRef,
        badge,
        created,
        uniqueKey,
      },
      isNew: true,
    };
  }

  async createBadge(badge: Omit<Badge, 'id'>): Promise<void> {
    const { key, name, description, icon, level, type, reputation } = badge;
    await this.db('badges')
      .insert({
        key,
        name,
        description,
        icon,
        level,
        type,
        reputation,
      })
      .onConflict('key')
      .merge();
  }
}
