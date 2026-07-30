import { useState } from 'react';
import { Box, Button, Flex } from '@backstage/ui';
import {
  AnswerResponse,
  PostResponse,
  qetaCreateCommentPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { alertApiRef, useAnalytics, useApi } from '@backstage/core-plugin-api';
import { CommentList } from './CommentList';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiChatNewLine,
} from '@remixicon/react';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { CommentForm } from './CommentForm.tsx';
import { useConfirmNavigationIfEdited } from '../../utils';
import styles from './CommentSection.module.css';

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
  const [edited, setEdited] = useState(false);
  const { t } = useTranslationRef(qetaTranslationRef);

  // Determine the entity to get comments from
  const entity = answer ?? post;
  const commentsCount = entity.comments?.length || 0;
  const [commentsVisible, setCommentsVisible] = useState(true);
  const alertApi = useApi(alertApiRef);

  const postComment = (data: { content: string }) => {
    setPosting(true);
    if (answer) {
      qetaApi
        .commentAnswer(post.id, answer.id, data.content)
        .catch(e =>
          alertApi.post({
            message: e.message,
            severity: 'error',
            display: 'transient',
          }),
        )
        .then(a => {
          setFormVisible(false);
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
        .catch(e =>
          alertApi.post({
            message: e.message,
            severity: 'error',
            display: 'transient',
          }),
        )
        .then(q => {
          setFormVisible(false);
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
      {commentsCount > 0 && (
        <Flex align="center" pl="1">
          <Button
            size="small"
            variant="tertiary"
            onClick={() => setCommentsVisible(v => !v)}
            iconEnd={
              commentsVisible ? (
                <RiArrowUpSLine size={16} />
              ) : (
                <RiArrowDownSLine size={16} />
              )
            }
          >
            {`${commentsCount} ${t('common.comments')}`}
          </Button>
        </Flex>
      )}
      {commentsVisible && (
        <Box pl="1">
          <CommentList
            post={post}
            answer={answer}
            onCommentAction={onCommentAction}
          />
        </Box>
      )}
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
                onClick={() => setFormVisible(true)}
                className={styles.prominentButton}
              >
                {t('commentSection.leaveComment')}
              </Button>
            </Flex>
          )}
          {!formVisible && !showProminentButton && (
            <Flex justify="end">
              <Button
                size="small"
                variant="tertiary"
                iconStart={<RiChatNewLine size={16} />}
                onClick={() => setFormVisible(true)}
              >
                {t('commentSection.addComment')}
              </Button>
            </Flex>
          )}
          {formVisible && (
            <Box className={styles.commentForm}>
              <CommentForm
                submit={postComment}
                saveButtonTitle={t('commentSection.post')}
                disabled={posting}
                onDiscard={() => setFormVisible(false)}
              />
            </Box>
          )}
        </OptionalRequirePermission>
      )}
    </Box>
  );
};
