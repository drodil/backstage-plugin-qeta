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
  CommentForm: (props: {
    submit: (data: { content: string }) => void;
    defaultValues?: { content: string };
  }) => (
    <div>
      <span data-testid="form-default">{props.defaultValues?.content}</span>
      <button type="button" onClick={() => props.submit({ content: 'New' })}>
        Submit comment
      </button>
    </div>
  ),
}));

jest.mock('./CommentList', () => ({
  CommentList: (props: {
    onReply: (comment: unknown, element: HTMLElement) => void;
  }) => (
    <div>
      Rendered comments
      <button
        type="button"
        onClick={e =>
          props.onReply({ id: 1, author: 'user:default/john' }, e.currentTarget)
        }
      >
        Reply to john
      </button>
    </div>
  ),
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

  it('shows existing comments without a collapse toggle', () => {
    render(<CommentSection post={post} onCommentAction={jest.fn()} />, {
      wrapper,
    });

    expect(screen.getByText('Rendered comments')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /1 comments/i }),
    ).not.toBeInTheDocument();
  });

  it('keeps comments visible after successfully posting a new comment', async () => {
    mockQetaApi.commentPost.mockResolvedValue(post);

    render(<CommentSection post={post} onCommentAction={jest.fn()} />, {
      wrapper,
    });

    fireEvent.click(screen.getByRole('button', { name: /add a comment/i }));
    fireEvent.click(screen.getByRole('button', { name: /submit comment/i }));

    await waitFor(() =>
      expect(screen.queryByText('Submit comment')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Rendered comments')).toBeInTheDocument();
    expect(mockQetaApi.commentPost).toHaveBeenCalledWith(1, 'New');
  });

  it('opens the comment form prefilled with a mention when replying', () => {
    render(<CommentSection post={post} onCommentAction={jest.fn()} />, {
      wrapper,
    });

    fireEvent.click(screen.getByRole('button', { name: /reply to john/i }));

    expect(screen.getByTestId('form-default')).toHaveTextContent(
      '@user:default/john',
    );
  });

  it('posts a reply as a comment on the post', async () => {
    mockQetaApi.commentPost.mockResolvedValue(post);

    render(<CommentSection post={post} onCommentAction={jest.fn()} />, {
      wrapper,
    });

    fireEvent.click(screen.getByRole('button', { name: /reply to john/i }));
    fireEvent.click(screen.getByRole('button', { name: /submit comment/i }));

    await waitFor(() =>
      expect(mockQetaApi.commentPost).toHaveBeenCalledWith(1, 'New'),
    );
  });
});
