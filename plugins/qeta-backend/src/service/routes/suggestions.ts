import { Router } from 'express';
import { RouteOptions, SuggestionsQuerySchema } from '../types';
import { QetaFilters } from '../util';
import {
  Article,
  NewArticleSuggestion,
  NewQuestionSuggestion,
  NoCorrectAnswerSuggestion,
  qetaReadPostPermission,
  Question,
  Suggestion,
} from '@drodil/backstage-plugin-qeta-common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { PostOptions } from '../../database/QetaStore';
import { PermissionCriteria } from '@backstage/plugin-permission-common';
import { postPermissionResourceRef } from '@drodil/backstage-plugin-qeta-node';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const suggestionRoutes = (router: Router, options: RouteOptions) => {
  const { database, permissionMgr } = options;

  const includeNothingOptions: PostOptions = {
    includeVotes: false,
    includeTags: false,
    includeComments: false,
    includeEntities: false,
    includeAnswers: false,
    includeAttachments: false,
  };

  const getFromDate = (days: number = 7) => {
    const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * days);
    return date.toISOString().split('T')[0];
  };

  const getNotCorrectQuestions = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NoCorrectAnswerSuggestion[]> => {
    const questions = await database.getPosts(
      username,
      {
        author: username,
        hasAnswers: true,
        noCorrectAnswer: true,
        type: 'question',
      },
      filter,
      includeNothingOptions,
    );

    return questions.posts.map(question => ({
      id: `noq_${question.id}`,
      type: 'noCorrectAnswer',
      question: question as Question,
    }));
  };

  const getNewTagQuestions = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NewQuestionSuggestion[]> => {
    const userTags = await database.getUserTags(username);
    if (userTags.tags.length === 0) {
      return [];
    }
    const questions = await database.getPosts(
      username,
      {
        tags: userTags.tags,
        tagsRelation: 'or',
        type: 'question',
        fromDate: getFromDate(),
        excludeAuthors: [username],
      },
      filter,
      includeNothingOptions,
    );
    return questions.posts.map(question => ({
      id: `q_${question.id}`,
      type: 'newQuestion',
      question: question as Question,
    }));
  };

  const getNewEntityQuestions = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NewQuestionSuggestion[]> => {
    const userEntities = await database.getUserEntities(username);
    if (userEntities.entityRefs.length === 0) {
      return [];
    }
    const questions = await database.getPosts(
      username,
      {
        entities: userEntities.entityRefs,
        entitiesRelation: 'or',
        type: 'question',
        fromDate: getFromDate(),
        excludeAuthors: [username],
      },
      filter,
      includeNothingOptions,
    );
    return questions.posts.map(question => ({
      id: `q_${question.id}`,
      type: 'newQuestion',
      question: question as Question,
    }));
  };

  const getNewTagArticles = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NewArticleSuggestion[]> => {
    const userTags = await database.getUserTags(username);
    if (userTags.tags.length === 0) {
      return [];
    }
    const articles = await database.getPosts(
      username,
      {
        tags: userTags.tags,
        tagsRelation: 'or',
        type: 'article',
        fromDate: getFromDate(),
        excludeAuthors: [username],
      },
      filter,
      includeNothingOptions,
    );
    return articles.posts.map(article => ({
      id: `a_${article.id}`,
      type: 'newArticle',
      article: article as Article,
    }));
  };

  const getNewEntityArticles = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NewArticleSuggestion[]> => {
    const userEntities = await database.getUserEntities(username);
    if (userEntities.entityRefs.length === 0) {
      return [];
    }
    const articles = await database.getPosts(
      username,
      {
        entities: userEntities.entityRefs,
        entitiesRelation: 'or',
        type: 'article',
        fromDate: getFromDate(),
        excludeAuthors: [username],
      },
      filter,
      includeNothingOptions,
    );
    return articles.posts.map(article => ({
      id: `a_${article.id}`,
      type: 'newArticle',
      article: article as Article,
    }));
  };

  const getNewUserQuestions = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NewQuestionSuggestion[]> => {
    const followedUsers = await database.getFollowedUsers(username);
    if (followedUsers.followedUserRefs.length === 0) {
      return [];
    }
    const questions = await database.getPosts(
      username,
      {
        author: followedUsers.followedUserRefs,
        type: 'question',
        fromDate: getFromDate(),
        excludeAuthors: [username],
      },
      filter,
      includeNothingOptions,
    );
    return questions.posts.map(question => ({
      id: `q_${question.id}`,
      type: 'newQuestion',
      question: question as Question,
    }));
  };

  const getNewUserArticles = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NewArticleSuggestion[]> => {
    const followedUsers = await database.getFollowedUsers(username);
    if (followedUsers.followedUserRefs.length === 0) {
      return [];
    }
    const articles = await database.getPosts(
      username,
      {
        author: followedUsers.followedUserRefs,
        type: 'article',
        fromDate: getFromDate(),
        excludeAuthors: [username],
      },
      filter,
      includeNothingOptions,
    );
    return articles.posts.map(article => ({
      id: `a_${article.id}`,
      type: 'newArticle',
      article: article as Article,
    }));
  };

  router.get('/suggestions', async (request, response) => {
    const validateQuery = ajv.compile(SuggestionsQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }
    const username = await permissionMgr.getUsername(request, false);
    let limit = Number(request.query.limit);
    if (isNaN(limit)) {
      limit = 5;
    }

    const filter = await permissionMgr.getAuthorizeConditions(
      request,
      qetaReadPostPermission,
      postPermissionResourceRef,
    );

    const raw = await Promise.all([
      getNotCorrectQuestions(username, filter),
      getNewTagQuestions(username, filter),
      getNewTagArticles(username, filter),
      getNewEntityQuestions(username, filter),
      getNewEntityArticles(username, filter),
      getNewUserQuestions(username, filter),
      getNewUserArticles(username, filter),
    ]);
    const suggestions = raw
      .flat()
      .reduce((acc: Suggestion[], cur: Suggestion) => {
        if (!acc.some(s => s.id === cur.id)) {
          acc.push(cur);
        }
        return acc;
      }, [])
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
    response.json({ suggestions });
  });
};
