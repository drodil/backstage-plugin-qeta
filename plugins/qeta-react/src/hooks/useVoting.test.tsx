import { act, renderHook, waitFor } from '@testing-library/react';
import { useVoting } from './useVoting';
import { useSignal } from '@backstage/plugin-signals-react';
import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import React from 'react';
import { MockErrorApi, TestApiProvider } from '@backstage/test-utils';
import { qetaApiRef } from '../api';
import { errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { MockTranslationApi } from '@backstage/test-utils/alpha';

jest.mock('@backstage/plugin-signals-react', () => ({
  useSignal: jest.fn(),
}));

const mockQetaApi = {
  votePostUp: jest.fn(),
  votePostDown: jest.fn(),
  voteAnswerUp: jest.fn(),
  voteAnswerDown: jest.fn(),
  markAnswerCorrect: jest.fn(),
  markAnswerIncorrect: jest.fn(),
};

describe('useVoting', () => {
  const testPost: PostResponse = {
    answersCount: 0,
    author: '',
    content: '',
    correctAnswer: false,
    created: new Date(),
    favorite: false,
    images: [],
    type: 'question',
    views: 0,
    id: 1,
    title: 'Test Post',
    score: 10,
    ownVote: 1,
    own: true,
  };

  const testAnswer: AnswerResponse = {
    author: '',
    content: '',
    correct: false,
    created: new Date(),
    images: [],
    id: 1,
    postId: 2,
    score: 5,
    ownVote: 0,
    own: false,
  };

  beforeEach(() => {
    (useSignal as jest.Mock).mockReturnValue({
      lastSignal: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestApiProvider
      apis={[
        [qetaApiRef, mockQetaApi],
        [errorApiRef, new MockErrorApi()],
        [translationApiRef, MockTranslationApi.create()],
      ]}
    >
      {children}
    </TestApiProvider>
  );

  it('should initialize with given response', async () => {
    const { result } = renderHook(() => useVoting(testPost), { wrapper });

    expect(result.current.entity).toEqual(testPost);
    expect(result.current.ownVote).toBe(1);
    expect(result.current.score).toBe(10);
  });

  it('should handle vote up for a question', async () => {
    mockQetaApi.votePostUp.mockResolvedValue({
      ...testPost,
      ownVote: 1,
      score: 11,
    });

    const { result } = renderHook(() => useVoting(testPost), { wrapper });

    act(() => {
      result.current.voteUp();
    });

    const initialValue = result.current;
    await waitFor(() => {
      expect(result.current).not.toBe(initialValue);
    });

    expect(mockQetaApi.votePostUp).toHaveBeenCalledWith(1);
    expect(result.current.ownVote).toBe(1);
    expect(result.current.score).toBe(11);
  });

  it('should handle vote down for an answer', async () => {
    mockQetaApi.voteAnswerDown.mockResolvedValue({
      ...testAnswer,
      ownVote: -1,
      score: 4,
    });

    const { result } = renderHook(() => useVoting(testAnswer), { wrapper });

    act(() => {
      result.current.voteDown();
    });

    const initialValue = result.current;
    await waitFor(() => {
      expect(result.current).not.toBe(initialValue);
    });

    expect(mockQetaApi.voteAnswerDown).toHaveBeenCalledWith(2, 1);
    expect(result.current.ownVote).toBe(-1);
    expect(result.current.score).toBe(4);
  });

  it('should toggle correct answer', async () => {
    mockQetaApi.markAnswerCorrect.mockResolvedValue(true);

    const { result } = renderHook(() => useVoting(testAnswer), { wrapper });

    act(() => {
      result.current.toggleCorrectAnswer();
    });

    const initialValue = result.current;
    await waitFor(() => {
      expect(result.current).not.toBe(initialValue);
    });

    expect(mockQetaApi.markAnswerCorrect).toHaveBeenCalledWith(2, 1);
    expect(result.current.correctAnswer).toBe(true);
  });
});
