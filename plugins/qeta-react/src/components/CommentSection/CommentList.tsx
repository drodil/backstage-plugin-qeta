import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import React from 'react';
import { Box, Divider } from '@material-ui/core';
import { CommentListItem } from './CommentListItem.tsx';

export type QetaCommentListClassKey = 'content' | 'root' | 'box';

export const CommentList = (props: {
  onCommentAction: (question: PostResponse, answer?: AnswerResponse) => void;
  post: PostResponse;
  answer?: AnswerResponse;
}) => {
  const { post, answer, onCommentAction } = props;
  const entity = answer ?? post;

  if (!entity.comments || entity.comments.length === 0) {
    return null;
  }

  return (
    <Box>
      {entity.comments?.map((c, i) => {
        return (
          <div key={c.id}>
            {i > 0 && <Divider />}
            <CommentListItem
              comment={c}
              onCommentAction={onCommentAction}
              post={post}
              answer={answer}
            />
          </div>
        );
      })}
    </Box>
  );
};
