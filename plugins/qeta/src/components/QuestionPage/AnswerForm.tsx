import { WarningPanel } from '@backstage/core-components';
import { Typography, Button } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import {
  AnswerRequest,
  AnswerResponse,
  qetaApiRef,
  QuestionResponse,
} from '../../api';
import { useStyles } from '../../utils/hooks';
import { Controller, useForm } from 'react-hook-form';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { qetaCreateAnswerPermission } from '@drodil/backstage-plugin-qeta-common';

const getDefaultValues = (questionId: number) => {
  return { questionId, answer: '' };
};

export const AnswerForm = (props: {
  question: QuestionResponse;
  onPost: (answer: AnswerResponse) => void;
  id?: number;
}) => {
  const { question, onPost, id } = props;
  const [values, setValues] = React.useState(getDefaultValues(question.id));
  const [error, setError] = React.useState(false);
  const qetaApi = useApi(qetaApiRef);
  const styles = useStyles();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AnswerRequest>({
    values,
    defaultValues: getDefaultValues(question.id),
  });

  const postAnswer = (data: AnswerRequest) => {
    if (id) {
      qetaApi
        .updateAnswer(id, { questionId: question.id, answer: data.answer })
        .then(a => {
          if (!a || !('id' in a)) {
            setError(true);
            return;
          }
          reset();
          onPost(a);
        })
        .catch(_e => setError(true));
      return;
    }

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

  useEffect(() => {
    if (id) {
      qetaApi.getAnswer(question.id, id).then(a => {
        if ('content' in a) {
          setValues({ questionId: question.id, answer: a.content });
        } else {
          setError(true);
        }
      });
    }
  }, [id, question, qetaApi]);

  useEffect(() => {
    reset(values);
  }, [values, reset]);

  return (
    <RequirePermission
      permission={qetaCreateAnswerPermission}
      errorPage={<></>}
    >
      <form onSubmit={handleSubmit(postAnswer)}>
        <Typography variant="h6">Your answer</Typography>
        {error && (
          <WarningPanel severity="error" title="Could not post answer" />
        )}
        <Controller
          control={control}
          defaultValue=""
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <MarkdownEditor
              value={value}
              onChange={onChange}
              height={200}
              error={'answer' in errors}
            />
          )}
          name="answer"
        />
        <Button
          variant="outlined"
          type="submit"
          color="primary"
          className={styles.postButton}
        >
          {id ? 'Save' : 'Post'}
        </Button>
      </form>
    </RequirePermission>
  );
};
