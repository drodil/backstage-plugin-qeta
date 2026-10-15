import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { TestApiProvider } from '@backstage/test-utils';
import { qetaApiRef } from '../api';
import { useFollow } from './useFollow';

describe('useFollow', () => {
  it('only updates follow state when the API confirms the operation', async () => {
    const followItem = jest
      .fn<Promise<boolean>, [item: string]>()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const unfollowItem = jest
      .fn<Promise<boolean>, [item: string]>()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const options = {
      fetchFollowed: () => Promise.resolve<string[]>([]),
      followItem,
      unfollowItem,
      isEqual: (a: string, b: string) => a === b,
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestApiProvider apis={[[qetaApiRef, {}]]}>{children}</TestApiProvider>
    );
    const { result } = renderHook(() => useFollow('use-follow-test', options), {
      wrapper,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.follow('collection');
    });
    expect(result.current.isFollowing('collection')).toBe(false);

    await act(async () => {
      await result.current.follow('collection');
    });
    expect(result.current.isFollowing('collection')).toBe(true);

    await act(async () => {
      await result.current.unfollow('collection');
    });
    expect(result.current.isFollowing('collection')).toBe(true);

    await act(async () => {
      await result.current.unfollow('collection');
    });
    expect(result.current.isFollowing('collection')).toBe(false);
  });
});
