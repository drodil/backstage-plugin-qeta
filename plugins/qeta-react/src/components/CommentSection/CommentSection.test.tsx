import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockErrorApi, TestApiProvider, mockApis } from '@backstage/test-utils';
import { analyticsApiRef, errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { qetaApiRef } from '../../api';
import { CommentSection } from './CommentSection';

jest.mock('../Utility/OptionalRequirePermission', () => ({
  OptionalRequirePermission: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock('./CommentForm', () => ({
  CommentForm: (props: { submit: (data: { content: string }) => void }) => (
    <button type="button" onClick={() => props.submit({ content: 'New' })}>
      Submit comment
    </button>
  ),
}));

jest.mock('./CommentList', () => ({
  CommentList: () => <div>Rendered comments</div>,
}));

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  useConfirmNavigationIfEdited: jest.fn(),
}));

describe('CommentSection', () => {
  const post = {
    id: 1,
    status: 'active',
    comments: [{ id: 1, content: 'Existing comment' }],
  } as unknown as PostResponse;

  const mockQetaApi = {
    commentPost: jest.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestApiProvider
      apis={[
        [qetaApiRef, mockQetaApi],
        [analyticsApiRef, mockApis.analytics()],
        [translationApiRef, mockApis.translation()],
        [errorApiRef, new MockErrorApi()],
        [toastApiRef, { post: jest.fn() }],
      ]}
    >
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with comments collapsed and expands them on request', () => {
    render(<CommentSection post={post} onCommentAction={jest.fn()} />, {
      wrapper,
    });

    expect(screen.queryByText('Rendered comments')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /1 comments/i }));

    expect(screen.getByText('Rendered comments')).toBeInTheDocument();
  });

  it('expands comments after successfully posting a new comment', async () => {
    mockQetaApi.commentPost.mockResolvedValue(post);

    render(<CommentSection post={post} onCommentAction={jest.fn()} />, {
      wrapper,
    });

    fireEvent.click(screen.getByRole('button', { name: /add a comment/i }));
    fireEvent.click(screen.getByRole('button', { name: /submit comment/i }));

    await waitFor(() =>
      expect(screen.getByText('Rendered comments')).toBeInTheDocument(),
    );
    expect(mockQetaApi.commentPost).toHaveBeenCalledWith(1, 'New');
  });
});
