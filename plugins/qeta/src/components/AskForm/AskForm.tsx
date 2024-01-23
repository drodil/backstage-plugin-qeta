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
  QuestionRequest,
  QuestionResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useStyles } from '../../utils/hooks';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/catalog-client';
import { compact } from 'lodash';
import { TagInput } from './TagInput';
import { QuestionForm } from './types';
import { EntitiesInput } from './EntitiesInput';
import { questionRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { AskAnonymouslyCheckbox } from '../AskAnonymouslyCheckbox/AskAnonymouslyCheckbox';
import { QetaApi, qetaApiRef } from '../../api';

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
  entityPage?: boolean;
}) => {
  const { id, entity, onPost, entityPage } = props;
  const questionRoute = useRouteRef(questionRouteRef);
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const [entityRef, setEntityRef] = React.useState(entity);
  const [posting, setPosting] = React.useState(false);
  const [values, setValues] = React.useState(getDefaultValues());
  const [error, setError] = React.useState(false);

  const [images, setImages] = React.useState<number[]>([]);
  const [searchParams, _setSearchParams] = useSearchParams();

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
    defaultValues: getDefaultValues(),
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
      .postQuestion(formToRequest(data, images))
      .then(q => {
        if (!q || !q.id) {
          setError(true);
          return;
        }
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
      {allowAnonymouns && !id && (
        <AskAnonymouslyCheckbox control={control} label="Ask anonymously" />
      )}
      <Button
        color="primary"
        type="submit"
        variant="contained"
        disabled={posting}
        className={`qetaAskFormSubmitBtn ${styles.postButton}`}
      >
        {id ? 'Save' : 'Post'}
      </Button>
    </form>
  );
};
