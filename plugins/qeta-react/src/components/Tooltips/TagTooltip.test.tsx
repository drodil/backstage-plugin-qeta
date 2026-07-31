import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockApis, TestApiProvider } from '@backstage/test-utils';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { qetaApiRef } from '../../api';
import { Chip } from '../Utility/Chip.tsx';
import { TagTooltip } from './TagTooltip';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useRouteRef: () => (params: { tag: string }) => `/qeta/tags/${params.tag}`,
}));

describe('TagTooltip', () => {
  const mockQetaApi = {
    getTag: jest.fn().mockResolvedValue(undefined),
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

  it('renders standalone (no TagGroup ancestor) without throwing, wrapping a Chip child', () => {
    render(
      <TagTooltip tag="backstage">
        <Chip>backstage</Chip>
      </TagTooltip>,
      { wrapper },
    );
    expect(screen.getByText('backstage')).toBeInTheDocument();
  });

  it('renders standalone with a plain text child without throwing', () => {
    render(
      <TagTooltip tag="backstage">
        <span>backstage</span>
      </TagTooltip>,
      { wrapper },
    );
    expect(screen.getByText('backstage')).toBeInTheDocument();
  });
});
