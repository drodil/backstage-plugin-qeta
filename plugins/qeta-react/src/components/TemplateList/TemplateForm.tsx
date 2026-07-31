import { useEffect, useState } from 'react';
import { useIsModerator } from '../../hooks';
import { QetaApi, TemplateRequest } from '@drodil/backstage-plugin-qeta-common';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { Controller, useForm } from 'react-hook-form';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/catalog-client';
import { compact } from 'lodash';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { TagInput } from '../PostForm/TagInput';
import { EntitiesInput } from '../PostForm/EntitiesInput';
import { TemplateFormValues } from '../PostForm/types';
import { Alert, Box, Button, TextField } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const formToRequest = (form: TemplateFormValues): TemplateRequest => {
  return {
    ...form,
    entities: form.entities?.map(stringifyEntityRef),
  };
};

const getDefaultValues = (): TemplateFormValues => {
  return {
    title: '',
    description: '',
    tags: [],
    entities: [],
  };
};

const getValues = async (
  api: QetaApi,
  catalogApi: CatalogApi,
  id?: string,
): Promise<TemplateFormValues> => {
  if (!id) {
    return getDefaultValues();
  }

  const template = await api.getTemplate(id);
  const entities =
    template.entities && template.entities.length > 0
      ? await catalogApi.getEntitiesByRefs({
          entityRefs: template.entities,
          fields: [
            'kind',
            'metadata.name',
            'metadata.namespace',
            'metadata.title',
          ],
        })
      : [];
  return {
    title: template.title,
    description: template.description,
    questionTitle: template.questionTitle,
    questionContent: template.questionContent,
    tags: template.tags ?? [],
    entities: 'items' in entities ? compact(entities.items) : [],
  };
};

export const TemplateForm = (props: { id?: number; onPost: () => void }) => {
  const { id, onPost } = props;
  const [posting, setPosting] = useState(false);
  const catalogApi = useApi(catalogApiRef);
  const qetaApi = useApi(qetaApiRef);
  const toastApi = useApi(toastApiRef);
  const [error, setError] = useState(false);
  const [values, setValues] = useState(getDefaultValues());
  const { isModerator } = useIsModerator();
  const { t } = useTranslationRef(qetaTranslationRef);
  const {
    handleSubmit,
    control,
    getValues: getFormValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    values,
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (id) {
      getValues(qetaApi, catalogApi, id.toString(10))
        .catch(e => {
          toastApi.post({
            title: e.message,
            status: 'warning',
          });
        })
        .then(data => {
          if (data) {
            setValues(data);
          }
        });
    }
  }, [qetaApi, catalogApi, id, toastApi]);

  const postTemplate = (data: TemplateFormValues) => {
    setPosting(true);

    if (id) {
      qetaApi
        .updateTemplate(id, formToRequest(data))
        .then(_q => {
          reset();
          onPost();
        })
        .catch(e => {
          setError(true);
          toastApi.post({
            title: e.message,
            status: 'warning',
          });
        })
        .finally(() => setPosting(false));
      return;
    }
    qetaApi
      .createTemplate(formToRequest(data))
      .then(q => {
        if (!q || !q.id) {
          setError(true);
          return;
        }
        reset();
        onPost();
      })
      .catch(e => {
        setError(true);
        toastApi.post({
          title: e.message,
          status: 'warning',
        });
      })
      .finally(() => setPosting(false));
  };

  if (!isModerator) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(postTemplate)}>
      {error && (
        <Alert status="danger" description={t('templateList.errorPosting')} />
      )}
      <Box mb="4">
        <TextField
          id="title"
          label={t('templateList.titleInput.label')}
          className="qetaTemplateFormTitle"
          isRequired
          isInvalid={'title' in errors}
          description={t('templateList.titleInput.helperText')}
          value={control._formValues.title ?? ''}
          onChange={value => setValue('title', value, { shouldValidate: true })}
          maxLength={255}
        />
      </Box>

      <Box mb="4">
        <TextField
          id="description"
          label={t('templateList.descriptionInput.label')}
          className="qetaTemplateFormDescription"
          isRequired
          isInvalid={'description' in errors}
          description={t('templateList.descriptionInput.helperText')}
          value={control._formValues.description ?? ''}
          onChange={value =>
            setValue('description', value, { shouldValidate: true })
          }
          maxLength={255}
        />
      </Box>

      <Box mb="4">
        <TextField
          id="questionTitle"
          label={t('templateList.questionTitleInput.label')}
          className="qetaTemplateFormQuestionTitle"
          isInvalid={'questionTitle' in errors}
          description={t('templateList.questionTitleInput.helperText')}
          value={control._formValues.questionTitle ?? ''}
          onChange={value =>
            setValue('questionTitle', value, { shouldValidate: true })
          }
          maxLength={255}
        />
      </Box>

      <Controller
        control={control}
        rules={{}}
        render={({ field: { onChange, value } }) => (
          <MarkdownEditor
            value={value ?? ''}
            disableAttachments
            onChange={onChange}
            height={400}
            error={'questionContent' in errors}
            placeholder={t('templateList.questionContentInput.placeholder')}
            onTagsChange={tags => {
              const existing = getFormValues('tags') ?? [];
              const newTags = [...new Set([...existing, ...tags])];
              setValue('tags', newTags, { shouldValidate: true });
            }}
          />
        )}
        name="questionContent"
      />
      <Controller
        control={control}
        render={({
          field: { onChange, value },
          fieldState: { error: tagError },
        }) => <TagInput value={value} onChange={onChange} error={tagError} />}
        name="tags"
      />
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <EntitiesInput value={value} onChange={onChange} />
        )}
        name="entities"
      />
      <Button variant="primary" type="submit" isDisabled={posting}>
        {id
          ? t('templateList.submit.existingTemplate')
          : t('templateList.submit.newTemplate')}
      </Button>
    </form>
  );
};
