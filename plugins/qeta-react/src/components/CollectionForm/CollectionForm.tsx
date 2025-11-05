import {
  alertApiRef,
  useAnalytics,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Link,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useCallback, useEffect, useState } from 'react';
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
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import HelpIcon from '@material-ui/icons/Help';

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
  const [posting, setPosting] = useState(false);
  const [values, setValues] = useState(getDefaultValues());
  const [error, setError] = useState(false);
  const [edited, setEdited] = useState(false);
  const [images, setImages] = useState<number[]>([]);
  const [showTips, setShowTips] = useState(false);
  const [titleCharCount, setTitleCharCount] = useState(values.title.length);
  const { t } = useTranslationRef(qetaTranslationRef);
  const alertApi = useApi(alertApiRef);

  const qetaApi = useApi(qetaApiRef);
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
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
          alertApi.post({
            message: t('collectionForm.errorPosting'),
            severity: 'error',
            display: 'transient',
          });
        })
        .finally(() => setPosting(false));
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
        alertApi.post({
          message: t('collectionForm.errorPosting'),
          severity: 'error',
          display: 'transient',
        });
      })
      .finally(() => setPosting(false));
  };

  useEffect(() => {
    if (id) {
      getValues(qetaApi, id)
        .catch(e =>
          alertApi.post({
            message: e.message,
            severity: 'error',
            display: 'transient',
          }),
        )
        .then(data => {
          if (data) {
            setValues(data.form);
            setImages(data.form.images);
          }
        });
    }
  }, [qetaApi, id, alertApi]);

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleCharCount(e.target.value.length);
    setValue('title', e.target.value, { shouldValidate: true });
  };

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
      <Box mb={2}>
        <TextField
          label={t('collectionForm.titleInput.label')}
          className="qetaCollectionFormTitle"
          required
          fullWidth
          error={'title' in errors}
          margin="normal"
          name="title"
          variant="outlined"
          helperText={
            <span>
              {t('collectionForm.titleInput.helperText')}{' '}
              <span style={{ float: 'right' }}>{titleCharCount}/255</span>
            </span>
          }
          FormHelperTextProps={{
            style: { marginLeft: '0.2em' },
          }}
          value={control._formValues.title}
          onChange={handleTitleChange}
          inputProps={{ maxLength: 255 }}
        />
      </Box>
      <Box
        mb={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="subtitle1" style={{ fontWeight: 500 }}>
          {t('collectionForm.descriptionInput.label')}
          <Tooltip title="Tips for a good collection">
            <IconButton size="small" onClick={() => setShowTips(v => !v)}>
              {showTips ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Typography>
        <Box>
          <Link
            href="https://www.markdownguide.org/cheat-sheet/"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            style={{ fontSize: 12 }}
          >
            {t('collectionForm.descriptionInput.markdownHelp')}
            <HelpIcon
              style={{ fontSize: 12, marginLeft: 4, verticalAlign: 'middle' }}
            />
          </Link>
        </Box>
      </Box>
      <Collapse in={showTips}>
        <Box mb={2} p={2}>
          <Typography variant="body2">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>{t('collectionForm.tips_1')}</li>
              <li>{t('collectionForm.tips_2')}</li>
              <li>{t('collectionForm.tips_3')}</li>
            </ul>
          </Typography>
        </Box>
      </Collapse>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => (
          <MarkdownEditor
            value={value ?? ''}
            onChange={onChange}
            height={400}
            name="description"
            error={'description' in errors}
            placeholder={t('collectionForm.descriptionInput.placeholder')}
            onImageUpload={onImageUpload}
            collectionId={id ? Number(id) : undefined}
          />
        )}
        name="description"
      />
      <Box mt={3}>
        <Button
          color="primary"
          type="submit"
          variant="contained"
          disabled={posting || isSubmitting}
          size="large"
        >
          {posting ? (
            <span>
              {t('collectionForm.submitting')}{' '}
              <span className="spinner-border spinner-border-sm" />
            </span>
          ) : (
            t(
              id
                ? 'collectionForm.submit.existingCollection'
                : 'collectionForm.submit.newCollection',
            )
          )}
        </Button>
      </Box>
    </form>
  );
};
