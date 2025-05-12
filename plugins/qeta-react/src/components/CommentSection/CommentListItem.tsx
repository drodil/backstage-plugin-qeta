import { Box, makeStyles, Typography } from '@material-ui/core';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { AuthorLink } from '../Links';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { Link } from '@backstage/core-components';
import { useState } from 'react';
import * as React from 'react';
import { useTranslation } from '../../hooks';
import {
  AnswerResponse,
  Comment,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api.ts';
import { CommentForm } from './CommentForm.tsx';

const useStyles = makeStyles(
  () => ({
    root: {},
    box: {
      padding: '0.5em',
    },
    content: {
      display: 'inline',
      '& *:last-child': {
        display: 'inline',
      },
    },
  }),
  { name: 'QetaCommentList' },
);

export const CommentListItem = (props: {
  comment: Comment;
  onCommentAction: (question: PostResponse, answer?: AnswerResponse) => void;
  post: PostResponse;
  answer?: AnswerResponse;
}) => {
  const { t } = useTranslation();
  const { comment, onCommentAction, post, answer } = props;
  const qetaApi = useApi(qetaApiRef);
  const [posting, setPosting] = React.useState(false);
  const styles = useStyles();
  const [editing, setEditing] = useState(false);

  const deleteComment = (id: number) => {
    if (answer) {
      qetaApi.deleteAnswerComment(post.id, answer.id, id).then(a => {
        onCommentAction(post, a);
      });
      return;
    }
    qetaApi.deletePostComment(post.id, id).then(q => onCommentAction(q));
  };

  const saveComment = (data: { content: string }) => {
    setPosting(true);
    if (answer) {
      qetaApi
        .updateAnswerComment(post.id, answer.id, comment.id, data.content)
        .then(a => {
          setEditing(false);
          setPosting(false);
          onCommentAction(post, a);
        });
      return;
    }
    qetaApi.updatePostComment(post.id, comment.id, data.content).then(q => {
      setEditing(false);
      setPosting(false);
      onCommentAction(q);
    });
  };

  return (
    <Box className={styles.box}>
      {editing ? (
        <>
          <CommentForm
            submit={saveComment}
            saveButtonTitle={t('commentList.save')}
            defaultValues={{ content: comment.content }}
            disabled={posting}
          />
        </>
      ) : (
        <>
          <MarkdownRenderer
            content={comment.content}
            className={styles.content}
          />
          <Typography variant="caption" className="qetaCommentMetadata">
            {' – '}
            <AuthorLink entity={comment} />{' '}
            <RelativeTimeWithTooltip value={comment.created} />
            {comment.canEdit && (
              <>
                {' / '}
                <Link
                  underline="none"
                  to="#"
                  className="qetaCommentEditBtn"
                  onClick={() => setEditing(true)}
                >
                  {t('commentList.editLink')}
                </Link>
              </>
            )}
            {comment.canDelete && (
              <>
                {' / '}
                <Link
                  underline="none"
                  to="#"
                  className="qetaCommentDeleteBtn"
                  onClick={() => deleteComment(comment.id)}
                >
                  {t('commentList.deleteLink')}
                </Link>
              </>
            )}
          </Typography>
        </>
      )}
    </Box>
  );
};
