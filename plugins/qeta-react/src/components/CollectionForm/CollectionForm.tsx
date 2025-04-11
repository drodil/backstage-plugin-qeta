import { useAnalytics, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  CollectionRequest,
  CollectionResponse,
  QetaApi,
} from '@drodil/backstage-plugin-qeta-common';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { collectionRouteRef } from '../../routes';
import { useConfirmNavigationIfEdited } from '../../utils/utils';
import { qetaApiRef } from '../../api';
import { CollectionFormData } from './types';
import { HeaderImageInput } from '../HeaderImageInput/HeaderImageInput';
import { useTranslation } from '../../hooks';

const formToRequest = (
  form: CollectionFormData,
  images: number[],
): CollectionRequest => {
  return {
    ...form,
    images,
  };
};

export type CollectionFormProps = {
  id?: string;
  onPost?: (collection: CollectionResponse) => void;
};

const getDefaultValues = (): CollectionFormData => {
  return {
    title: '',
    images: [],
  };
};

const getValues = async (
  api: QetaApi,
  id?: string,
): Promise<{ form: CollectionFormData; collection?: CollectionResponse }> => {
  if (!id) {
    return { form: getDefaultValues() };
  }

  const collection = await api.getCollection(id);
  return {
    form: {
      title: collection.title,
      description: collection.description,
      headerImage: collection.headerImage,
      images: collection.images,
    },
    collection,
  };
};

export const CollectionForm = (props: CollectionFormProps) => {
  const { id, onPost } = props;
  const collectionRoute = useRouteRef(collectionRouteRef);
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const [posting, setPosting] = React.useState(false);
  const [values, setValues] = React.useState(getDefaultValues());
  const [error, setError] = React.useState(false);
  const [edited, setEdited] = React.useState(false);
  const [images, setImages] = React.useState<number[]>([]);
  const { t } = useTranslation();

  const qetaApi = useApi(qetaApiRef);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CollectionFormData>({
    values,
    defaultValues: getDefaultValues(),
  });

  const postQuestion = (data: CollectionFormData) => {
    setPosting(true);

    if (id) {
      qetaApi
        .updateCollection(Number(id), formToRequest(data, images))
        .then(q => {
          if (!q || !q.id) {
            setError(true);
            return;
          }
          setEdited(false);
          reset();
          analytics.captureEvent('edit', 'collection');
          if (onPost) {
            onPost(q);
          } else {
            navigate(collectionRoute({ id: q.id.toString(10) }));
          }
        })
        .catch(_e => {
          setError(true);
          setPosting(false);
        });
      return;
    }
    qetaApi
      .createCollection(formToRequest(data, images))
      .then(q => {
        if (!q || !q.id) {
          setError(true);
          return;
        }
        setEdited(false);
        analytics.captureEvent('post', 'collection');
        reset();
        navigate(collectionRoute({ id: q.id.toString(10) }));
      })
      .catch(_e => {
        setError(true);
        setPosting(false);
      });
  };

  useEffect(() => {
    if (id) {
      getValues(qetaApi, id).then(data => {
        setValues(data.form);
        setImages(data.form.images);
      });
    }
  }, [qetaApi, id]);

  useEffect(() => {
    reset(values);
  }, [values, reset]);

  useConfirmNavigationIfEdited(edited && !posting);

  const onImageUpload = useCallback(
    (imageId: number) => {
      setImages(prevImages => [...prevImages, imageId]);
    },
    [setImages],
  );

  return (
    <form
      onSubmit={handleSubmit(postQuestion)}
      onChange={() => {
        setEdited(true);
      }}
    >
      {error && (
        <Alert severity="error">{t('collectionForm.errorPosting')}</Alert>
      )}
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <HeaderImageInput
            onChange={onChange}
            onImageUpload={onImageUpload}
            url={value}
            collectionId={id ? Number(id) : undefined}
          />
        )}
        name="headerImage"
      />
      <TextField
        label={t('collectionForm.titleInput.label')}
        className="qetaCollectionFormTitle"
        required
        fullWidth
        error={'title' in errors}
        margin="normal"
        variant="outlined"
        helperText={t('collectionForm.titleInput.helperText')}
        {
          // @ts-ignore
          ...register('title', { required: true, maxLength: 255 })
        }
      />

      <Controller
        control={control}
        rules={{
          required: false,
        }}
        render={({ field: { onChange, value } }) => (
          <MarkdownEditor
            value={value ?? ''}
            onChange={onChange}
            height={400}
            error={'content' in errors}
            placeholder={t('collectionForm.descriptionInput.placeholder')}
            onImageUpload={onImageUpload}
            collectionId={id ? Number(id) : undefined}
          />
        )}
        name="description"
      />
      <Button
        color="primary"
        type="submit"
        variant="contained"
        disabled={posting}
      >
        {id
          ? t('collectionForm.submit.existingCollection')
          : t('collectionForm.submit.newCollection')}
      </Button>
    </form>
  );
};
