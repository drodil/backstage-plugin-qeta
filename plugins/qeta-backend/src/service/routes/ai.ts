import { Router } from 'express';
import { AIQuerySchema, DraftQuestionSchema, RouteOptions } from '../types';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  AIQuery,
  Article,
  Question,
} from '@drodil/backstage-plugin-qeta-common';
import { BackstageCredentials } from '@backstage/backend-plugin-api';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const aiRoutes = (router: Router, options: RouteOptions) => {
  const { database, httpAuth, aiHandler, permissionMgr } = options;

  const isExistingQuestionEnabled = async (
    credentials: BackstageCredentials,
  ) => {
    if (!aiHandler?.isExistingQuestionEnabled) {
      return !!aiHandler?.answerExistingQuestion;
    }
    return (
      (await aiHandler.isExistingQuestionEnabled({ credentials })) &&
      !!aiHandler?.answerExistingQuestion
    );
  };

  const isNewQuestionEnabled = async (credentials: BackstageCredentials) => {
    if (!aiHandler?.isNewQuestionEnabled) {
      return !!aiHandler?.answerNewQuestion;
    }
    return (
      (await aiHandler.isNewQuestionEnabled({ credentials })) &&
      !!aiHandler?.answerNewQuestion
    );
  };

  const isArticleSummarizationEnabled = async (
    credentials: BackstageCredentials,
  ) => {
    if (!aiHandler?.isArticleSummarizationEnabled) {
      return !!aiHandler?.summarizeArticle;
    }
    return (
      (await aiHandler.isArticleSummarizationEnabled({ credentials })) &&
      !!aiHandler?.summarizeArticle
    );
  };

  router.get('/ai/status', async (request, response) => {
    const credentials = await httpAuth.credentials(request, {
      allow: ['user'],
    });

    const enabled = !!aiHandler;
    const existingQuestions = await isExistingQuestionEnabled(credentials);
    const newQuestions = await isNewQuestionEnabled(credentials);
    const articleSummaries = await isArticleSummarizationEnabled(credentials);

    response.json({
      enabled,
      existingQuestions,
      newQuestions,
      articleSummaries,
    });
  });

  if (!aiHandler) {
    return;
  }

  router.get('/ai/question/:id', async (request, response) => {
    const credentials = await httpAuth.credentials(request, {
      allow: ['user'],
    });

    const enabled = await isExistingQuestionEnabled(credentials);
    if (!enabled) {
      response.sendStatus(404);
      return;
    }

    const validateQuery = ajv.compile(AIQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    const query = request.query as AIQuery;
    const questionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(questionId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    const username = await permissionMgr.getUsername(request);
    const post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    if (!post || post.type !== 'question') {
      response.sendStatus(404);
      return;
    }

    if (!query.regenerate) {
      const saved = await database.getAIAnswer(post.id);
      if (saved) {
        response.json(saved);
        return;
      }
    } else {
      await database.deleteAIAnswer(post.id);
    }

    const aiResponse = await aiHandler.answerExistingQuestion!(
      post as Question,
      { credentials },
    );
    await database.saveAIAnswer(post.id, {
      ...aiResponse,
      created: new Date(),
    });
    response.json(aiResponse);
  });

  router.post('/ai/question', async (request, response) => {
    const credentials = await httpAuth.credentials(request, {
      allow: ['user'],
    });

    const enabled = await isNewQuestionEnabled(credentials);
    if (!enabled) {
      response.sendStatus(404);
      return;
    }

    const validateRequestBody = ajv.compile(DraftQuestionSchema);
    if (!validateRequestBody(request.body)) {
      response.status(400).send({ errors: validateRequestBody.errors });
      return;
    }

    const aiResponse = await aiHandler.answerNewQuestion!(
      request.body.title,
      request.body.content,
      { credentials },
    );
    response.json(aiResponse);
  });

  router.get('/ai/article/:id', async (request, response) => {
    const credentials = await httpAuth.credentials(request, {
      allow: ['user'],
    });

    const enabled = await isArticleSummarizationEnabled(credentials);
    if (!enabled) {
      response.sendStatus(404);
      return;
    }

    const validateQuery = ajv.compile(AIQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    const query = request.query as AIQuery;

    const articleId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(articleId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    const username = await permissionMgr.getUsername(request);
    const post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    if (!post || post.type !== 'article') {
      response.sendStatus(404);
      return;
    }

    if (!query.regenerate) {
      const saved = await database.getAIAnswer(post.id);
      if (saved) {
        response.json(saved);
        return;
      }
    } else {
      await database.deleteAIAnswer(post.id);
    }

    const aiResponse = await aiHandler.summarizeArticle!(post as Article, {
      credentials,
    });
    await database.saveAIAnswer(post.id, {
      ...aiResponse,
      created: new Date(),
    });
    response.json(aiResponse);
  });
};
