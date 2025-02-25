import { Router } from 'express';
import { RouteOptions, TemplateSchema } from '../types';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { getEntities, getTags } from './routeUtil';
import { isModerator } from '../util';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const templateRoutes = (router: Router, options: RouteOptions) => {
  const { database, config, events, auditor } = options;

  router.get('/templates', async (_req, response) => {
    const templates = await database.getTemplates();
    response.json(templates);
  });

  router.get('/templates/:id', async (request, response) => {
    const templateId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(templateId)) {
      response
        .status(400)
        .send({ errors: 'Invalid template id', type: 'body' });
      return;
    }
    const template = await database.getTemplate(templateId);
    if (!template) {
      response.sendStatus(404);
      return;
    }
    response.json(template);
  });

  // POST /templates
  router.post(`/templates`, async (request, response) => {
    // Validation
    const mod = await isModerator(request, options);
    if (!mod) {
      auditor?.createEvent({
        eventId: 'create-template',
        severityLevel: 'critical',
        request,
        meta: {
          failure: 'Not authorized',
        },
      });
      response.status(403).send({ errors: 'Not authorized', type: 'body' });
      return;
    }

    const validateRequestBody = ajv.compile(TemplateSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .json({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    const tags = await getTags(request, options, await database.getTags());
    const entities = getEntities(request, config);

    // Act
    const template = await database.createTemplate({
      title: request.body.title,
      description: request.body.description,
      questionTitle: request.body.questionTitle,
      questionContent: request.body.questionContent,
      tags,
      entities,
    });

    if (!template) {
      response
        .status(400)
        .send({ errors: 'Failed to create template', type: 'body' });
      return;
    }

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          template,
        },
        metadata: { action: 'new_template' },
      });
    }

    auditor?.createEvent({
      eventId: 'create-template',
      severityLevel: 'medium',
      request,
      meta: {
        templateId: template.id,
      },
    });

    // Response
    response.status(201);
    response.json(template);
  });

  router.post(`/templates/:id`, async (request, response) => {
    // Validation
    const mod = await isModerator(request, options);
    if (!mod) {
      auditor?.createEvent({
        eventId: 'update-template',
        severityLevel: 'critical',
        request,
        meta: {
          failure: 'Not authorized',
          templateId: request.params.id,
        },
      });
      response.status(403).send({ errors: 'Not authorized', type: 'body' });
      return;
    }

    const validateRequestBody = ajv.compile(TemplateSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .json({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }
    const templateId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(templateId)) {
      response
        .status(400)
        .send({ errors: 'Invalid template id', type: 'body' });
      return;
    }

    const tags = await getTags(request, options, await database.getTags());
    const entities = getEntities(request, config);

    // Act
    const template = await database.updateTemplate({
      id: templateId,
      title: request.body.title,
      description: request.body.description,
      questionTitle: request.body.questionTitle,
      questionContent: request.body.questionContent,
      tags,
      entities,
    });

    if (!template) {
      response.sendStatus(401);
      return;
    }

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          template,
        },
        metadata: { action: 'update_template' },
      });
    }

    auditor?.createEvent({
      eventId: 'update-template',
      severityLevel: 'medium',
      request,
      meta: {
        templateId: template.id,
      },
    });

    // Response
    response.status(200);
    response.json(template);
  });

  // DELETE /templates/:id
  router.delete('/templates/:id', async (request, response) => {
    // Validation
    const mod = await isModerator(request, options);
    if (!mod) {
      auditor?.createEvent({
        eventId: 'delete-template',
        severityLevel: 'critical',
        request,
        meta: {
          failure: 'Not authorized',
          templateId: request.params.id,
        },
      });
      response.status(403).send({ errors: 'Not authorized', type: 'body' });
      return;
    }

    const templateId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(templateId)) {
      response
        .status(400)
        .send({ errors: 'Invalid template id', type: 'body' });
      return;
    }

    // Act
    const deleted = await database.deleteTemplate(templateId);

    if (deleted) {
      auditor?.createEvent({
        eventId: 'delete-template',
        severityLevel: 'medium',
        request,
        meta: {
          templateId: request.params.id,
        },
      });
    }

    // Response
    response.sendStatus(deleted ? 200 : 404);
  });
};
