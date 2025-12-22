import { QetaStore } from '../database/QetaStore';
import { BADGE_EVALUATORS } from '../badges';
import { UserBadge } from '@drodil/backstage-plugin-qeta-common';
import { BadgeEvaluator } from '@drodil/backstage-plugin-qeta-node';
import { NotificationManager } from './NotificationManager';

export interface BadgeManagerOptions {
  store: QetaStore;
  customEvaluators?: BadgeEvaluator[];
  notificationManager: NotificationManager;
}

export class BadgeManager {
  private initPromise: Promise<void>;
  private readonly store: QetaStore;
  private readonly evaluators: BadgeEvaluator[];
  private readonly notificationManager: NotificationManager;

  constructor(options: BadgeManagerOptions) {
    this.store = options.store;
    this.evaluators = [
      ...BADGE_EVALUATORS,
      ...(options.customEvaluators ?? []),
    ];
    this.notificationManager = options.notificationManager;
    this.initPromise = this.initializeBadges();
  }

  private async initializeBadges(): Promise<void> {
    for (const badge of this.evaluators) {
      await this.store.createBadge(badge);
    }
  }

  async processUserBadges(userRef: string): Promise<UserBadge[]> {
    await this.initPromise;
    const userBadges: UserBadge[] = [];

    const postsResponse = await this.store.getPosts(userRef, {
      author: userRef,
      status: 'active',
    });

    for (const post of postsResponse.posts) {
      for (const evaluator of this.evaluators) {
        if (!evaluator.evaluate) {
          continue;
        }
        const achieved = await evaluator.evaluate(post);
        if (!achieved) {
          continue;
        }
        const uniqueKey = `post:${post.id}`;
        const result = await this.store.awardBadge(
          userRef,
          evaluator.key,
          uniqueKey,
        );
        if (!result) {
          continue;
        }
        userBadges.push(result.badge);
        if (result.isNew) {
          await this.notificationManager.onBadgeAwarded(userRef, result.badge);
        }
      }
    }

    for (const evaluator of this.evaluators) {
      if (!evaluator.evaluateCollection) {
        continue;
      }
      const achieved = await evaluator.evaluateCollection(postsResponse.posts);
      if (!achieved) {
        continue;
      }
      const result = await this.store.awardBadge(userRef, evaluator.key);
      if (!result) {
        continue;
      }
      userBadges.push(result.badge);
      if (result.isNew) {
        await this.notificationManager.onBadgeAwarded(userRef, result.badge);
      }
    }

    const answersResponse = await this.store.getAnswers(userRef, {
      author: userRef,
    });

    for (const answer of answersResponse.answers) {
      for (const evaluator of this.evaluators) {
        if (!evaluator.evaluate) {
          continue;
        }
        const achieved = await evaluator.evaluate(answer);
        if (!achieved) {
          continue;
        }
        const uniqueKey = `answer:${answer.id}`;
        const result = await this.store.awardBadge(
          userRef,
          evaluator.key,
          uniqueKey,
        );
        if (!result) {
          continue;
        }
        userBadges.push(result.badge);
        if (result.isNew) {
          await this.notificationManager.onBadgeAwarded(userRef, result.badge);
        }
      }
    }

    for (const evaluator of this.evaluators) {
      if (!evaluator.evaluateCollection) {
        continue;
      }
      const achieved = await evaluator.evaluateCollection(
        answersResponse.answers,
      );
      if (!achieved) {
        continue;
      }
      const result = await this.store.awardBadge(userRef, evaluator.key);
      if (!result) {
        continue;
      }
      userBadges.push(result.badge);
      if (result.isNew) {
        await this.notificationManager.onBadgeAwarded(userRef, result.badge);
      }
    }

    const collectionsResponse = await this.store.getCollections(userRef, {
      owner: userRef,
    });

    for (const collection of collectionsResponse.collections) {
      for (const evaluator of this.evaluators) {
        if (!evaluator.evaluate) {
          continue;
        }
        const achieved = await evaluator.evaluate(collection);
        if (!achieved) {
          continue;
        }
        const uniqueKey = `collection:${collection.id}`;
        const result = await this.store.awardBadge(
          userRef,
          evaluator.key,
          uniqueKey,
        );
        if (!result) {
          continue;
        }
        userBadges.push(result.badge);
        if (result.isNew) {
          await this.notificationManager.onBadgeAwarded(userRef, result.badge);
        }
      }
    }

    for (const evaluator of this.evaluators) {
      if (!evaluator.evaluateCollection) {
        continue;
      }
      const achieved = await evaluator.evaluateCollection(
        collectionsResponse.collections,
      );
      if (!achieved) {
        continue;
      }
      const result = await this.store.awardBadge(userRef, evaluator.key);
      if (!result) {
        continue;
      }
      userBadges.push(result.badge);
      if (result.isNew) {
        await this.notificationManager.onBadgeAwarded(userRef, result.badge);
      }
    }

    const user = await this.store.getUser(userRef);
    for (const evaluator of this.evaluators) {
      if (!evaluator.evaluateUser || !user) {
        continue;
      }
      const achieved = await evaluator.evaluateUser(user);
      if (!achieved) {
        continue;
      }
      const result = await this.store.awardBadge(userRef, evaluator.key);
      if (!result) {
        continue;
      }
      userBadges.push(result.badge);
      if (result.isNew) {
        await this.notificationManager.onBadgeAwarded(userRef, result.badge);
      }
    }

    return userBadges;
  }
}
