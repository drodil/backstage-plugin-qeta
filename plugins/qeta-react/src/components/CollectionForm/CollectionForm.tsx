import {
  configApiRef,
  errorApiRef,
  useAnalytics,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import {
  Button,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  CollectionRequest,
  CollectionResponse,
  QetaApi,
} from '@drodil/backstage-plugin-qeta-common';
import { useStyles, useTranslation } from '../../utils';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { collectionRouteRef } from '../../routes';
import { confirmNavigationIfEdited, imageUpload } from '../../utils/utils';
import { qetaApiRef } from '../../api';
import { CollectionFormData } from './types';

const formToRequest = (
  form: CollectionFormData,
  images: number[],
  headerImage?: string,
): CollectionRequest => {
  return {
    ...form,
    images,
    headerImage,
  };
};

export type CollectionFormProps = {
  id?: string;
  onPost?: (collection: CollectionResponse) => void;
};

const getDefaultValues = (): CollectionFormData => {
  return {
    title: '',
    readAccess: 'private',
    editAccess: 'private',
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
      editAccess: collection.editAccess,
      readAccess: collection.readAccess,
      headerImage: collection.headerImage,
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
  const [headerImage, setHeaderImage] = React.useState<string | undefined>();
  const [canModifyAccess, setCanModifyAccess] = React.useState(true);

  const [images, setImages] = React.useState<number[]>([]);
  const { t } = useTranslation();

  const qetaApi = useApi(qetaApiRef);
  const configApi = useApi(configApiRef);
  const errorApi = useApi(errorApiRef);
  const styles = useStyles();
  const isUploadDisabled =
    configApi.getOptionalBoolean('qeta.storage.disabled') || false;
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
        .updateCollection(Number(id), formToRequest(data, images, headerImage))
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
      .createCollection(formToRequest(data, images, headerImage))
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
        setHeaderImage(data.form.headerImage);
        setCanModifyAccess(data.collection?.canDelete ?? false);
      });
    }
  }, [qetaApi, id]);

  useEffect(() => {
    reset(values);
  }, [values, reset]);

  useEffect(() => {
    return confirmNavigationIfEdited(edited);
  }, [edited]);

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
      className="qetaAskForm"
    >
      {error && (
        <Alert severity="error">{t('collectionForm.errorPosting')}</Alert>
      )}
      {!isUploadDisabled && (
        <>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="headerImage"
            type="file"
            onChange={async event => {
              if (!event.target.files || event.target.files.length === 0) {
                return;
              }
              const buffer = await event.target.files[0].arrayBuffer();

              const uri = await imageUpload({
                qetaApi,
                errorApi,
                onImageUpload,
              })(buffer).next();
              if (typeof uri.value === 'string') {
                setHeaderImage(uri.value);
              }
            }}
          />
          <label htmlFor="headerImage">
            <Button variant="contained" color="primary" component="span">
              {t('collectionForm.uploadHeaderImage')}
            </Button>
          </label>
        </>
      )}
      {headerImage && (
        <img className={styles.headerImage} src={headerImage} alt="header" />
      )}
      <TextField
        label="Title"
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
            config={configApi}
            onImageUpload={onImageUpload}
          />
        )}
        name="description"
      />
      {canModifyAccess && (
        <Grid container style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <Grid item>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <FormControl>
                  <FormHelperText>Read access</FormHelperText>
                  <Select variant="outlined" onChange={onChange} value={value}>
                    <MenuItem value="private">Only you</MenuItem>
                    <MenuItem value="public">Anyone</MenuItem>
                  </Select>
                </FormControl>
              )}
              name="readAccess"
            />
          </Grid>
          <Grid item>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <FormControl>
                  <FormHelperText>Edit access</FormHelperText>
                  <Select variant="outlined" onChange={onChange} value={value}>
                    <MenuItem value="private">Only you</MenuItem>
                    <MenuItem value="public">Anyone</MenuItem>
                  </Select>
                </FormControl>
              )}
              name="editAccess"
            />
          </Grid>
        </Grid>
      )}
      <Button
        color="primary"
        type="submit"
        variant="contained"
        disabled={posting}
        className={`qetaCollectionFormSubmitBtn ${styles.postButton}`}
      >
        {id
          ? t('collectionForm.submit.existingCollection')
          : t('collectionForm.submit.newCollection')}
      </Button>
    </form>
  );
};
