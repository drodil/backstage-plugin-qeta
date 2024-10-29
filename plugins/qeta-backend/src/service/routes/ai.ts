import { Router } from 'express';
import { DraftQuestionSchema, RouteOptions } from '../types';
import { getUsername } from '../util';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Question } from '@drodil/backstage-plugin-qeta-common';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const aiRoutes = (router: Router, options: RouteOptions) => {
  const { database, httpAuth, aiHandler } = options;

  router.get('/ai/status', async (_request, response) => {
    response.json({ enabled: !!aiHandler });
  });

  if (!aiHandler) {
    return;
  }

  router.get('/ai/question/:id', async (request, response) => {
    if (!aiHandler.answerExistingQuestion) {
      response.sendStatus(404);
      return;
    }

    const questionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(questionId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    const credentials = await httpAuth.credentials(request, {
      allow: ['user'],
    });
    const username = await getUsername(request, options);
    const post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    if (!post || post.type !== 'question') {
      response.sendStatus(404);
      return;
    }

    const aiResponse = await aiHandler.answerExistingQuestion(
      post as Question,
      { credentials },
    );
    response.json(aiResponse);
  });

  router.post('/ai/question', async (request, response) => {
    if (!aiHandler.answerNewQuestion) {
      response.sendStatus(404);
      return;
    }

    const validateRequestBody = ajv.compile(DraftQuestionSchema);
    if (!validateRequestBody(request.body)) {
      response.status(400).send({ errors: validateRequestBody.errors });
      return;
    }

    const credentials = await httpAuth.credentials(request, {
      allow: ['user'],
    });
    const aiResponse = await aiHandler.answerNewQuestion(
      request.body.title,
      request.body.content,
      { credentials },
    );
    response.json(aiResponse);
  });
};
