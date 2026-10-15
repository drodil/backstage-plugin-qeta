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
  qetaCreateCommentPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api.ts';
import { CommentForm } from './CommentForm.tsx';
import { ExpertIcon } from '../Icons/ExpertIcon.tsx';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import styles from './CommentListItem.module.css';
import { toastApiRef } from '@backstage/frontend-plugin-api';

export const CommentListItem = (props: {
  comment: Comment;
  onCommentAction: (question: PostResponse, answer?: AnswerResponse) => void;
  post: PostResponse;
  answer?: AnswerResponse;
  onReply: (comment: Comment, replyAction: HTMLElement) => void;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { comment, onCommentAction, onReply, post, answer } = props;
  const qetaApi = useApi(qetaApiRef);
  const [posting, setPosting] = useState(false);
  const [editing, setEditing] = useState(false);
  const toastApi = useApi(toastApiRef);

  const deleteComment = (id: number) => {
    if (answer) {
      qetaApi
        .deleteAnswerComment(post.id, answer.id, id)
        .catch(e => {
          toastApi.post({
            title: e.message,
            status: 'warning',
          });
        })
        .then(a => {
          if (a) {
            onCommentAction(post, a);
          }
        });
      return;
    }
    qetaApi
      .deletePostComment(post.id, id)
      .catch(e => {
        toastApi.post({
          title: e.message,
          status: 'warning',
        });
      })
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
        .catch(e => {
          toastApi.post({
            title: e.message,
            status: 'warning',
          });
        })
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
      .catch(e => {
        toastApi.post({
          title: e.message,
          status: 'warning',
        });
      })
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
            {post.status !== 'obsolete' && (
              <OptionalRequirePermission
                permission={qetaCreateCommentPermission}
                errorPage={<></>}
              >
                <Link
                  standalone
                  className={`${styles.actionBtn} qetaCommentReplyBtn`}
                  onPress={e => onReply(comment, e.target as HTMLElement)}
                >
                  {t('common.reply')}
                </Link>
              </OptionalRequirePermission>
            )}
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
