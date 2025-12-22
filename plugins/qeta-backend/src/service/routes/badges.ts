import { Router } from 'express';
import { RouterOptions } from '../types';

export const badgesRoutes = (router: Router, options: RouterOptions) => {
  const { database } = options;

  router.get('/badges', async (request, response) => {
    const userRef = request.query.userRef;
    if (userRef) {
      const badges = await database.getUserBadges(userRef as string);
      response.json(badges);
      return;
    }
    const badges = await database.getBadges();
    response.json(badges);
  });

  router.get('/badges/:id', async (request, response) => {
    const { id } = request.params;
    const badge = await database.getBadge(id);
    if (!badge) {
      response.status(404).json({ error: 'Badge not found' });
      return;
    }
    response.json(badge);
  });
};
