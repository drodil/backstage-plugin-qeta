import {
  configApiRef,
  useAnalytics,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useCallback, useEffect, useState } from 'react';
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
import { useConfirmNavigationIfEdited } from '../../utils/utils';
import { qetaApiRef } from '../../api';
import { HeaderImageInput } from '../HeaderImageInput/HeaderImageInput';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import InfoIcon from '@material-ui/icons/Info';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import HelpIcon from '@material-ui/icons/Help';

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
    images: post.images ?? [],
  };
};

export const PostForm = (props: PostFormProps) => {
  const { id, entity, onPost, entityPage, type, template, onFormChange } =
    props;
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const [entityRef, setEntityRef] = useState(entity);
  const [posting, setPosting] = useState(false);
  const [values, setValues] = useState(getDefaultValues(props));
  const [error, setError] = useState(false);
  const [edited, setEdited] = useState(false);

  const [images, setImages] = useState<number[]>([]);
  const [searchParams, _setSearchParams] = useSearchParams();
  const { t } = useTranslationRef(qetaTranslationRef);

  const qetaApi = useApi(qetaApiRef);
  const catalogApi = useApi(catalogApiRef);
  const configApi = useApi(configApiRef);
  const allowAnonymouns = configApi.getOptionalBoolean('qeta.allowAnonymous');
  const minEntities = configApi.getOptionalNumber('qeta.entities.min') ?? 0;
  const minTags = configApi.getOptionalNumber('qeta.tags.min') ?? 0;

  const {
    handleSubmit,
    control,
    reset,
    getValues: getFormValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    values,
    defaultValues: getDefaultValues(props),
  });

  const [showTips, setShowTips] = useState(false);
  const [titleCharCount, setTitleCharCount] = useState(values.title.length);

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
        onFormChange?.(control._formValues as QuestionFormValues);
      }}
    >
      {error && (
        <Alert severity="error">{t('postForm.errorPosting', { type })}</Alert>
      )}
      {type === 'article' && (
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <HeaderImageInput
              onChange={onChange}
              onImageUpload={onImageUpload}
              url={value}
              postId={id ? Number(id) : undefined}
            />
          )}
          name="headerImage"
        />
      )}
      <Box mb={2}>
        <TextField
          label={t('postForm.titleInput.label')}
          className="qetaAskFormTitle"
          required
          fullWidth
          error={'title' in errors}
          margin="normal"
          variant="outlined"
          name="title"
          helperText={
            <span>
              {t('postForm.titleInput.helperText', { type })}{' '}
              <span style={{ float: 'right' }}>{titleCharCount}/255</span>
            </span>
          }
          placeholder={t('postForm.titleInput.placeholder')}
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
          {t('postForm.contentInput.label', { type })}
          <Tooltip title="Tips for a good question">
            <IconButton size="small" onClick={() => setShowTips(v => !v)}>
              {showTips ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Typography>
        <Box>
          <a
            href="https://www.markdownguide.org/cheat-sheet/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12 }}
          >
            {t('postForm.contentInput.markdownHelp')}
          </a>
          <HelpIcon
            fontSize="small"
            style={{ marginLeft: 4, verticalAlign: 'middle' }}
          />
        </Box>
      </Box>
      <Collapse in={showTips}>
        <Box mb={2} p={2}>
          <Typography variant="body2">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {type === 'article' ? (
                <>
                  <li>{t('postForm.tips_article_1')}</li>
                  <li>{t('postForm.tips_article_2')}</li>
                  <li>{t('postForm.tips_article_3')}</li>
                  <li>{t('postForm.tips_article_4')}</li>
                </>
              ) : (
                <>
                  <li>{t('postForm.tips_question_1')}</li>
                  <li>{t('postForm.tips_question_2')}</li>
                  <li>{t('postForm.tips_question_3')}</li>
                  <li>{t('postForm.tips_question_4')}</li>
                </>
              )}
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
            value={value}
            onChange={onChange}
            height={400}
            error={'content' in errors}
            placeholder={
              type === 'article'
                ? t('postForm.contentInput.placeholder_article')
                : t('postForm.contentInput.placeholder_question')
            }
            onImageUpload={onImageUpload}
            postId={id ? Number(id) : undefined}
            onTagsChange={tags => {
              if (tags && tags.length > 0) {
                const existing = getFormValues('tags') ?? [];
                const newTags = [...new Set([...existing, ...tags])];
                setValue('tags', newTags, { shouldValidate: true });
              }
            }}
          />
        )}
        name="content"
      />
      <Box mt={1} mb={1}>
        <Controller
          control={control}
          rules={{
            validate: value => {
              if (minEntities > 0 && value && value.length < minEntities) {
                return t('entitiesInput.minimumError', {
                  min: minEntities.toString(),
                });
              }
              return true;
            },
          }}
          render={({ field, fieldState: { error: entityError } }) => (
            <EntitiesInput
              {...field}
              singleValue={entityRef}
              error={entityError}
            />
          )}
          name="entities"
        />
      </Box>
      <Box mt={1} mb={1}>
        <Controller
          control={control}
          rules={{
            validate: value => {
              if (minTags > 0 && value && value.length < minTags) {
                return t('tagsInput.minimumError', { min: minTags.toString() });
              }
              return true;
            },
          }}
          render={({ field, fieldState: { error: tagError } }) => {
            return (
              <TagInput
                {...field}
                error={tagError}
                title={getFormValues('title')}
                content={getFormValues('content')}
              />
            );
          }}
          name="tags"
        />
      </Box>
      {allowAnonymouns && !id && (
        <Box mt={2} mb={2} display="flex" alignItems="center">
          <PostAnonymouslyCheckbox
            control={control}
            label={t('anonymousCheckbox.postAnonymously')}
          />
          <Tooltip title={t('anonymousCheckbox.tooltip')}>
            <InfoIcon fontSize="small" style={{ marginLeft: 4 }} />
          </Tooltip>
        </Box>
      )}
      <Box mt={3}>
        <Button
          color="primary"
          type="submit"
          variant="contained"
          disabled={posting || isSubmitting}
          size="large"
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {posting ? (
            <span>
              {t('postForm.submitting')}{' '}
              <span className="spinner-border spinner-border-sm" />
            </span>
          ) : id ? (
            t('postForm.submit.existingPost')
          ) : (
            t('postForm.submit.newPost')
          )}
        </Button>
      </Box>
    </form>
  );
};
