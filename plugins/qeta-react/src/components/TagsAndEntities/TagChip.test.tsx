import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TestApiProvider, mockApis } from '@backstage/test-utils';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { qetaApiRef } from '../../api';
import { TagChip } from './TagChip';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useRouteRef: () => (params: { tag: string }) => `/qeta/tags/${params.tag}`,
}));

describe('TagChip', () => {
  const mockQetaApi = {
    getTag: jest.fn(),
    getFollowedTags: jest.fn().mockResolvedValue({ tags: [] }),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <TestApiProvider
        apis={[
          [qetaApiRef, mockQetaApi],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        {children}
      </TestApiProvider>
    </MemoryRouter>
  );

  it('renders without a TagGroup ancestor without throwing', () => {
    render(<TagChip tag="backstage" />, { wrapper });
    expect(screen.getByText('backstage')).toBeInTheDocument();
  });

  it('renders as a link when useHref is set', () => {
    render(<TagChip tag="backstage" useHref />, { wrapper });
    const link = screen.getByText('backstage').closest('a');
    expect(link).toHaveAttribute('href', '/qeta/tags/backstage');
  });
});
