import { WarningPanel } from '@backstage/core-components';
import { Button, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { configApiRef, useAnalytics, useApi } from '@backstage/core-plugin-api';
import {
  AnswerRequest,
  AnswerResponse,
  PostResponse,
  qetaCreateAnswerPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { useStyles, useTranslation } from '../../utils/hooks';
import { Controller, useForm } from 'react-hook-form';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { AskAnonymouslyCheckbox } from '../AskAnonymouslyCheckbox/AskAnonymouslyCheckbox';
import { qetaApiRef } from '../../api';
import { confirmNavigationIfEdited } from '../../utils/utils';

const getDefaultValues = (postId: number) => {
  return { postId, answer: '' };
};

export const AnswerForm = (props: {
  post: PostResponse;
  onPost: (answer: AnswerResponse) => void;
  id?: number;
}) => {
  const { post, onPost, id } = props;
  const [values, setValues] = React.useState(getDefaultValues(post.id));
  const analytics = useAnalytics();
  const [error, setError] = React.useState(false);
  const [images, setImages] = React.useState<number[]>([]);
  const [edited, setEdited] = React.useState(false);
  const qetaApi = useApi(qetaApiRef);
  const styles = useStyles();
  const configApi = useApi(configApiRef);
  const allowAnonymouns = configApi.getOptionalBoolean('qeta.allowAnonymous');
  const { t } = useTranslation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AnswerRequest>({
    values,
    defaultValues: getDefaultValues(post.id),
  });

  const postAnswer = (data: AnswerRequest) => {
    if (id) {
      qetaApi
        .updateAnswer(id, {
          postId: post.id,
          answer: data.answer,
          images,
        })
        .then(a => {
          if (!a || !('id' in a)) {
            setError(true);
            return;
          }
          setEdited(false);
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
        postId: post.id,
        answer: data.answer,
        images,
        anonymous: data.anonymous,
      })
      .then(a => {
        if (!a || !('id' in a)) {
          setError(true);
          return;
        }
        setEdited(false);
        analytics.captureEvent('post', 'answer');
        reset();
        onPost(a);
      })
      .catch(_e => setError(true));
  };

  useEffect(() => {
    if (id) {
      qetaApi.getAnswer(post.id, id).then(a => {
        if ('content' in a) {
          setValues({ postId: post.id, answer: a.content });
        } else {
          setError(true);
        }
      });
    }
  }, [id, post, qetaApi]);

  useEffect(() => {
    reset(values);
  }, [values, reset]);

  useEffect(() => {
    return confirmNavigationIfEdited(edited);
  }, [edited]);

  return (
    <RequirePermission
      permission={qetaCreateAnswerPermission}
      errorPage={<></>}
    >
      <form
        onSubmit={handleSubmit(postAnswer)}
        onChange={() => {
          setEdited(true);
        }}
        className="qetaAnswerForm"
      >
        <Typography variant="h6">Your answer</Typography>
        {error && (
          <WarningPanel severity="error" title={t('answerForm.errorPosting')} />
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
              placeholder={t('answerForm.contentInput.placeholder')}
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
            label={t('anonymousCheckbox.answerAnonymously')}
          />
        )}
        <Button
          variant="outlined"
          type="submit"
          color="primary"
          className={`qetaAnswerFormPostBtn ${styles.postButton}`}
        >
          {id
            ? t('answerForm.submit.existingAnswer')
            : t('answerForm.submit.newAnswer')}
        </Button>
      </form>
    </RequirePermission>
  );
};
