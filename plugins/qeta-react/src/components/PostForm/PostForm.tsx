import {
  configApiRef,
  useAnalytics,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import React, { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PostRequest,
  PostResponse,
  PostType,
  QetaApi,
  Template,
} from '@drodil/backstage-plugin-qeta-common';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/catalog-client';
import { compact } from 'lodash';
import { TagInput } from './TagInput';
import { QuestionFormValues } from './types';
import { EntitiesInput } from './EntitiesInput';
import { articleRouteRef, questionRouteRef } from '../../routes';
import { PostAnonymouslyCheckbox } from '../PostAnonymouslyCheckbox/PostAnonymouslyCheckbox';
import { confirmNavigationIfEdited } from '../../utils/utils';
import { qetaApiRef } from '../../api';
import { HeaderImageInput } from '../HeaderImageInput/HeaderImageInput';
import { useFormStyles } from '../../hooks/useFormStyles';
import { useTranslation } from '../../hooks';

const formToRequest = (
  form: QuestionFormValues,
  images: number[],
): PostRequest => {
  return {
    ...form,
    entities: form.entities?.map(stringifyEntityRef),
    images: images,
  };
};

export type PostFormProps = {
  type: PostType;
  id?: string;
  entity?: string;
  tags?: string[];
  onPost?: (question: PostResponse) => void;
  entityPage?: boolean;
  template?: Template | null;
  onFormChange?: (data: QuestionFormValues) => void;
};

const getDefaultValues = (props: PostFormProps): QuestionFormValues => {
  if (props.template) {
    return {
      title: props.template.questionTitle ?? '',
      content: props.template.questionContent ?? '',
      tags: props.template.tags ?? [],
      entities: [],
      type: props.type,
      images: [],
    };
  }

  return {
    title: '',
    content: '',
    tags: props.tags ?? [],
    entities: [],
    type: props.type,
    images: [],
  };
};

const getValues = async (
  api: QetaApi,
  catalogApi: CatalogApi,
  type: PostType,
  id?: string,
): Promise<QuestionFormValues> => {
  if (!id) {
    return getDefaultValues({ type });
  }

  const post = await api.getPost(id);
  const entities =
    post.entities && post.entities.length > 0
      ? await catalogApi.getEntitiesByRefs({
          entityRefs: post.entities,
          fields: [
            'kind',
            'metadata.name',
            'metadata.namespace',
            'metadata.title',
          ],
        })
      : [];
  return {
    title: post.title,
    content: post.content,
    tags: post.tags ?? [],
    entities: 'items' in entities ? compact(entities.items) : [],
    type,
    headerImage: post.headerImage,
    images: post.images,
  };
};

export const PostForm = (props: PostFormProps) => {
  const { id, entity, onPost, entityPage, type, template, onFormChange } =
    props;
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
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
  const styles = useFormStyles();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    values,
    defaultValues: getDefaultValues(props),
  });

  const postQuestion = (data: QuestionFormValues) => {
    setPosting(true);
    const route = type === 'question' ? questionRoute : articleRoute;

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
          analytics.captureEvent('edit', type);
          if (onPost) {
            onPost(q);
          } else if (entity) {
            navigate(
              `${route({
                id: q.id.toString(10),
              })}?${queryParams.toString()}`,
            );
          } else {
            navigate(route({ id: q.id.toString(10) }));
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
        analytics.captureEvent('post', type);
        reset();
        if (entity) {
          navigate(
            `${route({
              id: q.id.toString(10),
            })}?${queryParams.toString()}`,
          );
        } else {
          navigate(route({ id: q.id.toString(10) }));
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
      getValues(qetaApi, catalogApi, type, id).then(data => {
        setValues(data);
        setImages(data.images);
      });
    }
  }, [qetaApi, catalogApi, type, id]);

  useEffect(() => {
    if (entityRef) {
      catalogApi.getEntityByRef(entityRef).then(data => {
        if (data) {
          setValues(v => {
            return { ...v, entities: [...(v.entities ?? []), data] };
          });
        }
      });
    }
  }, [catalogApi, entityRef]);

  useEffect(() => {
    if (template && template.entities && template.entities.length > 0) {
      catalogApi
        .getEntitiesByRefs({ entityRefs: template.entities })
        .then(data => {
          setValues(v => {
            return {
              ...v,
              entities: compact([...(v.entities ?? []), ...data.items]),
            };
          });
        });
    }
  }, [catalogApi, template]);

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
        onFormChange?.(control._formValues as QuestionFormValues);
      }}
      className={`${styles.form} qetaAskForm`}
    >
      {error && (
        <Alert severity="error">{t('postForm.errorPosting', { type })}</Alert>
      )}
      {type === 'article' && (
        <HeaderImageInput
          onChange={(url?: string) =>
            setValues(v => ({ ...v, headerImage: url }))
          }
          onImageUpload={onImageUpload}
          url={values.headerImage}
          postId={id ? Number(id) : undefined}
        />
      )}
      <TextField
        label="Title"
        className="qetaAskFormTitle"
        required
        fullWidth
        error={'title' in errors}
        margin="normal"
        variant="outlined"
        helperText={t('postForm.titleInput.helperText', { type })}
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
            placeholder={t('postForm.contentInput.placeholder', { type })}
            config={configApi}
            onImageUpload={onImageUpload}
            postId={id ? Number(id) : undefined}
          />
        )}
        name="content"
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
          <EntitiesInput
            value={value}
            onChange={onChange}
            singleValue={entityRef}
          />
        )}
        name="entities"
      />
      {allowAnonymouns && !id && (
        <PostAnonymouslyCheckbox
          control={control}
          label={t('anonymousCheckbox.postAnonymously')}
        />
      )}
      <Button
        color="primary"
        type="submit"
        variant="contained"
        disabled={posting}
        className={`qetaAskFormSubmitBtn ${styles.postButton}`}
      >
        {id ? t('postForm.submit.existingPost') : t('postForm.submit.newPost')}
      </Button>
    </form>
  );
};
