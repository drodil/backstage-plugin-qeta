import { WarningPanel } from '@backstage/core-components';
import { Button, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { configApiRef, useAnalytics, useApi } from '@backstage/core-plugin-api';
import {
  AnswerRequest,
  AnswerResponse,
  qetaCreateAnswerPermission,
  QuestionResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useStyles } from '../../utils/hooks';
import { Controller, useForm } from 'react-hook-form';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { AskAnonymouslyCheckbox } from '../AskAnonymouslyCheckbox/AskAnonymouslyCheckbox';
import { qetaApiRef } from '../../api';

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
  const analytics = useAnalytics();
  const [error, setError] = React.useState(false);
  const [images, setImages] = React.useState<number[]>([]);
  const qetaApi = useApi(qetaApiRef);
  const styles = useStyles();
  const configApi = useApi(configApiRef);
  const allowAnonymouns = configApi.getOptionalBoolean('qeta.allowAnonymous');

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
        .updateAnswer(id, {
          questionId: question.id,
          answer: data.answer,
          images,
        })
        .then(a => {
          if (!a || !('id' in a)) {
            setError(true);
            return;
          }
          analytics.captureEvent('edit', 'answer');
          reset();
          onPost(a);
        })
        .catch(_e => setError(true));
      return;
    }
    // http://localhost:7007/api/qeta/attachments/36e551b1-3be7-479a-8942-b7018434e710
    qetaApi
      .postAnswer({
        questionId: question.id,
        answer: data.answer,
        images,
        anonymous: data.anonymous,
      })
      .then(a => {
        if (!a || !('id' in a)) {
          setError(true);
          return;
        }
        analytics.captureEvent('post', 'answer');
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
      <form onSubmit={handleSubmit(postAnswer)} className="qetaAnswerForm">
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
              config={configApi}
              onImageUpload={(imageId: number) => {
                setImages(prevImages => [...prevImages, imageId]);
              }}
            />
          )}
          name="answer"
        />
        {allowAnonymouns && !id && (
          <AskAnonymouslyCheckbox
            control={control}
            label="Answer anonymously"
          />
        )}
        <Button
          variant="outlined"
          type="submit"
          color="primary"
          className={`qetaAnswerFormPostBtn ${styles.postButton}`}
        >
          {id ? 'Save' : 'Post'}
        </Button>
      </form>
    </RequirePermission>
  );
};
