import {
  alertApiRef,
  configApiRef,
  useAnalytics,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Collapse,
  FormControlLabel,
  IconButton,
  Link,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PostRequest,
  PostResponse,
  PostStatus,
  PostType,
  QetaApi,
  selectByPostType,
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
import { articleRouteRef, linkRouteRef, questionRouteRef } from '../../routes';
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
import { useDebounce } from 'react-use';
import { useIdentityApi, useIsModerator } from '../../hooks';

const formToRequest = (
  form: QuestionFormValues,
  images: number[],
): PostRequest => {
  return {
    ...form,
    entities: form.entities?.map(stringifyEntityRef),
    author: form.author ? stringifyEntityRef(form.author) : undefined,
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
  title?: string;
  content?: string;
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
    title: props.title ?? '',
    content: props.content ?? '',
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
  const authorEntity = await catalogApi.getEntityByRef(post.author);

  const entities =
    post.entities && post.entities.length > 0
      ? await catalogApi.getEntitiesByRefs({
          entityRefs: post.entities,
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
    title: post.title,
    content: post.content,
    author: authorEntity,
    tags: post.tags ?? [],
    entities: 'items' in entities ? compact(entities.items) : [],
    type,
    headerImage: post.headerImage,
    url: post.url,
    images: post.images ?? [],
    status: post.status,
  };
};

export const PostForm = (props: PostFormProps) => {
  const { id, entity, onPost, entityPage, type, template, onFormChange } =
    props;
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);
  const navigate = useNavigate();
  const { value: identity } = useIdentityApi(
    api => api.getBackstageIdentity(),
    [],
  );

  const { isModerator } = useIsModerator();
  const analytics = useAnalytics();
  const [entityRef, setEntityRef] = useState(entity);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState(getDefaultValues(props));
  const [error, setError] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [edited, setEdited] = useState(false);
  const [draftId, setDraftId] = useState<string | undefined>(id);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    const saved = localStorage.getItem('qeta-auto-save-enabled');
    try {
      return saved ? JSON.parse(saved) : false;
    } catch (_) {
      localStorage.removeItem('qeta-auto-save-enabled');
      return false;
    }
  });
  const [images, setImages] = useState<number[]>([]);
  const [status, setStatus] = useState<PostStatus>('draft');
  const [searchParams, _setSearchParams] = useSearchParams();
  const [urlToCheck, setUrlToCheck] = useState('');
  const validUrl = /^https?:\/\/\S+$/;
  const [favicon, setFavicon] = useState<string | undefined>(undefined);
  const { t } = useTranslationRef(qetaTranslationRef);

  const qetaApi = useApi(qetaApiRef);
  const catalogApi = useApi(catalogApiRef);
  const configApi = useApi(configApiRef);
  const alertApi = useApi(alertApiRef);
  const allowAnonymouns = configApi.getOptionalBoolean('qeta.allowAnonymous');
  const minEntities = configApi.getOptionalNumber('qeta.entities.min') ?? 0;
  const minTags = configApi.getOptionalNumber('qeta.tags.min') ?? 0;

  const isLink = type === 'link';

  const {
    handleSubmit,
    control,
    reset,
    getValues: getFormValues,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<QuestionFormValues>({
    values,
    defaultValues: getDefaultValues(props),
  });

  const postQuestion = useCallback(
    (data: QuestionFormValues, autoSave: boolean = false) => {
      setPosting(true);
      const route = selectByPostType(
        type,
        questionRoute,
        articleRoute,
        linkRoute,
      );

      const queryParams = new URLSearchParams();
      if (entity) {
        queryParams.set('entity', entity);
      }
      if (entityPage) {
        queryParams.set('entityPage', 'true');
      }

      const postId = data.status === 'draft' ? draftId : id;

      if (postId) {
        qetaApi
          .updatePost(postId, formToRequest(data, images))
          .then(q => {
            if (!q || !q.id) {
              setError(true);
              return;
            }
            setEdited(false);
            analytics.captureEvent('edit', type);
            if (data.status === 'draft' || autoSave) {
              setDraftId(q.id.toString(10));
              setPosting(false);
              if (autoSave) {
                alertApi.post({
                  message: t('postForm.autoSaveSuccess'),
                  severity: 'success',
                  display: 'transient',
                });
              } else {
                alertApi.post({
                  message: t('postForm.draftSaved'),
                  severity: 'success',
                  display: 'transient',
                });
              }
              return;
            }

            reset();
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
          if (data.status === 'draft' || autoSave) {
            analytics.captureEvent('draft', type);
            setDraftId(q.id.toString(10));
            setPosting(false);
            if (autoSave) {
              alertApi.post({
                message: t('postForm.autoSaveSuccess'),
                severity: 'success',
                display: 'transient',
              });
            } else {
              alertApi.post({
                message: t('postForm.draftSaved'),
                severity: 'success',
                display: 'transient',
              });
            }
            return;
          }
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
    },
    [
      type,
      questionRoute,
      articleRoute,
      linkRoute,
      entity,
      entityPage,
      draftId,
      id,
      qetaApi,
      analytics,
      reset,
      onPost,
      navigate,
      images,
      alertApi,
      t,
    ],
  );

  const [showTips, setShowTips] = useState(false);
  const [titleCharCount, setTitleCharCount] = useState(values.title.length);

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
      getValues(qetaApi, catalogApi, type, id)
        .then(data => {
          setValues(data);
          setImages(data.images);
          setStatus(data.status ?? 'draft');
        })
        .catch(e => {
          alertApi.post({
            message: e.message,
            severity: 'error',
            display: 'transient',
          });
          setDraftId(undefined);
          setLoadError(true);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [qetaApi, catalogApi, type, id, alertApi]);

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
    if (!id && identity?.userEntityRef) {
      catalogApi.getEntityByRef(identity.userEntityRef).then(data => {
        if (data) {
          setValues(v => {
            return { ...v, author: data };
          });
        }
      });
    }
  }, [catalogApi, id, identity]);

  const authorValue = watch('author');
  const customAuthor = useMemo(() => {
    const authorRef = authorValue ? stringifyEntityRef(authorValue) : undefined;
    return (
      (authorRef &&
        identity?.userEntityRef &&
        authorRef !== identity.userEntityRef) ||
      false
    );
  }, [authorValue, identity]);

  useEffect(() => {
    reset(values);
  }, [values, reset]);

  const onImageUpload = useCallback(
    (imageId: number) => {
      setImages(prevImages => [...prevImages, imageId]);
      setEdited(true);
    },
    [setImages],
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleCharCount(e.target.value.length);
    setValue('title', e.target.value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFavicon(undefined);
    setValue('url', e.target.value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const validateUrl = (value?: string) => {
    if (value === '') {
      setFavicon(undefined);
      return false;
    } else if (!value || !validUrl.test(value)) {
      setFavicon(undefined);
      return t('postForm.urlInput.invalid');
    }

    setUrlToCheck(value);
    return true;
  };

  useDebounce(
    () => {
      if (!urlToCheck.length || !validUrl.test(urlToCheck)) {
        return;
      }

      // some valid urls are not reachable => no error checking
      qetaApi.fetchURLMetadata({ url: urlToCheck }).then(response => {
        setFavicon(undefined);

        if (response.title) {
          setValue('title', response.title, { shouldValidate: true });
        }

        if (response.content) {
          setValue('content', response.content, { shouldValidate: true });
        }

        if (response.image) {
          setValue('headerImage', response.image, { shouldValidate: true });
        }

        if (response.favicon) {
          setFavicon(response.favicon);
        }
      });
    },
    400,
    [urlToCheck],
  );

  const autoSavePost = useCallback(() => {
    if (autoSaveEnabled && edited && isValid && !posting) {
      const formData = getFormValues();
      if (formData.title && formData.content) {
        postQuestion({ ...formData, status }, true);
      }
    }
  }, [
    autoSaveEnabled,
    edited,
    getFormValues,
    status,
    posting,
    postQuestion,
    isValid,
  ]);

  useDebounce(autoSavePost, 3100, [edited, autoSaveEnabled, isValid]);

  const getSubmitButtonText = () => {
    if (posting) {
      return (
        <span>
          {t('postForm.submitting')}{' '}
          <span className="spinner-border spinner-border-sm" />
        </span>
      );
    }
    if (!loading && status === 'draft') {
      return t('postForm.submit.publish');
    }
    return t('postForm.submit.existingPost');
  };

  const getDraftButtonText = () => {
    if (posting) {
      return (
        <span>
          {t('postForm.savingDraft')}{' '}
          <span className="spinner-border spinner-border-sm" />
        </span>
      );
    }
    if (draftId) {
      return t('postForm.updateDraft');
    }
    return t('postForm.saveDraft');
  };

  const handleAutoSaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setAutoSaveEnabled(newValue);
    localStorage.setItem('qeta-auto-save-enabled', JSON.stringify(newValue));
  };

  useEffect(() => {
    const subscription = watch((value, { type: eventType }) => {
      // We still track edits for non-dirty interactions if any,
      // but isDirty handles most form fields.
      if (eventType === 'change') {
        setEdited(true);
      }
      // Always trigger suggestions update on value change
      onFormChange?.(value as QuestionFormValues);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormChange]);

  const hasChanges = isDirty || edited;

  useConfirmNavigationIfEdited(hasChanges && !posting);

  if (loadError) {
    return (
      <Alert severity="error">{t('postForm.errorLoading', { type })}</Alert>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(data =>
        postQuestion({ ...data, status: 'active' }),
      )}
      style={{ maxWidth: 1000, margin: '0 auto' }}
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
      {isLink && (
        <Box mb={2} display="flex" alignItems="center" style={{ gap: 8 }}>
          {favicon && (
            <img
              src={favicon}
              alt="Favicon"
              style={{
                width: 16,
                height: 16,
                marginRight: 4,
                marginBottom: 16,
              }}
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          )}
          <Controller
            name="url"
            control={control}
            rules={{
              required: true,
              validate: validateUrl,
            }}
            render={() => (
              <TextField
                label={t('postForm.urlInput.label')}
                className="qetaAskFormTitle"
                required
                fullWidth
                error={!!errors.url}
                margin="normal"
                variant="outlined"
                name="url"
                helperText={
                  errors.url?.message || (
                    <span>{t('postForm.urlInput.helperText')}</span>
                  )
                }
                placeholder={t('postForm.urlInput.placeholder')}
                FormHelperTextProps={{
                  style: { marginLeft: '0.2em' },
                }}
                value={control._formValues.url ?? ''}
                onChange={handleUrlChange}
              />
            )}
          />
          {control._formValues.headerImage && (
            <img
              src={control._formValues.headerImage}
              alt="Preview"
              onError={e => (e.currentTarget.style.display = 'none')}
              style={{ maxHeight: 54, marginBottom: 14 }}
            />
          )}
        </Box>
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
          placeholder={t(
            isLink
              ? 'postForm.titleInput.placeholder_link'
              : 'postForm.titleInput.placeholder',
          )}
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
          <Link
            href="https://www.markdownguide.org/cheat-sheet/"
            target="_blank"
            color="inherit"
            rel="noopener noreferrer"
            style={{ fontSize: 12 }}
          >
            {t('postForm.contentInput.markdownHelp')}
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
              {selectByPostType(
                type,
                <>
                  <li>{t('postForm.tips_question_1')}</li>
                  <li>{t('postForm.tips_question_2')}</li>
                  <li>{t('postForm.tips_question_3')}</li>
                  <li>{t('postForm.tips_question_4')}</li>
                </>,
                <>
                  <li>{t('postForm.tips_article_1')}</li>
                  <li>{t('postForm.tips_article_2')}</li>
                  <li>{t('postForm.tips_article_3')}</li>
                  <li>{t('postForm.tips_article_4')}</li>
                </>,
                <>
                  <li>{t('postForm.tips_link_1')}</li>
                  <li>{t('postForm.tips_link_2')}</li>
                </>,
              )}
            </ul>
          </Typography>
        </Box>
      </Collapse>
      <Controller
        control={control}
        rules={{
          required: !isLink,
        }}
        render={({ field: { onChange, value } }) => (
          <MarkdownEditor
            required={!isLink}
            value={value}
            onChange={onChange}
            height={!isLink ? 400 : 150}
            error={'content' in errors}
            placeholder={selectByPostType(
              type,
              t('postForm.contentInput.placeholder_question'),
              t('postForm.contentInput.placeholder_article'),
              t('postForm.contentInput.placeholder_link'),
            )}
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
              title={getFormValues('title')}
              content={getFormValues('content')}
              tags={getFormValues('tags')}
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
      {isModerator && (
        <Box mt={1} mb={1}>
          <Controller
            control={control}
            render={({ field, fieldState: { error: authorError } }) => {
              return (
                <EntitiesInput
                  label={t('postForm.authorInput.label')}
                  placeholder={t('postForm.authorInput.placeholder')}
                  hideHelpText
                  multiple={false}
                  kind={['User']}
                  required
                  {...field}
                  error={authorError}
                />
              );
            }}
            name="author"
          />
        </Box>
      )}
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
      <Box
        mt={3}
        display="flex"
        style={{ gap: '16px' }}
        justifyContent="space-between"
      >
        <Box display="flex" style={{ gap: '16px' }}>
          <Button
            color="primary"
            type="submit"
            variant="contained"
            disabled={posting || isSubmitting}
            size="large"
          >
            {getSubmitButtonText()}
          </Button>
          {status === 'draft' && !loading && !customAuthor && (
            <Button
              color="secondary"
              variant="outlined"
              disabled={posting || isSubmitting}
              size="large"
              onClick={handleSubmit(data =>
                postQuestion({ ...data, status: 'draft' }),
              )}
            >
              {getDraftButtonText()}
            </Button>
          )}
        </Box>
        <FormControlLabel
          control={
            <Tooltip title={t('postForm.autoSaveDraftTooltip')}>
              <Switch
                checked={autoSaveEnabled}
                onChange={handleAutoSaveChange}
                color="primary"
              />
            </Tooltip>
          }
          label={t('postForm.autoSaveDraft')}
        />
      </Box>
    </form>
  );
};
