import { Box, makeStyles, Typography } from '@material-ui/core';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { AuthorLink } from '../Links';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { Link } from '@backstage/core-components';
import { useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  AnswerResponse,
  Comment,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api.ts';
import { CommentForm } from './CommentForm.tsx';
import { ExpertIcon } from '../Icons/ExpertIcon.tsx';

const useStyles = makeStyles(
  theme => ({
    root: {},
    box: {
      padding: theme.spacing(1.5),
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    content: {
      display: 'inline',
      '&>*:last-child:not(ul,ol,blockquote)': {
        display: 'inline',
      },
      lineHeight: 1.5,
    },
    metadata: {
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(0.5),
      '& a': {
        color: theme.palette.primary.main,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          textDecoration: 'underline',
          opacity: 0.8,
        },
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
  const { t } = useTranslationRef(qetaTranslationRef);
  const { comment, onCommentAction, post, answer } = props;
  const qetaApi = useApi(qetaApiRef);
  const [posting, setPosting] = useState(false);
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
          <Typography variant="caption" className={styles.metadata}>
            {' – '}
            <AuthorLink entity={comment} />
            {comment.expert && <ExpertIcon />}{' '}
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
