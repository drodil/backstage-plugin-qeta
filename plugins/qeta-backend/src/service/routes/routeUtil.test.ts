import { ConfigReader } from '@backstage/config';
import { Request } from 'express';
import { RouteOptions } from '../types';
import { getEntities, getTags } from './routeUtil';

describe('routeUtil', () => {
  describe('getTags', () => {
    it('returns empty array when tags are disabled', async () => {
      const authorizeBoolean = jest.fn().mockResolvedValue([true]);
      const options = {
        config: new ConfigReader({ qeta: { tags: { disabled: true } } }),
        permissionMgr: { authorizeBoolean },
      } as unknown as RouteOptions;

      const request = {
        body: {
          tags: ['java', 'typescript'],
        },
      } as Request;

      const tags = await getTags(request, options, { tags: [], total: 0 });

      expect(tags).toEqual([]);
      expect(authorizeBoolean).not.toHaveBeenCalled();
    });
  });

  describe('getEntities', () => {
    it('returns empty array when entities are disabled', () => {
      const config = new ConfigReader({
        qeta: { entities: { disabled: true, max: 3 } },
      });
      const request = {
        body: {
          entities: ['component:default/a', 'component:default/b'],
        },
      } as Request;

      const entities = getEntities(request, config);

      expect(entities).toEqual([]);
    });
  });
});
