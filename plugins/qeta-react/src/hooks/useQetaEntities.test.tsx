import { analyticsApiRef } from '@backstage/core-plugin-api';
import { mockApis, TestApiProvider } from '@backstage/test-utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QetaApi } from '@drodil/backstage-plugin-qeta-common';
import { qetaApiRef } from '../api';
import { useQetaEntities } from './useQetaEntities';

describe('useQetaEntities', () => {
  const fetch = jest.fn(
    (
      _api: QetaApi,
      _limit: number,
      _offset: number,
      filters: { searchQuery: string },
    ) =>
      Promise.resolve({
        items: filters.searchQuery ? [{ id: 'matching-entity' }] : [],
        total: filters.searchQuery ? 1 : 0,
      }),
  );

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <TestApiProvider
        apis={[
          [qetaApiRef, {}],
          [analyticsApiRef, mockApis.analytics()],
        ]}
      >
        {children}
      </TestApiProvider>
    </MemoryRouter>
  );

  afterEach(() => {
    fetch.mockClear();
  });

  it('applies a pasted search query without an additional debounce', async () => {
    const { result } = renderHook(
      () =>
        useQetaEntities<{ id: string }, { searchQuery: string }>({
          fetch,
          initialFilters: { searchQuery: '' },
          prefix: 'entities',
          defaultPageSize: 24,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.onSearchQueryChange('copied entity name');
    });

    expect(fetch).toHaveBeenLastCalledWith(
      expect.anything(),
      24,
      0,
      expect.objectContaining({ searchQuery: 'copied entity name' }),
    );

    await waitFor(() => {
      expect(result.current.items).toEqual([{ id: 'matching-entity' }]);
    });
  });
});
