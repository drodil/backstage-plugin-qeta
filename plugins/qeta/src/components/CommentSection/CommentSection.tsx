import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, TextField } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import {
  AnswerResponse,
  QuestionResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Controller, useForm } from 'react-hook-form';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';
import { CommentList } from './CommentList';
import { qetaApiRef } from '../../api';
import { useTranslation } from '../../utils/hooks';
import { confirmNavigationIfEdited } from '../../utils/utils';

export const CommentSection = (props: {
  onCommentPost: (question: QuestionResponse, answer?: AnswerResponse) => void;
  onCommentDelete: (
    question: QuestionResponse,
    answer?: AnswerResponse,
  ) => void;
  question: QuestionResponse;
  answer?: AnswerResponse;
}) => {
  const { answer, question, onCommentPost, onCommentDelete } = props;
  const analytics = useAnalytics();
  const qetaApi = useApi(qetaApiRef);
  const [posting, setPosting] = React.useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [edited, setEdited] = React.useState(false);
  const { t } = useTranslation();
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<{ content: string }>({});

  const postComment = (data: { content: string }) => {
    setPosting(true);
    if (answer) {
      qetaApi.commentAnswer(question.id, answer.id, data.content).then(a => {
        setFormVisible(false);
        analytics.captureEvent('comment', 'answer');
        reset();
        setPosting(false);
        onCommentPost(question, a);
      });
      return;
    }

    qetaApi.commentQuestion(question.id, data.content).then(q => {
      setFormVisible(false);
      analytics.captureEvent('comment', 'question');
      reset();
      setPosting(false);
      onCommentPost(q);
    });
  };

  useEffect(() => {
    confirmNavigationIfEdited(edited);
  }, [edited]);

  return (
    <Box marginLeft={9} className="qetaCommentSection">
      <CommentList
        question={question}
        answer={answer}
        onCommentDelete={onCommentDelete}
      />
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
                  <TextField
                    id="comment"
                    multiline
                    minRows={2}
                    fullWidth
                    className="qetaCommentInput"
                    value={value}
                    placeholder={t('commentSection.input.placeholder')}
                    onChange={onChange}
                    variant="outlined"
                    error={'content' in errors}
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
    </Box>
  );
};
