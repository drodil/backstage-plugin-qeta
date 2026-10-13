import { fireEvent, render, screen } from '@testing-library/react';
import { MockErrorApi, TestApiProvider, mockApis } from '@backstage/test-utils';
import { errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { Comment, PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { qetaApiRef } from '../../api';
import { CommentListItem } from './CommentListItem';

jest.mock('../Utility/OptionalRequirePermission', () => ({
  OptionalRequirePermission: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock('../MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
}));

jest.mock('../Links', () => ({
  AuthorLink: () => <span>author</span>,
}));

jest.mock('../RelativeTimeWithTooltip', () => ({
  RelativeTimeWithTooltip: () => <span>now</span>,
}));

jest.mock('./CommentForm', () => ({
  CommentForm: () => <div>Comment form</div>,
}));

describe('CommentListItem', () => {
  const comment = {
    id: 1,
    content: 'Existing comment',
    author: 'john',
    canEdit: true,
    canDelete: true,
  } as unknown as Comment;

  const renderItem = (status: string, onReply = jest.fn()) =>
    render(
      <TestApiProvider
        apis={[
          [qetaApiRef, {}],
          [translationApiRef, mockApis.translation()],
          [errorApiRef, new MockErrorApi()],
          [toastApiRef, { post: jest.fn() }],
        ]}
      >
        <CommentListItem
          comment={comment}
          post={{ id: 1, status } as unknown as PostResponse}
          onCommentAction={jest.fn()}
          onReply={onReply}
        />
      </TestApiProvider>,
    );

  describe('given an active post', () => {
    it('should call onReply with the comment when reply is pressed', () => {
      const onReply = jest.fn();
      renderItem('active', onReply);

      fireEvent.click(screen.getByText('reply'));

      expect(onReply).toHaveBeenCalledWith(comment, expect.any(HTMLElement));
    });

    it('should keep the edit and delete actions', () => {
      renderItem('active');

      expect(screen.getByText('edit')).toBeInTheDocument();
      expect(screen.getByText('delete')).toBeInTheDocument();
    });
  });

  describe('given an obsolete post', () => {
    it('should not show any comment actions', () => {
      renderItem('obsolete');

      expect(screen.queryByText('reply')).not.toBeInTheDocument();
      expect(screen.queryByText('edit')).not.toBeInTheDocument();
      expect(screen.queryByText('delete')).not.toBeInTheDocument();
    });
  });
});
