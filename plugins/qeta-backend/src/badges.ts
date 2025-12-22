import {
  Badge,
  QetaIdEntity,
  UserResponse,
  isQuestion,
  isPost,
  isArticle,
  isLink,
  isAnswer,
  isCollection,
} from '@drodil/backstage-plugin-qeta-common';
import { BadgeEvaluator } from '@drodil/backstage-plugin-qeta-node';

export class GoodQuestionEvaluator implements BadgeEvaluator {
  public readonly key = 'good-question';
  public readonly name = 'Good Question';
  public readonly description = 'Received more than 10 votes on a question';
  public readonly icon = 'star';
  public readonly level = 'bronze' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 10;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isQuestion(entity)) {
      return false;
    }

    return entity.score > 10;
  }
}

export class GreatQuestionEvaluator implements BadgeEvaluator {
  public readonly key = 'great-question';
  public readonly name = 'Great Question';
  public readonly description = 'Received more than 100 votes on a question';
  public readonly icon = 'local_police';
  public readonly level = 'silver' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 50;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isQuestion(entity)) {
      return false;
    }

    return entity.score > 100;
  }
}

export class FamousQuestionEvaluator implements BadgeEvaluator {
  public readonly key = 'famous-question';
  public readonly name = 'Famous Question';
  public readonly description = 'Question has somewhat more than 1000 views';
  public readonly icon = 'visibility';
  public readonly level = 'gold' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 20;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isQuestion(entity)) {
      return false;
    }

    return entity.views > 1000;
  }
}

export class GoodArticleEvaluator implements BadgeEvaluator {
  public readonly key = 'good-article';
  public readonly name = 'Good Article';
  public readonly description = 'Received more than 10 votes on an article';
  public readonly icon = 'star';
  public readonly level = 'bronze' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 10;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isArticle(entity)) {
      return false;
    }

    return entity.score > 10;
  }
}

export class GreatArticleEvaluator implements BadgeEvaluator {
  public readonly key = 'great-article';
  public readonly name = 'Great Article';
  public readonly description = 'Received more than 50 votes on an article';
  public readonly icon = 'local_police';
  public readonly level = 'silver' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 50;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isArticle(entity)) {
      return false;
    }

    return entity.score > 50;
  }
}

export class GoodLinkEvaluator implements BadgeEvaluator {
  public readonly key = 'good-link';
  public readonly name = 'Good Link';
  public readonly description = 'Received more than 10 votes on a link';
  public readonly icon = 'star';
  public readonly level = 'bronze' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 10;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isLink(entity)) {
      return false;
    }

    return entity.score > 10;
  }
}

export class GreatLinkEvaluator implements BadgeEvaluator {
  public readonly key = 'great-link';
  public readonly name = 'Great Link';
  public readonly description = 'Received more than 50 votes on a link';
  public readonly icon = 'local_police';
  public readonly level = 'silver' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 50;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isLink(entity)) {
      return false;
    }

    return entity.score > 50;
  }
}

export class GoodAnswerEvaluator implements BadgeEvaluator {
  public readonly key = 'good-answer';
  public readonly name = 'Good Answer';
  public readonly description = 'Received more than 10 votes on an answer';
  public readonly icon = 'star';
  public readonly level = 'bronze' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 10;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isAnswer(entity)) {
      return false;
    }

    return entity.score > 10;
  }
}

export class GreatAnswerEvaluator implements BadgeEvaluator {
  public readonly key = 'great-answer';
  public readonly name = 'Great Answer';
  public readonly description = 'Received more than 100 votes on an answer';
  public readonly icon = 'local_police';
  public readonly level = 'silver' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 50;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isAnswer(entity)) {
      return false;
    }

    const score = entity.score || 0;
    return score > 100;
  }
}

export class ExpertEvaluator implements BadgeEvaluator {
  public readonly key = 'expert';
  public readonly name = 'Expert';
  public readonly description = 'Achieved a reputation score of 5000';
  public readonly icon = 'workspace_premium';
  public readonly level = 'gold' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 100;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.reputation >= 5000;
  }
}

export class InquisitiveEvaluator implements BadgeEvaluator {
  public readonly key = 'inquisitive';
  public readonly name = 'Inquisitive';
  public readonly description = 'Asked more than 5 questions';
  public readonly icon = 'help';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 20;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalQuestions >= 5;
  }
}

export class CuriousMindEvaluator implements BadgeEvaluator {
  public readonly key = 'curious-mind';
  public readonly name = 'Curious Mind';
  public readonly description = 'Asked more than 20 questions';
  public readonly icon = 'psychology';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 50;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalQuestions >= 20;
  }
}

export class HelperEvaluator implements BadgeEvaluator {
  public readonly key = 'helper';
  public readonly name = 'Helper';
  public readonly description = 'Answered more than 5 questions';
  public readonly icon = 'support';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 20;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalAnswers >= 5;
  }
}

export class ProblemSolverEvaluator implements BadgeEvaluator {
  public readonly key = 'problem-solver';
  public readonly name = 'Problem Solver';
  public readonly description = 'Answered more than 20 questions';
  public readonly icon = 'build';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 50;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalAnswers >= 20;
  }
}

export class GuruEvaluator implements BadgeEvaluator {
  public readonly key = 'guru';
  public readonly name = 'Guru';
  public readonly description = 'Answered more than 50 questions';
  public readonly icon = 'school';
  public readonly level = 'gold' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 100;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalAnswers >= 50;
  }
}

export class StudentEvaluator implements BadgeEvaluator {
  public readonly key = 'student';
  public readonly name = 'Student';
  public readonly description = 'Viewed more than 10 posts';
  public readonly icon = 'menu_book';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 5;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalViews >= 10;
  }
}

export class TutorEvaluator implements BadgeEvaluator {
  public readonly key = 'tutor';
  public readonly name = 'Tutor';
  public readonly description = 'Viewed more than 50 posts';
  public readonly icon = 'cast_for_education';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 15;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalViews >= 50;
  }
}

export class ProfessorEvaluator implements BadgeEvaluator {
  public readonly key = 'professor';
  public readonly name = 'Professor';
  public readonly description = 'Viewed more than 200 posts';
  public readonly icon = 'school';
  public readonly level = 'gold' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 40;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalViews >= 200;
  }
}

export class SupporterEvaluator implements BadgeEvaluator {
  public readonly key = 'supporter';
  public readonly name = 'Supporter';
  public readonly description = 'Voted more than 10 times';
  public readonly icon = 'thumb_up';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 10;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalVotes >= 10;
  }
}

export class CriticEvaluator implements BadgeEvaluator {
  public readonly key = 'critic';
  public readonly name = 'Critic';
  public readonly description = 'Voted more than 50 times';
  public readonly icon = 'rate_review';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 30;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalVotes >= 50;
  }
}

export class BloggerEvaluator implements BadgeEvaluator {
  public readonly key = 'blogger';
  public readonly name = 'Blogger';
  public readonly description = 'Wrote an article';
  public readonly icon = 'article';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 20;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalArticles >= 1;
  }
}

export class JournalistEvaluator implements BadgeEvaluator {
  public readonly key = 'journalist';
  public readonly name = 'Journalist';
  public readonly description = 'Wrote more than 5 articles';
  public readonly icon = 'history_edu';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 50;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalArticles >= 5;
  }
}

export class ColumnistEvaluator implements BadgeEvaluator {
  public readonly key = 'columnist';
  public readonly name = 'Columnist';
  public readonly description = 'Wrote more than 20 articles';
  public readonly icon = 'view_column';
  public readonly level = 'gold' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 100;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalArticles >= 20;
  }
}

export class ConnectorEvaluator implements BadgeEvaluator {
  public readonly key = 'connector';
  public readonly name = 'Connector';
  public readonly description = 'Posted more than 5 links';
  public readonly icon = 'link';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 10;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalLinks >= 5;
  }
}

export class NetworkerEvaluator implements BadgeEvaluator {
  public readonly key = 'networker';
  public readonly name = 'Networker';
  public readonly description = 'Posted more than 20 links';
  public readonly icon = 'share';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 30;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalLinks >= 20;
  }
}

export class AmbassadorEvaluator implements BadgeEvaluator {
  public readonly key = 'ambassador';
  public readonly name = 'Ambassador';
  public readonly description = 'Posted more than 50 links';
  public readonly icon = 'public';
  public readonly level = 'gold' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 75;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalLinks >= 50;
  }
}

export class DiscussorEvaluator implements BadgeEvaluator {
  public readonly key = 'discussor';
  public readonly name = 'Discussor';
  public readonly description = 'Posted more than 10 comments';
  public readonly icon = 'comment';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 10;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalComments >= 10;
  }
}

export class CommentatorEvaluator implements BadgeEvaluator {
  public readonly key = 'commentator';
  public readonly name = 'Commentator';
  public readonly description = 'Posted more than 50 comments';
  public readonly icon = 'record_voice_over';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 30;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalComments >= 50;
  }
}

export class PunditEvaluator implements BadgeEvaluator {
  public readonly key = 'pundit';
  public readonly name = 'Pundit';
  public readonly description = 'Posted more than 200 comments';
  public readonly icon = 'campaign';
  public readonly level = 'gold' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 75;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalComments >= 200;
  }
}

export class EditorEvaluator implements BadgeEvaluator {
  public readonly key = 'editor';
  public readonly name = 'Editor';
  public readonly description = 'Wrote more than 100 articles';
  public readonly icon = 'gavel';
  public readonly level = 'diamond' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 200;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalArticles >= 100;
  }
}

export class HubEvaluator implements BadgeEvaluator {
  public readonly key = 'hub';
  public readonly name = 'Hub';
  public readonly description = 'Posted more than 100 links';
  public readonly icon = 'device_hub';
  public readonly level = 'diamond' as const;
  public readonly type = 'one-time' as const;
  public readonly system = true;
  public readonly reputation = 150;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalLinks >= 100;
  }
}

export class OratorEvaluator implements BadgeEvaluator {
  public readonly key = 'orator';
  public readonly name = 'Orator';
  public readonly description = 'Posted more than 500 comments';
  public readonly icon = 'hearing';
  public readonly level = 'diamond' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 150;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalComments >= 500;
  }
}

export class FavoriteQuestionEvaluator implements BadgeEvaluator {
  public readonly key = 'favorite-question';
  public readonly name = 'Favorite Question';
  public readonly description = 'Received more than 200 votes on a question';
  public readonly icon = 'military_tech';
  public readonly level = 'gold' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 100;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isQuestion(entity)) {
      return false;
    }

    return entity.score > 200;
  }
}

export class PopularQuestionEvaluator implements BadgeEvaluator {
  public readonly key = 'popular-question';
  public readonly name = 'Popular Question';
  public readonly description = 'Question has somewhat more than 500 views';
  public readonly icon = 'visibility';
  public readonly level = 'silver' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 10;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isQuestion(entity)) {
      return false;
    }

    return entity.views > 500;
  }
}

export class ViralQuestionEvaluator implements BadgeEvaluator {
  public readonly key = 'viral-question';
  public readonly name = 'Viral Question';
  public readonly description = 'Question has somewhat more than 5000 views';
  public readonly icon = 'visibility';
  public readonly level = 'diamond' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 50;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isQuestion(entity)) {
      return false;
    }

    return entity.views > 5000;
  }
}

export class FavoriteArticleEvaluator implements BadgeEvaluator {
  public readonly key = 'favorite-article';
  public readonly name = 'Favorite Article';
  public readonly description = 'Received more than 200 votes on an article';
  public readonly icon = 'military_tech';
  public readonly level = 'gold' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 100;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isArticle(entity)) {
      return false;
    }

    return entity.score > 200;
  }
}

export class FavoriteLinkEvaluator implements BadgeEvaluator {
  public readonly key = 'favorite-link';
  public readonly name = 'Favorite Link';
  public readonly description = 'Received more than 200 votes on a link';
  public readonly icon = 'military_tech';
  public readonly level = 'gold' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 100;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isLink(entity)) {
      return false;
    }

    return entity.score > 200;
  }
}

export class FavoriteAnswerEvaluator implements BadgeEvaluator {
  public readonly key = 'favorite-answer';
  public readonly name = 'Favorite Answer';
  public readonly description = 'Received more than 200 votes on an answer';
  public readonly icon = 'military_tech';
  public readonly level = 'gold' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 100;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isAnswer(entity)) {
      return false;
    }

    return entity.score > 200;
  }
}

export class EnthusiastEvaluator implements BadgeEvaluator {
  public readonly key = 'enthusiast';
  public readonly name = 'Enthusiast';
  public readonly description = 'Achieved a reputation score of 500';
  public readonly icon = 'verified';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 20;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.reputation >= 500;
  }
}

export class SpecialistEvaluator implements BadgeEvaluator {
  public readonly key = 'specialist';
  public readonly name = 'Specialist';
  public readonly description = 'Achieved a reputation score of 2500';
  public readonly icon = 'verified';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 50;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.reputation >= 2500;
  }
}

export class AuthorityEvaluator implements BadgeEvaluator {
  public readonly key = 'authority';
  public readonly name = 'Authority';
  public readonly description = 'Achieved a reputation score of 15000';
  public readonly icon = 'verified';
  public readonly level = 'diamond' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 100;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.reputation >= 15000;
  }
}

export class SolverEvaluator implements BadgeEvaluator {
  public readonly key = 'solver';
  public readonly name = 'Solver';
  public readonly description = 'Marked as correct answer for 1 question';
  public readonly icon = 'check_circle';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 0;

  async evaluateCollection(entities: QetaIdEntity[]): Promise<boolean> {
    return entities.filter(e => isAnswer(e) && e.correct).length >= 1;
  }
}

export class FixerEvaluator implements BadgeEvaluator {
  public readonly key = 'fixer';
  public readonly name = 'Fixer';
  public readonly description = 'Marked as correct answer for 5 questions';
  public readonly icon = 'done_all';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 0;

  async evaluateCollection(entities: QetaIdEntity[]): Promise<boolean> {
    return entities.filter(e => isAnswer(e) && e.correct).length >= 5;
  }
}

export class ArchitectEvaluator implements BadgeEvaluator {
  public readonly key = 'architect';
  public readonly name = 'Architect';
  public readonly description = 'Marked as correct answer for 20 questions';
  public readonly icon = 'construction';
  public readonly level = 'gold' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 0;

  async evaluateCollection(entities: QetaIdEntity[]): Promise<boolean> {
    return entities.filter(e => isAnswer(e) && e.correct).length >= 20;
  }
}

export class WizardEvaluator implements BadgeEvaluator {
  public readonly key = 'wizard';
  public readonly name = 'Wizard';
  public readonly description = 'Marked as correct answer for 50 questions';
  public readonly icon = 'auto_fix_high';
  public readonly level = 'diamond' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 0;

  async evaluateCollection(entities: QetaIdEntity[]): Promise<boolean> {
    return entities.filter(e => isAnswer(e) && e.correct).length >= 50;
  }
}

export class FriendlyEvaluator implements BadgeEvaluator {
  public readonly key = 'friendly';
  public readonly name = 'Friendly';
  public readonly description = 'Gained 5 followers';
  public readonly icon = 'person_add';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 15;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalFollowers >= 5;
  }
}

export class InfluencerEvaluator implements BadgeEvaluator {
  public readonly key = 'influencer';
  public readonly name = 'Influencer';
  public readonly description = 'Gained 25 followers';
  public readonly icon = 'trending_up';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 40;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalFollowers >= 25;
  }
}

export class CelebrityEvaluator implements BadgeEvaluator {
  public readonly key = 'celebrity';
  public readonly name = 'Celebrity';
  public readonly description = 'Gained 100 followers';
  public readonly icon = 'emoji_events';
  public readonly level = 'gold' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 100;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalFollowers >= 100;
  }
}

export class CultLeaderEvaluator implements BadgeEvaluator {
  public readonly key = 'cult-leader';
  public readonly name = 'Cult Leader';
  public readonly description =
    'Gained 500 followers - you have a loyal following!';
  public readonly icon = 'groups';
  public readonly level = 'diamond' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 250;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalFollowers >= 500;
  }
}

export class NightOwlEvaluator implements BadgeEvaluator {
  public readonly key = 'night-owl';
  public readonly name = 'Night Owl';
  public readonly description = 'Posted more than 100 questions and answers';
  public readonly icon = 'nights_stay';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 35;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalQuestions + user.totalAnswers >= 100;
  }
}

export class EncyclopediaEvaluator implements BadgeEvaluator {
  public readonly key = 'encyclopedia';
  public readonly name = 'Encyclopedia';
  public readonly description =
    'Created content across all types - question, article, and link';
  public readonly icon = 'auto_stories';
  public readonly level = 'gold' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 50;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return (
      user.totalQuestions >= 1 &&
      user.totalArticles >= 1 &&
      user.totalLinks >= 1
    );
  }
}

export class PolyglotEvaluator implements BadgeEvaluator {
  public readonly key = 'polyglot';
  public readonly name = 'Polyglot';
  public readonly description =
    'Master of all trades - 10+ questions, answers, articles, and links';
  public readonly icon = 'translate';
  public readonly level = 'diamond' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 150;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return (
      user.totalQuestions >= 10 &&
      user.totalAnswers >= 10 &&
      user.totalArticles >= 10 &&
      user.totalLinks >= 10
    );
  }
}

export class ChatterboxEvaluator implements BadgeEvaluator {
  public readonly key = 'chatterbox';
  public readonly name = 'Chatterbox';
  public readonly description =
    'Posted more than 100 comments - you love to chat!';
  public readonly icon = 'chat_bubble';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 25;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return user.totalComments >= 100;
  }
}

export class CuratorEvaluator implements BadgeEvaluator {
  public readonly key = 'curator';
  public readonly name = 'Curator';
  public readonly description = 'Created a collection with more than 5 posts';
  public readonly icon = 'collections_bookmark';
  public readonly level = 'bronze' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 15;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isCollection(entity)) {
      return false;
    }
    return entity.postsCount >= 5;
  }
}

export class LibrarianEvaluator implements BadgeEvaluator {
  public readonly key = 'librarian';
  public readonly name = 'Librarian';
  public readonly description = 'Created a collection with more than 20 posts';
  public readonly icon = 'local_library';
  public readonly level = 'silver' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 40;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isCollection(entity)) {
      return false;
    }
    return entity.postsCount >= 20;
  }
}

export class ArchivistEvaluator implements BadgeEvaluator {
  public readonly key = 'archivist';
  public readonly name = 'Archivist';
  public readonly description = 'Created a collection with more than 50 posts';
  public readonly icon = 'archive';
  public readonly level = 'gold' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 100;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isCollection(entity)) {
      return false;
    }
    return entity.postsCount >= 50;
  }
}

export class CollectorEvaluator implements BadgeEvaluator {
  public readonly key = 'collector';
  public readonly name = 'Collector';
  public readonly description = 'Created your first collection';
  public readonly icon = 'playlist_add';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 10;

  async evaluateCollection(entities: QetaIdEntity[]): Promise<boolean> {
    return entities.filter(e => isCollection(e)).length >= 1;
  }
}

export class OrganizerEvaluator implements BadgeEvaluator {
  public readonly key = 'organizer';
  public readonly name = 'Organizer';
  public readonly description = 'Created more than 5 collections';
  public readonly icon = 'folder_special';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 35;

  async evaluateCollection(entities: QetaIdEntity[]): Promise<boolean> {
    return entities.filter(e => isCollection(e)).length >= 5;
  }
}

export class CatalogerEvaluator implements BadgeEvaluator {
  public readonly key = 'cataloger';
  public readonly name = 'Cataloger';
  public readonly description = 'Created more than 15 collections';
  public readonly icon = 'inventory';
  public readonly level = 'gold' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 75;

  async evaluateCollection(entities: QetaIdEntity[]): Promise<boolean> {
    return entities.filter(e => isCollection(e)).length >= 15;
  }
}

export class TrendsetterEvaluator implements BadgeEvaluator {
  public readonly key = 'trendsetter';
  public readonly name = 'Trendsetter';
  public readonly description = 'Collection has more than 10 followers';
  public readonly icon = 'trending_up';
  public readonly level = 'bronze' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 20;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isCollection(entity)) {
      return false;
    }
    return entity.followers >= 10;
  }
}

export class TasteMarkerEvaluator implements BadgeEvaluator {
  public readonly key = 'taste-maker';
  public readonly name = 'Taste Maker';
  public readonly description = 'Collection has more than 50 followers';
  public readonly icon = 'star_rate';
  public readonly level = 'silver' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 50;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isCollection(entity)) {
      return false;
    }
    return entity.followers >= 50;
  }
}

export class IconicCollectionEvaluator implements BadgeEvaluator {
  public readonly key = 'iconic-collection';
  public readonly name = 'Iconic Collection';
  public readonly description = 'Collection has more than 200 followers';
  public readonly icon = 'diamond';
  public readonly level = 'gold' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 150;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isCollection(entity)) {
      return false;
    }
    return entity.followers >= 200;
  }
}

export class LegendEvaluator implements BadgeEvaluator {
  public readonly key = 'legend';
  public readonly name = 'Legend';
  public readonly description =
    'The ultimate achievement - You are basically running this company!';
  public readonly icon = 'whatshot';
  public readonly level = 'diamond' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 1000;

  async evaluateUser(user: UserResponse): Promise<boolean> {
    return (
      user.reputation >= 25000 &&
      user.totalQuestions >= 50 &&
      user.totalAnswers >= 100 &&
      user.totalArticles >= 25 &&
      user.totalLinks >= 50 &&
      user.totalFollowers >= 20
    );
  }
}

export class PicassoEvaluator implements BadgeEvaluator {
  public readonly key = 'picasso';
  public readonly name = 'Picasso';
  public readonly description =
    'Visual artist - Added a header image to your post';
  public readonly icon = 'palette';
  public readonly level = 'bronze' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 10;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isPost(entity)) {
      return false;
    }
    return !!entity.headerImage;
  }
}

export class PaparazziEvaluator implements BadgeEvaluator {
  public readonly key = 'paparazzi';
  public readonly name = 'Paparazzi';
  public readonly description =
    'A picture is worth a thousand words - Embedded 3+ images in a post';
  public readonly icon = 'camera_alt';
  public readonly level = 'silver' as const;
  public readonly type = 'one-time' as const;
  public readonly reputation = 15;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isPost(entity)) {
      return false;
    }
    return (entity.images?.length ?? 0) >= 3;
  }
}

export class TagHoarderEvaluator implements BadgeEvaluator {
  public readonly key = 'tag-hoarder';
  public readonly name = 'Tag Hoarder';
  public readonly description =
    'Categorization enthusiast - Used 5+ tags on a post';
  public readonly icon = 'label_important';
  public readonly level = 'bronze' as const;
  public readonly type = 'repetitive' as const;
  public readonly reputation = 5;

  async evaluate(entity: QetaIdEntity): Promise<boolean> {
    if (!isPost(entity)) {
      return false;
    }
    return (entity.tags?.length ?? 0) >= 5;
  }
}

export const BADGE_EVALUATORS: BadgeEvaluator[] = [
  new GoodQuestionEvaluator(),
  new GreatQuestionEvaluator(),
  new FamousQuestionEvaluator(),
  new GoodAnswerEvaluator(),
  new GreatAnswerEvaluator(),
  new GoodArticleEvaluator(),
  new GreatArticleEvaluator(),
  new GoodLinkEvaluator(),
  new GreatLinkEvaluator(),
  new InquisitiveEvaluator(),
  new CuriousMindEvaluator(),
  new HelperEvaluator(),
  new ProblemSolverEvaluator(),
  new GuruEvaluator(),
  new StudentEvaluator(),
  new TutorEvaluator(),
  new ProfessorEvaluator(),
  new SupporterEvaluator(),
  new CriticEvaluator(),
  new BloggerEvaluator(),
  new JournalistEvaluator(),
  new ColumnistEvaluator(),
  new EditorEvaluator(),
  new ConnectorEvaluator(),
  new NetworkerEvaluator(),
  new AmbassadorEvaluator(),
  new HubEvaluator(),
  new DiscussorEvaluator(),
  new CommentatorEvaluator(),
  new PunditEvaluator(),
  new OratorEvaluator(),
  new ExpertEvaluator(),
  new EnthusiastEvaluator(),
  new SpecialistEvaluator(),
  new AuthorityEvaluator(),
  new SolverEvaluator(),
  new FixerEvaluator(),
  new ArchitectEvaluator(),
  new WizardEvaluator(),
  new FriendlyEvaluator(),
  new InfluencerEvaluator(),
  new CelebrityEvaluator(),
  new CultLeaderEvaluator(),
  new NightOwlEvaluator(),
  new EncyclopediaEvaluator(),
  new PolyglotEvaluator(),
  new ChatterboxEvaluator(),
  new CuratorEvaluator(),
  new LibrarianEvaluator(),
  new ArchivistEvaluator(),
  new CollectorEvaluator(),
  new OrganizerEvaluator(),
  new CatalogerEvaluator(),
  new TrendsetterEvaluator(),
  new TasteMarkerEvaluator(),
  new IconicCollectionEvaluator(),
  new LegendEvaluator(),
  new PicassoEvaluator(),
  new PaparazziEvaluator(),
  new TagHoarderEvaluator(),
];

export const SYSTEM_BADGES: Omit<Badge, 'id'>[] = BADGE_EVALUATORS;
