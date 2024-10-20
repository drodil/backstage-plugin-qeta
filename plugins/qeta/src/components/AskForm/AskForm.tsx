import {
  configApiRef,
  useAnalytics,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import { Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PostRequest,
  PostResponse,
  QetaApi,
} from '@drodil/backstage-plugin-qeta-common';
import { useStyles, useTranslation } from '../../utils/hooks';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/catalog-client';
import { compact } from 'lodash';
import { TagInput } from './TagInput';
import { QuestionForm } from './types';
import { EntitiesInput } from './EntitiesInput';
import {
  qetaApiRef,
  questionRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import { AskAnonymouslyCheckbox } from '../AskAnonymouslyCheckbox/AskAnonymouslyCheckbox';
import { confirmNavigationIfEdited } from '../../utils/utils';

const formToRequest = (form: QuestionForm, images: number[]): PostRequest => {
  return {
    ...form,
    entities: form.entities?.map(stringifyEntityRef),
    images,
    type: 'question',
  };
};

export type AskFormProps = {
  id?: string;
  entity?: string;
  tags?: string[];
  onPost?: (question: PostResponse) => void;
  entityPage?: boolean;
};

const getDefaultValues = (props: AskFormProps): QuestionForm => {
  return {
    title: '',
    content: '',
    tags: props.tags ?? [],
    entities: [],
  };
};

const getValues = async (
  api: QetaApi,
  catalogApi: CatalogApi,
  id?: string,
): Promise<QuestionForm> => {
  if (!id) {
    return getDefaultValues({});
  }

  const question = await api.getPost(id);
  const entities =
    question.entities && question.entities.length > 0
      ? await catalogApi.getEntitiesByRefs({
          entityRefs: question.entities,
          fields: [
            'kind',
            'metadata.name',
            'metadata.namespace',
            'metadata.title',
          ],
        })
      : [];
  return {
    title: question.title,
    content: question.content,
    tags: question.tags ?? [],
    entities: 'items' in entities ? compact(entities.items) : [],
  };
};

export const AskForm = (props: AskFormProps) => {
  const { id, entity, onPost, entityPage } = props;
  const questionRoute = useRouteRef(questionRouteRef);
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const [entityRef, setEntityRef] = React.useState(entity);
  const [posting, setPosting] = React.useState(false);
  const [values, setValues] = React.useState(getDefaultValues(props));
  const [error, setError] = React.useState(false);
  const [edited, setEdited] = React.useState(false);

  const [images, setImages] = React.useState<number[]>([]);
  const [searchParams, _setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const qetaApi = useApi(qetaApiRef);
  const catalogApi = useApi(catalogApiRef);
  const configApi = useApi(configApiRef);
  const allowAnonymouns = configApi.getOptionalBoolean('qeta.allowAnonymous');
  const styles = useStyles();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<QuestionForm>({
    values,
    defaultValues: getDefaultValues(props),
  });

  const postQuestion = (data: QuestionForm) => {
    setPosting(true);

    const queryParams = new URLSearchParams();
    if (entity) {
      queryParams.set('entity', entity);
    }
    if (entityPage) {
      queryParams.set('entityPage', 'true');
    }

    if (id) {
      qetaApi
        .updatePost(id, formToRequest(data, images))
        .then(q => {
          if (!q || !q.id) {
            setError(true);
            return;
          }
          setEdited(false);
          reset();
          analytics.captureEvent('edit', 'question');
          if (onPost) {
            onPost(q);
          } else if (entity) {
            navigate(
              `${questionRoute({
                id: q.id.toString(10),
              })}?${queryParams.toString()}`,
            );
          } else {
            navigate(questionRoute({ id: q.id.toString(10) }));
          }
        })
        .catch(_e => {
          setError(true);
          setPosting(false);
        });
      return;
    }
    qetaApi
      .createPost(formToRequest(data, images))
      .then(q => {
        if (!q || !q.id) {
          setError(true);
          return;
        }
        setEdited(false);
        analytics.captureEvent('post', 'question');
        reset();
        if (entity) {
          navigate(
            `${questionRoute({
              id: q.id.toString(10),
            })}?${queryParams.toString()}`,
          );
        } else {
          navigate(questionRoute({ id: q.id.toString(10) }));
        }
      })
      .catch(_e => {
        setError(true);
        setPosting(false);
      });
  };

  useEffect(() => {
    if (!entityRef) {
      const e = searchParams.get('entity');
      if (e) {
        setEntityRef(e);
      }
    }
  }, [entityRef, searchParams]);

  useEffect(() => {
    if (id) {
      getValues(qetaApi, catalogApi, id).then(data => {
        setValues(data);
      });
    }
  }, [qetaApi, catalogApi, id]);

  useEffect(() => {
    if (entityRef) {
      catalogApi.getEntityByRef(entityRef).then(data => {
        if (data) {
          setValues(v => {
            return { ...v, entities: [data] };
          });
        }
      });
    }
  }, [catalogApi, entityRef]);

  useEffect(() => {
    reset(values);
  }, [values, reset]);

  useEffect(() => {
    return confirmNavigationIfEdited(edited);
  }, [edited]);

  return (
    <form
      onSubmit={handleSubmit(postQuestion)}
      onChange={() => {
        setEdited(true);
      }}
      className="qetaAskForm"
    >
      {error && <Alert severity="error">{t('askForm.errorPosting')}</Alert>}
      <TextField
        label="Title"
        className="qetaAskFormTitle"
        required
        fullWidth
        error={'title' in errors}
        margin="normal"
        variant="outlined"
        helperText={t('askForm.titleInput.helperText')}
        {
          // @ts-ignore
          ...register('title', { required: true, maxLength: 255 })
        }
      />
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => (
          <MarkdownEditor
            value={value}
            onChange={onChange}
            height={400}
            error={'content' in errors}
            placeholder={t('askForm.contentInput.placeholder')}
            config={configApi}
            onImageUpload={(imageId: number) => {
              setImages(prevImages => [...prevImages, imageId]);
            }}
          />
        )}
        name="content"
      />
      <TagInput control={control} />
      <EntitiesInput control={control} entityRef={entityRef} />
      {allowAnonymouns && !id && (
        <AskAnonymouslyCheckbox
          control={control}
          label={t('anonymousCheckbox.askAnonymously')}
        />
      )}
      <Button
        color="primary"
        type="submit"
        variant="contained"
        disabled={posting}
        className={`qetaAskFormSubmitBtn ${styles.postButton}`}
      >
        {id
          ? t('askForm.submit.existingQuestion')
          : t('askForm.submit.newQuestion')}
      </Button>
    </form>
  );
};
