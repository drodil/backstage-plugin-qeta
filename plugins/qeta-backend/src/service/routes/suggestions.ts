import { Router } from 'express';
import { RouteOptions, SuggestionsQuerySchema } from '../types';
import { getUsername } from '../util';
import {
  Article,
  NewArticleSuggestion,
  NewQuestionSuggestion,
  NoCorrectAnswerSuggestion,
  Question,
  Suggestion,
} from '@drodil/backstage-plugin-qeta-common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const suggestionRoutes = (router: Router, options: RouteOptions) => {
  const { database } = options;

  const getFromDate = (days: number = 7) => {
    const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * days);
    return date.toISOString().split('T')[0];
  };

  const getNotCorrectQuestions = async (
    username: string,
  ): Promise<NoCorrectAnswerSuggestion[]> => {
    const questions = await database.getPosts(username, {
      author: username,
      hasAnswers: true,
      noCorrectAnswer: true,
      type: 'question',
    });

    return questions.posts.map(question => ({
      id: `noq_${question.id}`,
      type: 'noCorrectAnswer',
      question: question as Question,
    }));
  };

  const getNewTagQuestions = async (
    username: string,
  ): Promise<NewQuestionSuggestion[]> => {
    const userTags = await database.getUserTags(username);
    if (userTags.tags.length === 0) {
      return [];
    }
    const questions = await database.getPosts(username, {
      tags: userTags.tags,
      tagsRelation: 'or',
      type: 'question',
      fromDate: getFromDate(),
      excludeAuthors: [username],
    });
    return questions.posts.map(question => ({
      id: `q_${question.id}`,
      type: 'newQuestion',
      question: question as Question,
    }));
  };

  const getNewEntityQuestions = async (
    username: string,
  ): Promise<NewQuestionSuggestion[]> => {
    const userEntities = await database.getUserEntities(username);
    if (userEntities.entityRefs.length === 0) {
      return [];
    }
    const questions = await database.getPosts(username, {
      entities: userEntities.entityRefs,
      entitiesRelation: 'or',
      type: 'question',
      fromDate: getFromDate(),
      excludeAuthors: [username],
    });
    return questions.posts.map(question => ({
      id: `q_${question.id}`,
      type: 'newQuestion',
      question: question as Question,
    }));
  };

  const getNewTagArticles = async (
    username: string,
  ): Promise<NewArticleSuggestion[]> => {
    const userTags = await database.getUserTags(username);
    if (userTags.tags.length === 0) {
      return [];
    }
    const articles = await database.getPosts(username, {
      tags: userTags.tags,
      tagsRelation: 'or',
      type: 'article',
      fromDate: getFromDate(),
      excludeAuthors: [username],
    });
    return articles.posts.map(article => ({
      id: `a_${article.id}`,
      type: 'newArticle',
      article: article as Article,
    }));
  };

  const getNewEntityArticles = async (
    username: string,
  ): Promise<NewArticleSuggestion[]> => {
    const userEntities = await database.getUserEntities(username);
    if (userEntities.entityRefs.length === 0) {
      return [];
    }
    const articles = await database.getPosts(username, {
      entities: userEntities.entityRefs,
      entitiesRelation: 'or',
      type: 'article',
      fromDate: getFromDate(),
      excludeAuthors: [username],
    });
    return articles.posts.map(article => ({
      id: `a_${article.id}`,
      type: 'newArticle',
      article: article as Article,
    }));
  };

  const getNewUserQuestions = async (
    username: string,
  ): Promise<NewQuestionSuggestion[]> => {
    const followedUsers = await database.getFollowedUsers(username);
    if (followedUsers.followedUserRefs.length === 0) {
      return [];
    }
    const questions = await database.getPosts(username, {
      author: followedUsers.followedUserRefs,
      type: 'question',
      fromDate: getFromDate(),
      excludeAuthors: [username],
    });
    return questions.posts.map(question => ({
      id: `q_${question.id}`,
      type: 'newQuestion',
      question: question as Question,
    }));
  };

  const getNewUserArticles = async (
    username: string,
  ): Promise<NewArticleSuggestion[]> => {
    const followedUsers = await database.getFollowedUsers(username);
    if (followedUsers.followedUserRefs.length === 0) {
      return [];
    }
    const articles = await database.getPosts(username, {
      author: followedUsers.followedUserRefs,
      type: 'article',
      fromDate: getFromDate(),
      excludeAuthors: [username],
    });
    return articles.posts.map(article => ({
      id: `a_${article.id}`,
      type: 'newArticle',
      article: article as Article,
    }));
  };

  const getRandomArticleSuggestion = async (
    username: string,
  ): Promise<NewArticleSuggestion[]> => {
    const articles = await database.getPosts(username, {
      type: 'article',
      limit: 1,
      random: true,
      excludeAuthors: [username],
    });
    return articles.posts.map(article => ({
      id: `a_${article.id}`,
      type: 'newArticle',
      article: article as Article,
    }));
  };

  const getRandomQuestionSuggestion = async (
    username: string,
  ): Promise<NewQuestionSuggestion[]> => {
    const questions = await database.getPosts(username, {
      type: 'question',
      limit: 1,
      random: true,
      noAnswers: true,
      excludeAuthors: [username],
    });
    return questions.posts.map(question => ({
      id: `q_${question.id}`,
      type: 'newQuestion',
      question: question as Question,
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
    const username = await getUsername(request, options, false);
    let limit = Number(request.query.limit);
    if (isNaN(limit)) {
      limit = 5;
    }

    const raw = await Promise.all([
      getNotCorrectQuestions(username),
      getNewTagQuestions(username),
      getNewTagArticles(username),
      getNewEntityQuestions(username),
      getNewEntityArticles(username),
      getNewUserQuestions(username),
      getNewUserArticles(username),
      getRandomArticleSuggestion(username),
      getRandomQuestionSuggestion(username),
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
