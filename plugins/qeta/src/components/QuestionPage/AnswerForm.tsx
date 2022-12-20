import { WarningPanel } from '@backstage/core-components';
import { Button, Typography } from '@material-ui/core';
import MDEditor from '@uiw/react-md-editor';
import React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { AnswerResponse, qetaApiRef, QuestionResponse } from '../../api';

export const AnswerForm = (props: {
  question: QuestionResponse;
  onPost: (answer: AnswerResponse) => void;
}) => {
  const { question, onPost } = props;
  const [answer, setAnswer] = React.useState('');
  const [error, setError] = React.useState(false);
  const qetaApi = useApi(qetaApiRef);

  const postAnswer = () => {
    qetaApi
      .postAnswer({ questionId: question.id, answer })
      .then(a => {
        if (!a || !('id' in a)) {
          setError(true);
          return;
        }
        onPost(a);
        setAnswer('');
      })
      .catch(_e => setError(true));
  };

  return (
    <form>
      <Typography variant="h6">Your answer</Typography>
      {error && <WarningPanel severity="error" title="Could not post answer" />}
      <MDEditor
        value={answer}
        onChange={v => setAnswer(v as string)}
        preview="edit"
        height={200}
      />
      <Button variant="contained" onClick={postAnswer}>
        Post
      </Button>
    </form>
  );
};
