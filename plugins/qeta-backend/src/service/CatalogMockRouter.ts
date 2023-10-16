import express from 'express';
import Router from 'express-promise-router';
import { errorHandler } from '@backstage/backend-common';
// @eslint-ignore
import { stringifyEntityRef } from '@backstage/catalog-model';

const entitiesResponse = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      description: 'The place to be, for great artists',
      etag: 'ZjU2MWRkZWUtMmMxZS00YTZiLWFmMWMtOTE1NGNiZDdlYzNk',
      tags: ['java'],
      name: 'artist-web',
      uid: '2152f463-549d-4d8d-a94d-ce2b7676c6e2',
    },
    spec: {
      lifecycle: 'production',
      owner: 'artist-relations-team',
      type: 'website',
      system: 'public-websites',
    },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      description: 'Another component',
      etag: 'ZjU2MWRkfwfefefwewweewfwefwef',
      tags: ['java'],
      name: 'artist-search',
      uid: '2152f463-123d-4d8d-a94d-ce2b7676c6e2',
      title: 'Artist Search',
    },
    spec: {
      lifecycle: 'production',
      owner: 'artist-relations-team',
      type: 'website',
      system: 'public-websites',
    },
  },
];

export const createCatalogMockRouter = async (): Promise<express.Router> => {
  const router = Router();
  router.use(express.json());
  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  router.get('/entities', (_, response) => {
    response.json(entitiesResponse);
  });

  router.get('/entities/by-name/:kind/*/:name', (req, response) => {
    const kind = req.params.kind;
    const name = req.params.name;
    if (kind === 'user') {
      response.json({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        metadata: {
          name: name,
          title: name
            .split(/[_.-]+/)
            .map(a => a.charAt(0).toUpperCase() + a.slice(1))
            .join(' '),
        },
        spec: {},
      });
      return;
    }
    const found = entitiesResponse.find(e => e.metadata.name === name);
    if (found) {
      response.json(found);
      return;
    }
    response.json(entitiesResponse.at(1));
  });

  router.post('/entities/by-refs', (request, response) => {
    const entityRefs = request.body.entityRefs;
    if (!entityRefs || entityRefs.length === 0) {
      response.json([]);
      return;
    }

    response.json({
      items: entitiesResponse.filter(e =>
        entityRefs.includes(stringifyEntityRef(e)),
      ),
    });
  });

  router.use(errorHandler());
  return router;
};
