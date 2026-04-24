import { mockServices } from '@backstage/backend-test-utils';
import { getResourceUrl } from './util';

describe('getResourceUrl', () => {
  it('should use the plural collections route', () => {
    expect(
      getResourceUrl(
        { id: 7, title: 'Team picks', owner: 'user:default/alice' } as any,
        mockServices.rootConfig.mock(),
      ),
    ).toBe('/qeta/collections/7');
  });

  it('should use the plural collections route with a custom base path', () => {
    expect(
      getResourceUrl(
        { id: 7, title: 'Team picks', owner: 'user:default/alice' } as any,
        mockServices.rootConfig({
          data: {
            qeta: {
              route: 'custom-qeta',
            },
          },
        }),
      ),
    ).toBe('/custom-qeta/collections/7');
  });
});
