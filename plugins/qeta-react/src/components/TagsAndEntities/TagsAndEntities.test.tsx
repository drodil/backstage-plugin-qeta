import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TestApiProvider, mockApis, MockErrorApi } from '@backstage/test-utils';
import { errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { qetaApiRef } from '../../api';
import { TagsAndEntities } from './TagsAndEntities';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useRouteRef: () => (params: Record<string, string>) =>
    `/qeta/${Object.values(params)[0]}`,
}));

describe('TagsAndEntities', () => {
  const mockQetaApi = {
    getTag: jest.fn(),
    getFollowedTags: jest.fn().mockResolvedValue({ tags: [] }),
    getEntity: jest.fn(),
    getFollowedEntities: jest.fn().mockResolvedValue({ entityRefs: [] }),
  };

  const mockCatalogApi = {
    getEntitiesByRefs: jest.fn().mockResolvedValue({ items: [] }),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <TestApiProvider
        apis={[
          [qetaApiRef, mockQetaApi],
          [catalogApiRef, mockCatalogApi],
          [translationApiRef, mockApis.translation()],
          [errorApiRef, new MockErrorApi()],
        ]}
      >
        {children}
      </TestApiProvider>
    </MemoryRouter>
  );

  const post = {
    postTags: ['react', 'backstage', 'typescript', 'testing'],
    postEntities: [],
  } as unknown as PostResponse;

  it('renders tags and the "+N more" chip without a TagGroup ancestor', () => {
    render(<TagsAndEntities entity={post} tagsLimit={2} entitiesLimit={0} />, {
      wrapper,
    });

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('backstage')).toBeInTheDocument();
    expect(screen.queryByText('typescript')).not.toBeInTheDocument();
  });
});
