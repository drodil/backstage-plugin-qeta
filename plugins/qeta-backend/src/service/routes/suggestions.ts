import { Router } from 'express';
import { RouteOptions, SuggestionsQuerySchema } from '../types';
import { QetaFilters } from '../util';
import { getCachedData } from './routeUtil';
import {
  Article,
  DraftPostSuggestion,
  Link,
  NeedsReviewSuggestion,
  NewArticleSuggestion,
  NewLinkSuggestion,
  NewQuestionSuggestion,
  NoCorrectAnswerSuggestion,
  qetaCreatePostReviewPermission,
  qetaReadPostPermission,
  Question,
  RandomPostSuggestion,
  Suggestion,
} from '@drodil/backstage-plugin-qeta-common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { PostOptions } from '../../database/QetaStore';
import { PermissionCriteria } from '@backstage/plugin-permission-common';
import { durationToMilliseconds, HumanDuration } from '@backstage/types';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const suggestionRoutes = (router: Router, options: RouteOptions) => {
  const { database, permissionMgr, config } = options;

  const postsOlderThan = config.getOptional<HumanDuration>(
    'qeta.contentHealth.postsOlderThan',
  ) ?? { months: 6 };
  const reviewThresholdMs = durationToMilliseconds(postsOlderThan);

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

  const getUsersDraftPosts = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<DraftPostSuggestion[]> => {
    const draftPosts = await database.getPosts(
      username,
      {
        status: 'draft',
        author: username,
      },
      filter,
      includeNothingOptions,
    );

    return draftPosts.posts.map(post => ({
      id: `p_${post.id}`,
      type: 'draftPost',
      post,
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

  const getNewTagLinks = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NewLinkSuggestion[]> => {
    const userTags = await database.getUserTags(username);
    if (userTags.tags.length === 0) {
      return [];
    }
    const links = await database.getPosts(
      username,
      {
        tags: userTags.tags,
        tagsRelation: 'or',
        type: 'link',
        fromDate: getFromDate(),
        excludeAuthors: [username],
      },
      filter,
      includeNothingOptions,
    );
    return links.posts.map(link => ({
      id: `q_${link.id}`,
      type: 'newLink',
      link: link as Link,
    }));
  };

  const getNewEntityLinks = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NewLinkSuggestion[]> => {
    const userEntities = await database.getUserEntities(username);
    if (userEntities.entityRefs.length === 0) {
      return [];
    }
    const links = await database.getPosts(
      username,
      {
        entities: userEntities.entityRefs,
        entitiesRelation: 'or',
        type: 'link',
        fromDate: getFromDate(),
        excludeAuthors: [username],
      },
      filter,
      includeNothingOptions,
    );
    return links.posts.map(link => ({
      id: `l_${link.id}`,
      type: 'newLink',
      link: link as Link,
    }));
  };

  const getNewUserLinks = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NewLinkSuggestion[]> => {
    const followedUsers = await database.getFollowedUsers(username);
    if (followedUsers.followedUserRefs.length === 0) {
      return [];
    }
    const links = await database.getPosts(
      username,
      {
        author: followedUsers.followedUserRefs,
        type: 'link',
        fromDate: getFromDate(),
        excludeAuthors: [username],
      },
      filter,
      includeNothingOptions,
    );
    return links.posts.map(link => ({
      id: `l_${link.id}`,
      type: 'newLink',
      link: link as Link,
    }));
  };

  const getPostsNeedingReview = async (
    username: string,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<NeedsReviewSuggestion[]> => {
    const posts = await database.getPosts(
      username,
      { reviewNeeded: true, includeHealth: true, limit: 5 },
      filter,
      { ...includeNothingOptions, reviewThresholdMs },
    );
    return posts.posts.map(post => ({
      id: `r_${post.id}`,
      type: 'needsReview',
      post,
    }));
  };

  const getRandomPosts = async (
    username: string,
    limit: number,
    filter?: PermissionCriteria<QetaFilters>,
  ): Promise<RandomPostSuggestion[]> => {
    const posts = await database.getPosts(
      username,
      { random: true, limit },
      filter,
      includeNothingOptions,
    );
    return posts.posts.map(post => ({
      id: `p_${post.id}`,
      type: 'randomPost',
      post,
    }));
  };

  const getSuggestions = async (
    username: string,
    limit: number,
    filter?: PermissionCriteria<QetaFilters>,
    canReview?: boolean,
  ): Promise<Suggestion[]> => {
    const promises: Promise<Suggestion[]>[] = [
      getNotCorrectQuestions(username, filter),
      getNewTagQuestions(username, filter),
      getNewTagArticles(username, filter),
      getNewTagLinks(username, filter),
      getNewEntityQuestions(username, filter),
      getNewEntityArticles(username, filter),
      getNewEntityLinks(username, filter),
      getNewUserQuestions(username, filter),
      getNewUserArticles(username, filter),
      getNewUserLinks(username, filter),
      getUsersDraftPosts(username, filter),
      canReview ? getPostsNeedingReview(username, filter) : Promise.resolve([]),
    ];

    const raw = await Promise.all(promises);

    const suggestionsRaw = raw
      .flat()
      .reduce((acc: Suggestion[], cur: Suggestion) => {
        if (!acc.some(s => s.id === cur.id)) {
          acc.push(cur);
        }
        return acc;
      }, []);

    if (suggestionsRaw.length < limit) {
      suggestionsRaw.push(...(await getRandomPosts(username, limit, filter)));
    }

    return suggestionsRaw.sort(() => 0.5 - Math.random()).slice(0, limit);
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
    );

    const canReviewResults = await permissionMgr.authorizeBoolean(request, [
      { permission: qetaCreatePostReviewPermission },
    ]);
    const canReview = canReviewResults[0] ?? false;

    const key = `qeta:suggestions:${username}:${limit}`;
    const ttl = 3600 * 1000;

    const suggestions = await getCachedData(
      options.cache,
      key,
      ttl,
      async () => {
        return await getSuggestions(username, limit, filter, canReview);
      },
      options.logger,
    );

    response.json({ suggestions });
  });
};
