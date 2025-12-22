import { QetaStore } from '../database/QetaStore';
import { BADGE_EVALUATORS } from '../badges';
import { UserBadge } from '@drodil/backstage-plugin-qeta-common';

export class BadgeManager {
  private initPromise: Promise<void>;

  constructor(private readonly store: QetaStore) {
    this.initPromise = this.initializeBadges();
  }

  private async initializeBadges(): Promise<void> {
    for (const badge of BADGE_EVALUATORS) {
      await this.store.createBadge(badge);
    }
  }

  async processUserBadges(userRef: string): Promise<UserBadge[]> {
    await this.initPromise;
    const userBadges = [];

    const postsResponse = await this.store.getPosts(userRef, {
      author: userRef,
      status: 'active',
    });

    for (const post of postsResponse.posts) {
      for (const evaluator of BADGE_EVALUATORS) {
        if (evaluator.evaluate) {
          const achieved = await evaluator.evaluate(post);
          if (achieved) {
            const uniqueKey = `post:${post.id}`;
            const badge = await this.store.awardBadge(
              userRef,
              evaluator.key,
              uniqueKey,
            );
            if (badge) {
              userBadges.push(badge);
            }
          }
        }
      }
    }

    for (const evaluator of BADGE_EVALUATORS) {
      if (evaluator.evaluateCollection) {
        const achieved = await evaluator.evaluateCollection(
          postsResponse.posts,
        );
        if (achieved) {
          const badge = await this.store.awardBadge(userRef, evaluator.key);
          if (badge) {
            userBadges.push(badge);
          }
        }
      }
    }

    const answersResponse = await this.store.getAnswers(userRef, {
      author: userRef,
    });
    for (const answer of answersResponse.answers) {
      for (const evaluator of BADGE_EVALUATORS) {
        if (evaluator.evaluate) {
          const achieved = await evaluator.evaluate(answer);
          if (achieved) {
            const uniqueKey = `answer:${answer.id}`;
            const badge = await this.store.awardBadge(
              userRef,
              evaluator.key,
              uniqueKey,
            );
            if (badge) {
              userBadges.push(badge);
            }
          }
        }
      }
    }

    for (const evaluator of BADGE_EVALUATORS) {
      if (evaluator.evaluateCollection) {
        const achieved = await evaluator.evaluateCollection(
          answersResponse.answers,
        );
        if (achieved) {
          const badge = await this.store.awardBadge(userRef, evaluator.key);
          if (badge) {
            userBadges.push(badge);
          }
        }
      }
    }

    const user = await this.store.getUser(userRef);

    for (const evaluator of BADGE_EVALUATORS) {
      if (evaluator.evaluateUser && user) {
        const achieved = await evaluator.evaluateUser(user);
        if (achieved) {
          const badge = await this.store.awardBadge(userRef, evaluator.key);
          if (badge) {
            userBadges.push(badge);
          }
        }
      }
    }

    return userBadges;
  }
}
