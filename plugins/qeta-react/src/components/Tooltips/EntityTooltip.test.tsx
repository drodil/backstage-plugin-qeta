import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockApis, TestApiProvider } from '@backstage/test-utils';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { qetaApiRef } from '../../api';
import { Chip } from '../Utility/Chip.tsx';
import { EntityTooltip } from './EntityTooltip';

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

describe('EntityTooltip', () => {
  const mockQetaApi = {
    getEntity: jest.fn().mockResolvedValue(undefined),
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

  it('renders standalone (no TagGroup ancestor) without throwing, wrapping a Chip child', () => {
    render(
      <EntityTooltip entity={testEntity}>
        <Chip>Test Service</Chip>
      </EntityTooltip>,
      { wrapper },
    );
    expect(screen.getByText('Test Service')).toBeInTheDocument();
  });

  it('renders standalone with a plain text child without throwing', () => {
    render(
      <EntityTooltip
        entity="component:default/test-service"
        interactive={false}
      >
        <span>Test Service</span>
      </EntityTooltip>,
      { wrapper },
    );
    expect(screen.getByText('Test Service')).toBeInTheDocument();
  });
});
