import { WarningPanel } from '@backstage/core-components';
import { useState, useCallback, useEffect } from 'react';
import { configApiRef, useAnalytics, useApi } from '@backstage/core-plugin-api';
import {
  AnswerRequest,
  AnswerResponse,
  PostResponse,
  qetaCreateAnswerPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { Controller, useForm } from 'react-hook-form';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { PostAnonymouslyCheckbox } from '../PostAnonymouslyCheckbox/PostAnonymouslyCheckbox';
import { useConfirmNavigationIfEdited } from '../../utils/utils';
import { qetaApiRef } from '../../api';
import { useTranslation } from '../../hooks';
import { Button, Typography } from '@material-ui/core';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';

type AnswerFormData = {
  postId: number;
  answer: string;
  images: number[];
};

const getDefaultValues = (postId: number): AnswerFormData => {
  return { postId, answer: '', images: [] };
};

export const AnswerForm = (props: {
  post: PostResponse;
  onPost: (answer: AnswerResponse) => void;
  id?: number;
}) => {
  const { post, onPost, id } = props;
  const [values, setValues] = useState<AnswerFormData>(
    getDefaultValues(post.id),
  );
  const analytics = useAnalytics();
  const [error, setError] = useState(false);
  const [images, setImages] = useState<number[]>([]);
  const [edited, setEdited] = useState(false);
  const qetaApi = useApi(qetaApiRef);
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
          setValues({ postId: post.id, answer: a.content, images: a.images });
          setImages(a.images);
        } else {
          setError(true);
        }
      });
    }
  }, [id, post, qetaApi]);

  useEffect(() => {
    reset(values);
  }, [values, reset]);

  useConfirmNavigationIfEdited(edited);

  const onImageUpload = useCallback(
    (imageId: number) => {
      setImages(prevImages => [...prevImages, imageId]);
    },
    [setImages],
  );

  return (
    <OptionalRequirePermission
      permission={qetaCreateAnswerPermission}
      errorPage={<></>}
    >
      <form
        onSubmit={handleSubmit(postAnswer)}
        onChange={() => {
          setEdited(true);
        }}
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
              placeholder={t('answerForm.contentInput.placeholder')}
              onImageUpload={onImageUpload}
              answerId={id ? Number(id) : undefined}
            />
          )}
          name="answer"
        />
        {allowAnonymouns && !id && (
          <PostAnonymouslyCheckbox
            control={control}
            label={t('anonymousCheckbox.answerAnonymously')}
          />
        )}
        <Button variant="outlined" type="submit" color="primary">
          {id
            ? t('answerForm.submit.existingAnswer')
            : t('answerForm.submit.newAnswer')}
        </Button>
      </form>
    </OptionalRequirePermission>
  );
};
