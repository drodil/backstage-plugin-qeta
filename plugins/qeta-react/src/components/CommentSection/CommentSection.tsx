import React, { useEffect, useState } from 'react';
import { Box, Button, Grid } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import {
  AnswerResponse,
  PostResponse,
  qetaCreateCommentPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { Controller, useForm } from 'react-hook-form';
import { configApiRef, useAnalytics, useApi } from '@backstage/core-plugin-api';
import { CommentList } from './CommentList';
import { qetaApiRef } from '../../api';
import { confirmNavigationIfEdited } from '../../utils/utils';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { useTranslation } from '../../hooks';

export const CommentSection = (props: {
  onCommentPost: (question: PostResponse, answer?: AnswerResponse) => void;
  onCommentDelete: (question: PostResponse, answer?: AnswerResponse) => void;
  post: PostResponse;
  answer?: AnswerResponse;
  className?: string;
}) => {
  const { answer, post, onCommentPost, onCommentDelete } = props;
  const analytics = useAnalytics();
  const qetaApi = useApi(qetaApiRef);
  const configApi = useApi(configApiRef);
  const [posting, setPosting] = React.useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [edited, setEdited] = React.useState(false);
  const { t } = useTranslation();
  const { handleSubmit, control, reset } = useForm<{ content: string }>({});

  const postComment = (data: { content: string }) => {
    setPosting(true);
    if (answer) {
      qetaApi.commentAnswer(post.id, answer.id, data.content).then(a => {
        setFormVisible(false);
        analytics.captureEvent('comment', 'answer');
        reset();
        setPosting(false);
        setEdited(false);
        onCommentPost(post, a);
      });
      return;
    }

    qetaApi.commentPost(post.id, data.content).then(q => {
      setFormVisible(false);
      analytics.captureEvent('comment', post.type);
      reset();
      setPosting(false);
      setEdited(false);
      onCommentPost(q);
    });
  };

  useEffect(() => {
    return confirmNavigationIfEdited(edited);
  }, [edited]);

  return (
    <Box marginLeft={9} className={`${props.className} qetaCommentSection`}>
      <CommentList
        question={post}
        answer={answer}
        onCommentDelete={onCommentDelete}
      />
      <RequirePermission
        permission={qetaCreateCommentPermission}
        errorPage={<></>}
      >
        {!formVisible && (
          <Link
            underline="none"
            to="#"
            className="qetaAddCommentBtn"
            onClick={() => setFormVisible(true)}
          >
            {t('commentSection.addComment')}
          </Link>
        )}
        {formVisible && (
          <form
            onSubmit={handleSubmit(postComment)}
            onChange={() => {
              setEdited(true);
            }}
            className="qetaCommentForm"
          >
            <Grid container>
              <Grid item xs={11}>
                <Controller
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, value } }) => (
                    <MarkdownEditor
                      config={configApi}
                      value={value}
                      onChange={onChange}
                      height={60}
                      disablePreview
                      disableAttachments
                      disableToolbar
                    />
                  )}
                  name="content"
                />
              </Grid>
              <Grid item xs={1}>
                <Button
                  variant="contained"
                  size="small"
                  className="qetaCommentBtn"
                  type="submit"
                  color="primary"
                  disabled={posting}
                >
                  {t('commentSection.post')}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </RequirePermission>
    </Box>
  );
};
