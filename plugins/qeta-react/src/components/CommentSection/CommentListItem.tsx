import { Box, Link, Text } from '@backstage/ui';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { AuthorLink } from '../Links';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  AnswerResponse,
  Comment,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api.ts';
import { CommentForm } from './CommentForm.tsx';
import { ExpertIcon } from '../Icons/ExpertIcon.tsx';
import styles from './CommentListItem.module.css';

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
  const [editing, setEditing] = useState(false);
  const alertApi = useApi(alertApiRef);

  const deleteComment = (id: number) => {
    if (answer) {
      qetaApi
        .deleteAnswerComment(post.id, answer.id, id)
        .catch(e =>
          alertApi.post({
            message: e.message,
            display: 'transient',
            severity: 'error',
          }),
        )
        .then(a => {
          if (a) {
            onCommentAction(post, a);
          }
        });
      return;
    }
    qetaApi
      .deletePostComment(post.id, id)
      .catch(e =>
        alertApi.post({
          message: e.message,
          display: 'transient',
          severity: 'error',
        }),
      )
      .then(q => {
        if (q) {
          onCommentAction(q);
        }
      });
  };

  const saveComment = (data: { content: string }) => {
    setPosting(true);
    if (answer) {
      qetaApi
        .updateAnswerComment(post.id, answer.id, comment.id, data.content)
        .catch(e =>
          alertApi.post({
            message: e.message,
            display: 'transient',
            severity: 'error',
          }),
        )
        .then(a => {
          if (a) {
            onCommentAction(post, a);
          }
        })
        .finally(() => {
          setEditing(false);
          setPosting(false);
        });
      return;
    }
    qetaApi
      .updatePostComment(post.id, comment.id, data.content)
      .catch(e =>
        alertApi.post({
          message: e.message,
          display: 'transient',
          severity: 'error',
        }),
      )
      .then(q => {
        if (q) {
          onCommentAction(q);
        }
      })
      .finally(() => {
        setEditing(false);
        setPosting(false);
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
            onDiscard={() => setEditing(false)}
          />
        </>
      ) : (
        <>
          <MarkdownRenderer
            content={comment.content}
            className={styles.content}
          />
          <Text as="div" variant="body-small" className={styles.metadata}>
            <AuthorLink entity={comment} />
            {comment.expert && <ExpertIcon />}
            {' • '}
            <RelativeTimeWithTooltip value={comment.created} />
            {comment.canEdit && post.status !== 'obsolete' && (
              <Link
                standalone
                className={`${styles.actionBtn} qetaCommentEditBtn`}
                onPress={() => setEditing(true)}
              >
                {t('commentList.editLink')}
              </Link>
            )}
            {comment.canDelete && post.status !== 'obsolete' && (
              <Link
                standalone
                className={`${styles.actionBtn} qetaCommentDeleteBtn`}
                onPress={() => deleteComment(comment.id)}
              >
                {t('commentList.deleteLink')}
              </Link>
            )}
          </Text>
        </>
      )}
    </Box>
  );
};
