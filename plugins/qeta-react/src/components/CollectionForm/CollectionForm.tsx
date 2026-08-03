import { useAnalytics, useApi, useRouteRef } from '@backstage/core-plugin-api';
import {
  Alert,
  Box,
  Button,
  ButtonIcon,
  Flex,
  Link,
  Text,
  TextField,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
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
import { TagInput } from '../PostForm/TagInput';
import { EntitiesInput } from '../PostForm/EntitiesInput';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/catalog-client';
import { compact } from 'lodash';
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiInformationLine,
} from '@remixicon/react';
import styles from './CollectionForm.module.css';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const formToRequest = (
  form: CollectionFormData,
  images: number[],
): CollectionRequest => {
  return {
    ...form,
    images,
    entities: form.entities?.map(stringifyEntityRef),
    users: form.users?.map(stringifyEntityRef),
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
    tags: [],
    entities: [],
    users: [],
  };
};

const getValues = async (
  api: QetaApi,
  catalogApi: CatalogApi,
  id?: string,
): Promise<{ form: CollectionFormData; collection?: CollectionResponse }> => {
  if (!id) {
    return { form: getDefaultValues() };
  }

  const collection = await api.getCollection(id);

  const entities =
    collection.entities && collection.entities.length > 0
      ? await catalogApi.getEntitiesByRefs({
          entityRefs: collection.entities,
          fields: [
            'kind',
            'metadata.name',
            'metadata.namespace',
            'metadata.title',
            'metadata.description',
            'spec.profile.displayName',
            'spec.type',
          ],
        })
      : [];

  const users =
    collection.users && collection.users.length > 0
      ? await catalogApi.getEntitiesByRefs({
          entityRefs: collection.users,
          fields: [
            'kind',
            'metadata.name',
            'metadata.namespace',
            'metadata.title',
            'metadata.description',
            'spec.profile.displayName',
            'spec.type',
          ],
        })
      : [];

  return {
    form: {
      title: collection.title,
      description: collection.description,
      headerImage: collection.headerImage,
      images: collection.images,
      tags: collection.tags || [],
      entities: 'items' in entities ? compact(entities.items) : [],
      users: 'items' in users ? compact(users.items) : [],
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
  const toastApi = useApi(toastApiRef);

  const qetaApi = useApi(qetaApiRef);
  const catalogApi = useApi(catalogApiRef);
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
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
          toastApi.post({
            title: t('collectionForm.errorPosting'),
            status: 'warning',
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
        toastApi.post({
          title: t('collectionForm.errorPosting'),
          status: 'warning',
        });
      })
      .finally(() => setPosting(false));
  };

  useEffect(() => {
    if (id) {
      getValues(qetaApi, catalogApi, id)
        .catch(e => {
          toastApi.post({
            title: e.message,
            status: 'warning',
          });
        })
        .then(data => {
          if (data) {
            setValues(data.form);
            setImages(data.form.images);
          }
        });
    }
  }, [qetaApi, id, toastApi, catalogApi]);

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

  const handleTitleChange = (value: string) => {
    setTitleCharCount(value.length);
    setValue('title', value, { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit(postQuestion)}
      onChange={() => {
        setEdited(true);
      }}
    >
      {error && (
        <Alert
          status="danger"
          icon
          description={t('collectionForm.errorPosting')}
        />
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
      <Box mb="4">
        <TextField
          id="title"
          name="title"
          label={t('collectionForm.titleInput.label')}
          className="qetaCollectionFormTitle"
          isRequired
          isInvalid={'title' in errors}
          description={t('collectionForm.titleInput.helperText')}
          secondaryLabel={`${titleCharCount}/255`}
          value={control._formValues.title}
          onChange={handleTitleChange}
          maxLength={255}
        />
      </Box>
      <Flex mb="2" align="center" justify="between">
        <Flex align="center" gap="1">
          <Text variant="body-medium" weight="bold">
            {t('collectionForm.descriptionInput.label')}
          </Text>
          <TooltipTrigger>
            <ButtonIcon
              aria-label="Tips for a good collection"
              size="small"
              variant="tertiary"
              icon={
                showTips ? (
                  <RiArrowUpSLine size={16} />
                ) : (
                  <RiArrowDownSLine size={16} />
                )
              }
              onPress={() => setShowTips(v => !v)}
            />
            <Tooltip>Tips for a good collection</Tooltip>
          </TooltipTrigger>
        </Flex>
        <Link
          href="https://www.markdownguide.org/cheat-sheet/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.markdownHelpLink}
        >
          {t('collectionForm.descriptionInput.markdownHelp')}
          <RiInformationLine size={12} className={styles.markdownHelpIcon} />
        </Link>
      </Flex>
      {showTips && (
        <Box mb="4" p="4" className={styles.tipsBox}>
          <Text variant="body-small" as="div">
            <ul className={styles.tipsList}>
              <li>{t('collectionForm.tips_1')}</li>
              <li>{t('collectionForm.tips_2')}</li>
              <li>{t('collectionForm.tips_3')}</li>
            </ul>
          </Text>
        </Box>
      )}
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
      <Box mt="6" mb="2">
        <Text variant="title-small">
          {t('collectionForm.automaticRules.title')}
        </Text>
        <Text variant="body-small" color="secondary">
          {t('collectionForm.automaticRules.description')}
        </Text>
      </Box>
      <Box mt="2" mb="2">
        <Controller
          control={control}
          render={({ field, fieldState: { error: entityError } }) => (
            <EntitiesInput
              {...field}
              error={entityError}
              tags={watch('tags')}
              label={t('collectionForm.automaticEntitiesInput.label')}
            />
          )}
          name="entities"
        />
      </Box>
      <Box mt="2" mb="2">
        <Controller
          control={control}
          render={({ field, fieldState: { error: tagError } }) => {
            return (
              <TagInput
                {...field}
                error={tagError}
                entities={watch('entities')?.map(stringifyEntityRef)}
                label={t('collectionForm.automaticTagsInput.label')}
              />
            );
          }}
          name="tags"
        />
      </Box>
      <Box mt="2" mb="2">
        <Controller
          control={control}
          render={({ field, fieldState: { error: userError } }) => (
            <EntitiesInput
              {...field}
              error={userError}
              label={t('collectionForm.automaticUsersInput.label')}
              kind={['User']}
            />
          )}
          name="users"
        />
      </Box>
      <Box mt="6">
        <Button
          type="submit"
          variant="primary"
          isDisabled={posting || isSubmitting}
          isPending={posting}
        >
          {posting
            ? t('collectionForm.submitting')
            : t(
                id
                  ? 'collectionForm.submit.existingCollection'
                  : 'collectionForm.submit.newCollection',
              )}
        </Button>
      </Box>
    </form>
  );
};
