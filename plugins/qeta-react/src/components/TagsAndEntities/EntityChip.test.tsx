import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TestApiProvider, mockApis } from '@backstage/test-utils';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { qetaApiRef } from '../../api';
import { EntityChip } from './EntityChip';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useRouteRef: () => (params: { entityRef: string }) =>
    `/qeta/entities/${params.entityRef}`,
}));

const testEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-service',
    namespace: 'default',
    title: 'Test Service',
  },
  spec: {
    type: 'service',
  },
};

describe('EntityChip', () => {
  const mockQetaApi = {
    getEntity: jest.fn(),
    getFollowedEntities: jest.fn().mockResolvedValue({ entityRefs: [] }),
  };

  const mockCatalogApi = {
    getEntitiesByRefs: jest.fn().mockResolvedValue({ items: [testEntity] }),
    getEntityByRef: jest.fn().mockResolvedValue(testEntity),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <TestApiProvider
        apis={[
          [qetaApiRef, mockQetaApi],
          [catalogApiRef, mockCatalogApi],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        {children}
      </TestApiProvider>
    </MemoryRouter>
  );

  it('renders without a TagGroup ancestor without throwing', () => {
    render(<EntityChip entity={testEntity} />, { wrapper });
    expect(screen.getByText('Test Service')).toBeInTheDocument();
  });

  it('renders as a link when useHref is set', () => {
    render(<EntityChip entity={testEntity} useHref />, { wrapper });
    const link = screen.getByText('Test Service').closest('a');
    expect(link).toHaveAttribute(
      'href',
      '/qeta/entities/component:default/test-service',
    );
  });
});
