/* eslint-disable jsx-a11y/no-autofocus */
import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, makeStyles } from '@material-ui/core';
import {
  AnswerResponse,
  PostResponse,
  qetaCreateCommentPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';
import { CommentList } from './CommentList';
import { qetaApiRef } from '../../api';
import { confirmNavigationIfEdited } from '../../utils/utils';
import { useTranslation } from '../../hooks';
import AddCommentIcon from '@material-ui/icons/AddComment';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { CommentForm } from './CommentForm.tsx';

export type QetaCommentSectionClassKey = 'root' | 'addCommentButton';

const useStyles = makeStyles(
  () => ({
    root: {
      marginTop: '1em',
    },
    addCommentButton: {},
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
  const { t } = useTranslation();
  const styles = useStyles();

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

  useEffect(() => {
    return confirmNavigationIfEdited(edited);
  }, [edited]);

  return (
    <Box
      marginLeft={9}
      className={`${styles.root} ${props.className} qetaCommentSection`}
    >
      <CommentList
        post={post}
        answer={answer}
        onCommentAction={onCommentAction}
      />
      <OptionalRequirePermission
        permission={qetaCreateCommentPermission}
        errorPage={<></>}
      >
        {!formVisible && (
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button
                size="small"
                startIcon={<AddCommentIcon />}
                onClick={() => setFormVisible(true)}
              >
                {t('commentSection.addComment')}
              </Button>
            </Grid>
          </Grid>
        )}
        {formVisible && (
          <CommentForm
            submit={postComment}
            saveButtonTitle={t('commentSection.post')}
            disabled={posting}
          />
        )}
      </OptionalRequirePermission>
    </Box>
  );
};
