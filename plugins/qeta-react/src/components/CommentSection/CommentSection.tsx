import { useState } from 'react';
import { Box, Button, Flex } from '@backstage/ui';
import {
  AnswerResponse,
  Comment,
  PostResponse,
  qetaCreateCommentPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';
import { CommentList } from './CommentList';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { RiChatNewLine } from '@remixicon/react';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { CommentForm } from './CommentForm.tsx';
import { useConfirmNavigationIfEdited } from '../../utils';
import styles from './CommentSection.module.css';
import { toastApiRef } from '@backstage/frontend-plugin-api';

export const CommentSection = (props: {
  onCommentAction: (post: PostResponse, answer?: AnswerResponse) => void;
  post: PostResponse;
  answer?: AnswerResponse;
  className?: string;
  showProminentButton?: boolean;
}) => {
  const { answer, post, onCommentAction, showProminentButton = false } = props;
  const analytics = useAnalytics();
  const qetaApi = useApi(qetaApiRef);
  const [posting, setPosting] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [edited, setEdited] = useState(false);
  const { t } = useTranslationRef(qetaTranslationRef);

  const toastApi = useApi(toastApiRef);

  const closeForm = () => {
    setReplyContent('');
    setFormVisible(false);
  };

  const beginReply = (comment: Comment, replyAction: HTMLElement) => {
    const mention = `@${comment.author} `;
    setReplyContent(mention);
    setFormVisible(true);
    requestAnimationFrame(() => {
      const textareas = replyAction
        .closest('.qetaCommentSection')
        ?.querySelectorAll<HTMLTextAreaElement>('.qetaCommentForm textarea');
      const textarea = textareas?.[textareas.length - 1];
      textarea?.focus();
      textarea?.setSelectionRange(mention.length, mention.length);
    });
  };

  const postComment = (data: { content: string }) => {
    setPosting(true);
    if (answer) {
      qetaApi
        .commentAnswer(post.id, answer.id, data.content)
        .catch(e => {
          toastApi.post({
            title: e.message,
            status: 'warning',
          });
        })
        .then(a => {
          closeForm();
          analytics.captureEvent('comment', 'answer');
          setEdited(false);
          if (a) {
            onCommentAction(post, a);
          }
        })
        .finally(() => setPosting(false));
    } else {
      qetaApi
        .commentPost(post.id, data.content)
        .catch(e => {
          toastApi.post({
            title: e.message,
            status: 'warning',
          });
        })
        .then(q => {
          closeForm();
          analytics.captureEvent('comment', 'question');
          setEdited(false);
          if (q) {
            onCommentAction(q);
          }
        })
        .finally(() => setPosting(false));
    }
  };

  useConfirmNavigationIfEdited(edited);

  if (post.status !== 'active' && post.status !== 'obsolete') {
    return null;
  }

  const isObsolete = post.status === 'obsolete';

  return (
    <Box
      className={`${styles.commentSection} ${props.className ?? ''} qetaCommentSection`}
    >
      <Box pl="1">
        <CommentList
          post={post}
          answer={answer}
          onCommentAction={onCommentAction}
          onReply={beginReply}
        />
      </Box>
      {!isObsolete && (
        <OptionalRequirePermission
          permission={qetaCreateCommentPermission}
          errorPage={<></>}
        >
          {!formVisible && showProminentButton && (
            <Flex justify="start">
              <Button
                variant="primary"
                iconStart={<RiChatNewLine size={16} />}
                onClick={() => {
                  setReplyContent('');
                  setFormVisible(true);
                }}
                className={styles.prominentButton}
              >
                {t('commentSection.leaveComment')}
              </Button>
            </Flex>
          )}
          {!formVisible && !showProminentButton && (
            <Flex justify="start">
              <Button
                size="small"
                variant="tertiary"
                iconStart={<RiChatNewLine size={16} />}
                onClick={() => {
                  setReplyContent('');
                  setFormVisible(true);
                }}
              >
                {t('commentSection.addComment')}
              </Button>
            </Flex>
          )}
          {formVisible && (
            <Box className={styles.commentForm}>
              <CommentForm
                key={replyContent}
                submit={postComment}
                saveButtonTitle={t('commentSection.post')}
                defaultValues={{ content: replyContent }}
                disabled={posting}
                onDiscard={closeForm}
              />
            </Box>
          )}
        </OptionalRequirePermission>
      )}
    </Box>
  );
};
