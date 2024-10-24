import {
  configApiRef,
  useAnalytics,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import { Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PostRequest,
  PostResponse,
  PostType,
  QetaApi,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslation } from '../../utils';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/catalog-client';
import { compact } from 'lodash';
import { TagInput } from './TagInput';
import { QuestionForm } from './types';
import { EntitiesInput } from './EntitiesInput';
import { articleRouteRef, questionRouteRef } from '../../routes';
import { PostAnonymouslyCheckbox } from '../PostAnonymouslyCheckbox/PostAnonymouslyCheckbox';
import { confirmNavigationIfEdited } from '../../utils/utils';
import { qetaApiRef } from '../../api';
import { useFormStyles } from '../../utils/hooks';
import { HeaderImageInput } from '../HeaderImageInput/HeaderImageInput';

const formToRequest = (form: QuestionForm, images: number[]): PostRequest => {
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
};

const getDefaultValues = (props: PostFormProps): QuestionForm => {
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
): Promise<QuestionForm> => {
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

export type QetaPostFormClassKey = 'headerImage' | 'postButton' | 'postForm';

export const PostForm = (props: PostFormProps) => {
  const { id, entity, onPost, entityPage, type } = props;
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
  } = useForm<QuestionForm>({
    values,
    defaultValues: getDefaultValues(props),
  });

  const postQuestion = (data: QuestionForm) => {
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
      <TagInput control={control} />
      <EntitiesInput control={control} entityRef={entityRef} />
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
