/* eslint-disable jsx-a11y/no-autofocus */
import * as React from 'react';
import { useState } from 'react';
import { Box, Button, Grid, makeStyles } from '@material-ui/core';
import {
  AnswerResponse,
  PostResponse,
  qetaCreateCommentPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';
import { CommentList } from './CommentList';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import AddCommentIcon from '@material-ui/icons/AddComment';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { CommentForm } from './CommentForm.tsx';
import { useConfirmNavigationIfEdited } from '../../utils';

export type QetaCommentSectionClassKey =
  | 'root'
  | 'addCommentButton'
  | 'commentSection'
  | 'commentForm';

const useStyles = makeStyles(
  theme => ({
    root: {},
    commentSection: {
      position: 'relative',
      marginLeft: theme.spacing(3.5),
      '&::before': {
        content: '""',
        position: 'absolute',
        left: theme.spacing(1),
        height: 'calc(100% - 46px)',
        width: '1px',
        backgroundColor: theme.palette.divider,
        opacity: 0.4,
        transition: 'all 0.2s ease-in-out',
        zIndex: 1,
      },
    },
    addCommentButton: {
      textTransform: 'none',
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.palette.text.secondary,
      marginTop: '3px',
      '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.primary.main,
      },
    },
    commentForm: {
      marginLeft: theme.spacing(2.5),
      marginTop: theme.spacing(1),
    },
  }),
  { name: 'QetaCommentSection' },
);

export const CommentSection = (props: {
  onCommentAction: (post: PostResponse, answer?: AnswerResponse) => void;
  post: PostResponse;
  answer?: AnswerResponse;
  className?: string;
}) => {
  const { answer, post, onCommentAction } = props;
  const analytics = useAnalytics();
  const qetaApi = useApi(qetaApiRef);
  const [posting, setPosting] = React.useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [edited, setEdited] = React.useState(false);
  const { t } = useTranslationRef(qetaTranslationRef);
  const styles = useStyles();

  // Determine the entity to get comments from
  const entity = answer ?? post;
  const commentsCount = entity.comments?.length || 0;
  const [commentsVisible, setCommentsVisible] = useState(true);

  const postComment = (data: { content: string }) => {
    setPosting(true);
    if (answer) {
      qetaApi.commentAnswer(post.id, answer.id, data.content).then(a => {
        setFormVisible(false);
        analytics.captureEvent('comment', 'answer');
        setPosting(false);
        setEdited(false);
        onCommentAction(post, a);
      });
      return;
    }

    qetaApi.commentPost(post.id, data.content).then(q => {
      setFormVisible(false);
      analytics.captureEvent('comment', post.type);
      setPosting(false);
      setEdited(false);
      onCommentAction(q);
    });
  };

  useConfirmNavigationIfEdited(edited);

  if (post.status !== 'active') {
    return null;
  }

  return (
    <Box
      className={`${styles.root} ${styles.commentSection} ${props.className} qetaCommentSection`}
    >
      {commentsCount > 0 && (
        <Box display="flex" alignItems="center" pl={1}>
          <Button
            size="small"
            variant="text"
            onClick={() => setCommentsVisible(v => !v)}
            style={{
              textTransform: 'none',
              padding: '0.5rem 0.8rem',
              border: 'none',
              backgroundColor: 'transparent',
            }}
            endIcon={
              commentsVisible ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ExpandLessIcon fontSize="small" />
              )
            }
          >
            {`${commentsCount} ${t('common.comments')}`}
          </Button>
        </Box>
      )}
      {commentsVisible && (
        <Box pl={1}>
          <CommentList
            post={post}
            answer={answer}
            onCommentAction={onCommentAction}
          />
        </Box>
      )}
      <OptionalRequirePermission
        permission={qetaCreateCommentPermission}
        errorPage={<></>}
      >
        {!formVisible && (
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button
                size="small"
                startIcon={<AddCommentIcon fontSize="small" />}
                onClick={() => setFormVisible(true)}
                className={styles.addCommentButton}
              >
                {t('commentSection.addComment')}
              </Button>
            </Grid>
          </Grid>
        )}
        {formVisible && (
          <Box className={styles.commentForm}>
            <CommentForm
              submit={postComment}
              saveButtonTitle={t('commentSection.post')}
              disabled={posting}
            />
          </Box>
        )}
      </OptionalRequirePermission>
    </Box>
  );
};
