import { configApiRef, useAnalytics, useApi } from '@backstage/core-plugin-api';
import { Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  QetaApi,
  qetaApiRef,
  QuestionRequest,
  QuestionResponse,
} from '../../api';
import { useBasePath, useStyles } from '../../utils/hooks';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/catalog-client';
import { compact } from 'lodash';
import { TagInput } from './TagInput';
import { QuestionForm } from './types';
import { EntitiesInput } from './EntitiesInput';

const formToRequest = (
  form: QuestionForm,
  images: number[],
): QuestionRequest => {
  return {
    ...form,
    entities: form.entities?.map(stringifyEntityRef),
    images,
  };
};

const getDefaultValues = (): QuestionForm => {
  return {
    title: '',
    content: '',
    tags: [],
    entities: [],
  };
};

const getValues = async (
  api: QetaApi,
  catalogApi: CatalogApi,
  id?: string,
): Promise<QuestionForm> => {
  if (!id) {
    return getDefaultValues();
  }

  const question = await api.getQuestion(id);
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

export const AskForm = (props: {
  id?: string;
  entity?: string;
  onPost?: (question: QuestionResponse) => void;
}) => {
  const { id, entity, onPost } = props;
  const base_path = useBasePath();
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const [entityRef, setEntityRef] = React.useState(entity);
  const [values, setValues] = React.useState(getDefaultValues());
  const [error, setError] = React.useState(false);

  const [images, setImages] = React.useState<number[]>([]);
  const [searchParams, _setSearchParams] = useSearchParams();

  const qetaApi = useApi(qetaApiRef);
  const catalogApi = useApi(catalogApiRef);
  const configApi = useApi(configApiRef);
  const styles = useStyles();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<QuestionForm>({
    values,
    defaultValues: getDefaultValues(),
  });

  const postQuestion = (data: QuestionForm) => {
    if (id) {
      qetaApi
        .updateQuestion(id, formToRequest(data, images))
        .then(q => {
          if (!q || !q.id) {
            setError(true);
            return;
          }
          reset();
          analytics.captureEvent('edit', 'question');
          if (onPost) {
            onPost(q);
          } else if (entity) {
            navigate(`${base_path}/qeta/questions/${q.id}?entity=${entity}`);
          } else {
            navigate(`${base_path}/qeta/questions/${q.id}`);
          }
        })
        .catch(_e => setError(true));
      return;
    }
    qetaApi
      .postQuestion(formToRequest(data, images))
      .then(q => {
        if (!q || !q.id) {
          setError(true);
          return;
        }
        analytics.captureEvent('post', 'question');
        reset();
        if (entity) {
          navigate(`${base_path}/qeta/questions/${q.id}?entity=${entity}`);
        } else {
          navigate(`${base_path}/qeta/questions/${q.id}`);
        }
      })
      .catch(_e => setError(true));
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

  return (
    <form onSubmit={handleSubmit(postQuestion)} className="qetaAskForm">
      {error && <Alert severity="error">Could not post question</Alert>}
      <TextField
        label="Title"
        className="qetaAskFormTitle"
        required
        fullWidth
        error={'title' in errors}
        margin="normal"
        variant="outlined"
        helperText="Write good title for your question that people can understand"
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
            placeholder="Your question"
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
      <Button
        color="primary"
        type="submit"
        variant="contained"
        className={`qetaAskFormSubmitBtn ${styles.postButton}`}
      >
        {id ? 'Save' : 'Post'}
      </Button>
    </form>
  );
};
