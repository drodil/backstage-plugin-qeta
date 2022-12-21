import { WarningPanel } from '@backstage/core-components';
import { Button, Typography } from '@material-ui/core';
import MDEditor from '@uiw/react-md-editor';
import React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import {
  AnswerRequest,
  AnswerResponse,
  qetaApiRef,
  QuestionResponse,
} from '../../api';
import { useStyles } from '../../utils/hooks';
import { Controller, useForm } from 'react-hook-form';

export const AnswerForm = (props: {
  question: QuestionResponse;
  onPost: (answer: AnswerResponse) => void;
}) => {
  const { question, onPost } = props;
  const [error, setError] = React.useState(false);
  const qetaApi = useApi(qetaApiRef);
  const styles = useStyles();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AnswerRequest>();

  const postAnswer = (data: AnswerRequest) => {
    qetaApi
      .postAnswer({ questionId: question.id, answer: data.answer })
      .then(a => {
        if (!a || !('id' in a)) {
          setError(true);
          return;
        }
        reset();
        onPost(a);
      })
      .catch(_e => setError(true));
  };

  return (
    <form onSubmit={handleSubmit(postAnswer)}>
      <Typography variant="h6">Your answer</Typography>
      {error && <WarningPanel severity="error" title="Could not post answer" />}
      <Controller
        control={control}
        defaultValue=""
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => (
          <MDEditor
            className={styles.markdownEditor}
            preview="edit"
            height={200}
            extraCommands={[]}
            value={value}
            style={{
              borderColor: 'answer' in errors ? 'red' : undefined,
            }}
            onChange={onChange}
          />
        )}
        name="answer"
      />
      <Button variant="contained" type="submit" className={styles.postButton}>
        Post
      </Button>
    </form>
  );
};
