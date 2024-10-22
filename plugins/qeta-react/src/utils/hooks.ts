import useAsync from 'react-use/lib/useAsync';
import {
  appThemeApiRef,
  configApiRef,
  IdentityApi,
  identityApiRef,
  useAnalytics,
  useApi,
} from '@backstage/core-plugin-api';
import { makeStyles } from '@material-ui/core';
import { CatalogApi } from '@backstage/catalog-client';
import {
  catalogApiRef,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';
import { trimEnd } from 'lodash';
import { useSearchParams } from 'react-router-dom';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserEntity } from '@backstage/catalog-model';
import {
  AnswerResponse,
  CollectionResponse,
  filterTags,
  PostResponse,
  PostType,
  QetaApi,
  QetaSignal,
  UserResponse,
} from '@drodil/backstage-plugin-qeta-common';
import DataLoader from 'dataloader';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../translation';
import { qetaApiRef } from '../api';
import {
  FilterKey,
  filterKeys,
  Filters,
} from '../components/FilterPanel/FilterPanel';
import useDebounce from 'react-use/lib/useDebounce';
import { getFiltersWithDateRange } from './utils';
import { useSignal } from '@backstage/plugin-signals-react';
import { useAsyncRetry } from 'react-use';

export const useTranslation = () => {
  return useTranslationRef(qetaTranslationRef);
};

export type PaginatedPostsProps = {
  type?: PostType;
  tags?: string[];
  author?: string;
  entity?: string;
  showFilters?: boolean;
  showTitle?: boolean;
  title?: string;
  favorite?: boolean;
  showAskButton?: boolean;
  showWriteButton?: boolean;
  showNoQuestionsBtn?: boolean;
  initialPageSize?: number;
  collectionId?: number;
};

export function usePaginatedPosts(props: PaginatedPostsProps) {
  const { type, tags, author, entity, favorite, initialPageSize } = props;
  const analytics = useAnalytics();
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [postsPerPage, setPostsPerPage] = React.useState(initialPageSize ?? 10);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Filters>({
    order: 'desc',
    orderBy: 'created',
    noAnswers: 'false',
    noCorrectAnswer: 'false',
    noVotes: 'false',
    searchQuery: '',
    entity: entity ?? '',
    tags: tags ?? [],
    dateRange: '',
    collectionId: props.collectionId,
  });

  const onPageChange = (value: number) => {
    setPage(value);
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set('page', String(value));
      return newValue;
    });
  };

  const loadNextPage = () => {
    setPage(prev => prev + 1);
  };

  const onFilterChange = (key: FilterKey, value: string | string[]) => {
    if (filters[key] === value) {
      return;
    }

    setPage(1);
    setFilters({ ...filters, ...{ [key]: value } });
    setSearchParams(prev => {
      const newValue = prev;
      if (!value || value === 'false') {
        newValue.delete(key);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          newValue.delete(key);
        } else {
          newValue.set(key, value.join(','));
        }
      } else if (value.length > 0) {
        newValue.set(key, value);
      } else {
        newValue.delete(key);
      }
      return newValue;
    });
  };

  const onSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPageChange(1);
    if (event.target.value) {
      analytics.captureEvent('qeta_search', event.target.value);
    }
    setSearchQuery(event.target.value);
  };

  useDebounce(
    () => {
      if (filters.searchQuery !== searchQuery) {
        setFilters({ ...filters, searchQuery: searchQuery });
      }
    },
    400,
    [searchQuery],
  );

  useEffect(() => {
    let filtersApplied = false;
    searchParams.forEach((value, key) => {
      try {
        if (key === 'page') {
          const pv = Number.parseInt(value, 10);
          if (pv > 0) {
            setPage(pv);
          } else {
            setPage(1);
          }
        } else if (key === 'postsPerPage') {
          const qpp = Number.parseInt(value, 10);
          if (qpp > 0) setPostsPerPage(qpp);
        } else if (filterKeys.includes(key as FilterKey)) {
          filtersApplied = true;
          if (key === 'tags') {
            filters.tags = filterTags(value) ?? [];
          } else {
            (filters as any)[key] = value;
          }
        }
      } catch (_e) {
        // NOOP
      }
    });
    setFilters(filters);
    if (filtersApplied) {
      setShowFilterPanel(true);
    }
  }, [searchParams, filters]);

  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api => {
      return api.getPosts({
        type,
        limit: postsPerPage,
        offset: (page - 1) * postsPerPage,
        includeEntities: true,
        author,
        favorite,
        ...(getFiltersWithDateRange(filters) as any),
      });
    },
    [type, page, filters, postsPerPage],
  );

  useEffect(() => {
    if (response) {
      setPageCount(Math.ceil(response.total / postsPerPage));
    }
  }, [response, postsPerPage]);

  const onPageSizeChange = (value: number) => {
    if (response) {
      let newPage = page;
      while (newPage * value > response.total) {
        newPage -= 1;
      }
      onPageChange(Math.max(1, newPage));
    }
    setPostsPerPage(value);
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set('postsPerPage', String(value));
      return newValue;
    });
  };

  return {
    page,
    setPage,
    postsPerPage,
    setPostsPerPage,
    showFilterPanel,
    setShowFilterPanel,
    searchParams,
    setSearchParams,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    onPageChange,
    onPageSizeChange,
    onFilterChange,
    onSearchQueryChange,
    response,
    loading,
    error,
    loadNextPage,
    pageCount,
  };
}

export function useVoting(resp: PostResponse | AnswerResponse) {
  const [entity, setEntity] = React.useState<PostResponse | AnswerResponse>(
    resp,
  );
  const [ownVote, setOwnVote] = React.useState(entity.ownVote ?? 0);
  const [correctAnswer, setCorrectAnswer] = useState(
    'postId' in entity ? entity.correct : false,
  );
  const [score, setScore] = useState(entity.score);
  const analytics = useAnalytics();
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslation();

  const isQuestion = 'title' in entity;
  const own = entity.own ?? false;

  const { lastSignal } = useSignal<QetaSignal>(
    isQuestion ? `qeta:question_${entity.id}` : `qeta:answer_${entity.id}`,
  );

  useEffect(() => {
    if (entity) {
      setScore(entity.score);
    }
  }, [entity]);

  useEffect(() => {
    if (
      lastSignal?.type === 'post_stats' ||
      lastSignal?.type === 'answer_stats'
    ) {
      setCorrectAnswer(lastSignal.correctAnswer);
      setScore(lastSignal.score);
    }
  }, [lastSignal]);

  const voteUp = () => {
    if (isQuestion) {
      qetaApi.votePostUp(entity.id).then(response => {
        setOwnVote(1);
        analytics.captureEvent('vote', 'question', { value: 1 });
        setEntity(response);
      });
    } else if ('questionId' in entity) {
      qetaApi.voteAnswerUp(entity.postId, entity.id).then(response => {
        setOwnVote(1);
        analytics.captureEvent('vote', 'answer', { value: 1 });
        setEntity(response);
      });
    }
  };

  const voteDown = () => {
    if (isQuestion) {
      qetaApi.votePostDown(entity.id).then(response => {
        setOwnVote(-1);
        analytics.captureEvent('vote', 'question', { value: -1 });
        setEntity(response);
      });
    } else if ('questionId' in entity) {
      qetaApi.voteAnswerDown(entity.postId, entity.id).then(response => {
        setOwnVote(-1);
        analytics.captureEvent('vote', 'answer', { value: -1 });
        setEntity(response);
      });
    }
  };

  let correctTooltip: string = correctAnswer
    ? t('voteButtons.answer.markIncorrect')
    : t('voteButtons.answer.markCorrect');
  if (!entity?.own) {
    correctTooltip = correctAnswer ? t('voteButtons.answer.marked') : '';
  }

  let voteUpTooltip: string = isQuestion
    ? t('voteButtons.question.good')
    : t('voteButtons.answer.good');
  if (own) {
    voteUpTooltip = isQuestion
      ? t('voteButtons.question.own')
      : t('voteButtons.answer.own');
  }

  let voteDownTooltip: string = isQuestion
    ? t('voteButtons.question.bad')
    : t('voteButtons.answer.bad');
  if (own) {
    voteDownTooltip = voteUpTooltip;
  }

  const toggleCorrectAnswer = () => {
    if (!('postId' in entity)) {
      return;
    }
    if (correctAnswer) {
      qetaApi.markAnswerIncorrect(entity.postId, entity.id).then(response => {
        if (response) {
          setCorrectAnswer(false);
        }
      });
    } else {
      qetaApi.markAnswerCorrect(entity.postId, entity.id).then(response => {
        if (response) {
          setCorrectAnswer(true);
        }
      });
    }
  };

  return {
    entity,
    ownVote,
    correctAnswer,
    score,
    voteUp,
    voteDown,
    toggleCorrectAnswer,
    voteUpTooltip,
    voteDownTooltip,
    correctTooltip,
  };
}

export function useQetaApi<T>(
  f: (api: QetaApi) => Promise<T>,
  deps: any[] = [],
) {
  const qetaApi = useApi(qetaApiRef);

  return useAsyncRetry(async () => {
    return await f(qetaApi);
  }, deps);
}

export function useCatalogApi<T>(
  f: (api: CatalogApi) => Promise<T>,
  deps: any[] = [],
) {
  const catalogApi = useApi(catalogApiRef);

  return useAsync(async () => {
    return await f(catalogApi);
  }, deps);
}

export function useIdentityApi<T>(
  f: (api: IdentityApi) => Promise<T>,
  deps: any[] = [],
) {
  const identityApi = useApi(identityApiRef);

  return useAsync(async () => {
    return await f(identityApi);
  }, deps);
}

export function useEntityQueryParameter(entity?: string) {
  const [searchParams] = useSearchParams();
  const [entityRef, setEntityRef] = React.useState<string | undefined>(entity);

  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
  }, [searchParams, setEntityRef]);

  return entityRef;
}

export function useIsDarkTheme() {
  const appThemeApi = useApi(appThemeApiRef);
  const themes = appThemeApi.getInstalledThemes();
  const theme = useMemo(() => appThemeApi.getActiveThemeId(), [appThemeApi]);
  return Boolean(themes.find(t => t.id === theme)?.variant === 'dark');
}

export const useStyles = makeStyles(theme => {
  return {
    leftMenu: {
      top: '0',
      width: '165px',
    },
    selectedMenuItem: {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.light,
      borderRadius: theme.shape.borderRadius,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
      '& svg': {
        color: theme.palette.primary.contrastText,
      },
    },
    nonSelectedMenuItem: {
      backgroundColor: 'initial',
    },
    headerImage: {
      width: '100%',
      height: '250px',
      objectFit: 'cover',
    },
    markdownEditor: {
      backgroundColor: 'initial',
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.action.disabled}`,
      borderRadius: theme.shape.borderRadius,
      '&:hover': {
        borderColor: theme.palette.action.active,
      },
      '&:focus-within': {
        borderColor: theme.palette.primary.main,
      },
      '& .mde-header': {
        backgroundColor: 'initial',
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.action.selected}`,
        '& .mde-tabs button, .mde-header-item > button': {
          color: `${theme.palette.text.primary} !important`,
        },
      },
      '& .mde-preview-content': {
        padding: '10px',
      },
      '& .mde-text, .mde-preview': {
        fontSize: theme.typography.body1.fontSize,
        fontFamily: theme.typography.body1.fontFamily,
        lineHeight: theme.typography.body1.lineHeight,
      },
      '& .mde-text': {
        backgroundColor: 'initial',
        color: theme.palette.text.primary,
        outline: 'none',
      },
      '& .image-tip': {
        color: theme.palette.text.primary,
        backgroundColor: 'initial',
      },
    },
    markdownEditorError: {
      border: `1px solid ${theme.palette.error.main} !important`,
    },
    markdownContent: {
      '& *': {
        wordBreak: 'break-word',
      },
      '&.inline': {
        display: 'inline-block',
      },
      '& > :first-child': {
        marginTop: '0px !important',
      },
      '& > :last-child': {
        marginBottom: '0px !important',
      },
    },
    successColor: {
      color: theme.palette.success.main,
    },
    questionDivider: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    questionCard: {
      marginBottom: theme.spacing(1),
      position: 'relative',
    },
    questionCardVote: {
      textAlign: 'center',
      width: '32px',
      marginRight: '20px',
      marginLeft: '5px',
      display: 'inline-block',
      verticalAlign: 'top',
    },
    questionCardContent: {
      minHeight: '160px',
    },
    questionListItem: {
      padding: '0.7rem',
      paddingBottom: '1.4rem',
    },
    questionListItemStats: {
      width: '70px',
      textAlign: 'right',
      marginRight: '5px',
      display: 'inline-block',
      verticalAlign: 'top',
    },
    questionListItemContent: {
      display: 'inline-block',
      width: 'calc(100% - 80px)',
    },
    questionListItemAuthor: {
      display: 'inline',
      float: 'right',
    },
    questionListItemAvatar: {
      display: 'inline-flex !important',
      marginRight: '0.25rem',
      fontSize: '1rem',
      maxWidth: '1rem',
      maxHeight: '1rem',
    },
    answerCardContent: {
      display: 'inline-block',
      width: 'calc(100% - 70px)',
    },
    questionCardAuthor: {
      padding: theme.spacing(1),
      float: 'right',
      maxWidth: '200px',
      border: `1px solid ${theme.palette.action.selected}`,
      '& .avatar': {
        width: theme.spacing(3),
        height: theme.spacing(3),
        fontSize: '1rem',
      },
    },
    questionListPagination: {
      marginTop: theme.spacing(2),
    },
    postButton: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    questionsPerPageInput: {
      paddingTop: '10px',
    },
    questionsPerPage: {
      marginRight: theme.spacing(3),
    },
    postHighlightListContainer: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.action.selected}`,
      borderRadius: theme.shape.borderRadius,
      '&:not(:first-child)': {
        marginTop: theme.spacing(2),
      },
    },
    postHighlightList: {
      paddingBottom: '0px',
      '& p': {
        marginTop: '0',
        marginBottom: '0',
      },
    },
    filterPanel: {
      border: `1px solid ${theme.palette.action.selected}`,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(3),
    },
    questionCardMetadata: {
      marginTop: theme.spacing(3),
    },
    marginRight: {
      marginRight: theme.spacing(1),
    },
    marginLeft: {
      marginLeft: theme.spacing(1),
    },
    questionCardActions: {
      marginTop: theme.spacing(2),
      '& a': {
        marginRight: theme.spacing(1),
      },
    },
    noPadding: {
      padding: `0 !important`,
    },
    menuIcon: {
      minWidth: '26px',
    },
    deleteModal: {
      position: 'absolute',
      top: '20%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      backgroundColor: theme.palette.background.default,
      border: `1px solid ${theme.palette.action.selected}`,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      '& button': {
        marginTop: theme.spacing(2),
        float: 'right',
      },
    },
    authorLink: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    highlight: {
      animation: '$highlight 2s',
    },
    '@keyframes highlight': {
      '0%': {
        boxShadow: `0px 0px 0px 3px ${theme.palette.secondary.light}`,
      },
      '100%': {
        boxShadow: 'none',
      },
    },
    dateFilter: {
      minWidth: '200px',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  };
});

// Url resolving logic from https://github.com/backstage/backstage/blob/master/packages/core-components/src/components/Link/Link.tsx

/**
 * Returns the app base url that could be empty if the Config API is not properly implemented.
 * The only cases there would be no Config API are in tests and in storybook stories, and in those cases, it's unlikely that callers would rely on this subpath behavior.
 */
export const useBaseUrl = () => {
  try {
    const config = useApi(configApiRef);
    return config.getOptionalString('app.baseUrl');
  } catch {
    return undefined;
  }
};

export const useBasePath = () => {
  // baseUrl can be specified as just a path
  const base = 'http://sample.dev';
  const url = useBaseUrl() ?? '/';
  const { pathname } = new URL(url, base);
  return trimEnd(pathname, '/');
};

const userCache: Map<string, UserEntity> = new Map();
const dataLoaderFactory = (catalogApi: CatalogApi) =>
  new DataLoader(
    async (entityRefs: readonly string[]) => {
      const { items } = await catalogApi.getEntitiesByRefs({
        fields: [
          'kind',
          'metadata.name',
          'metadata.namespace',
          'spec.profile.displayName',
          'spec.profile.picture',
        ],
        entityRefs: entityRefs as string[],
      });

      entityRefs.forEach((entityRef, index) => {
        userCache.set(entityRef, items[index] as UserEntity);
      });
      return items;
    },
    {
      name: 'EntityAuthorLoader',
      cacheMap: new Map(),
      maxBatchSize: 100,
      batchScheduleFn: callback => {
        setTimeout(callback, 50);
      },
    },
  );

export const useEntityAuthor = (
  entity: PostResponse | AnswerResponse | CollectionResponse | UserResponse,
) => {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const [name, setName] = React.useState<string | undefined>(undefined);
  const [user, setUser] = React.useState<UserEntity | null>(null);
  const [initials, setInitials] = React.useState<string | null>(null);
  const [currentUser, setCurrentUser] = React.useState<string | null>(null);
  const anonymous = 'anonymous' in entity ? entity.anonymous ?? false : false;
  let author =
    // eslint-disable-next-line no-nested-ternary
    'author' in entity
      ? entity.author
      : 'userRef' in entity
      ? entity.userRef
      : entity.owner;
  if (!author.startsWith('user:')) {
    author = `user:${author}`;
  }

  const { primaryTitle: userName } = useEntityPresentation(author);

  useEffect(() => {
    if (anonymous) {
      return;
    }

    if (userCache.get(author)) {
      setUser(userCache.get(author) as UserEntity);
      return;
    }

    dataLoaderFactory(catalogApi)
      .load(author)
      .then(data => {
        if (data) {
          setUser(data as UserEntity);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, [catalogApi, author, anonymous]);

  useEffect(() => {
    identityApi.getBackstageIdentity().then(res => {
      setCurrentUser(res.userEntityRef ?? 'user:default/guest');
    });
  }, [identityApi]);

  useEffect(() => {
    let displayName = userName;
    if (author === currentUser) {
      displayName = 'You';
      if (anonymous) {
        displayName += ' (anonymous)';
      }
    }
    setName(displayName);
  }, [author, anonymous, currentUser, userName]);

  useEffect(() => {
    const init = (name ?? '')
      .split(' ')
      .map(p => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    setInitials(init);
  }, [name]);

  return { name, initials, user };
};

let followedTags: string[] | undefined = undefined;

export const useTagsFollow = () => {
  const [tags, setTags] = React.useState<string[]>(followedTags ?? []);
  const [loading, setLoading] = React.useState(followedTags === undefined);
  const qetaApi = useApi(qetaApiRef);

  useEffect(() => {
    if (followedTags === undefined) {
      qetaApi.getFollowedTags().then(res => {
        followedTags = res.tags;
        setTags(res.tags);
        setLoading(false);
      });
    } else {
      setTags(followedTags);
    }
  }, [qetaApi]);

  const followTag = useCallback(
    (tag: string) => {
      qetaApi.followTag(tag).then(() => {
        setTags(prev => [...prev, tag]);
        followedTags?.push(tag);
      });
    },
    [qetaApi],
  );

  const unfollowTag = useCallback(
    (tag: string) => {
      qetaApi.unfollowTag(tag).then(() => {
        setTags(prev => prev.filter(t => t !== tag));
        followedTags = followedTags?.filter(t => t !== tag);
      });
    },
    [qetaApi],
  );

  const isFollowingTag = useCallback(
    (tag: string) => tags.includes(tag),
    [tags],
  );
  return {
    tags,
    followTag,
    unfollowTag,
    isFollowingTag,
    loading,
  };
};

let followedEntities: string[] | undefined = undefined;

export const useEntityFollow = () => {
  const [entities, setEntities] = React.useState<string[]>(
    followedEntities ?? [],
  );
  const [loading, setLoading] = React.useState(followedEntities === undefined);
  const qetaApi = useApi(qetaApiRef);

  useEffect(() => {
    if (followedEntities === undefined) {
      qetaApi.getFollowedEntities().then(res => {
        followedEntities = res.entityRefs;
        setEntities(res.entityRefs);
        setLoading(false);
      });
    } else {
      setEntities(followedEntities);
    }
  }, [qetaApi]);

  const followEntity = useCallback(
    (entityRef: string) => {
      qetaApi.followEntity(entityRef).then(() => {
        setEntities(prev => [...prev, entityRef]);
        followedEntities?.push(entityRef);
      });
    },
    [qetaApi],
  );

  const unfollowEntity = useCallback(
    (entityRef: string) => {
      qetaApi.unfollowEntity(entityRef).then(() => {
        setEntities(prev => prev.filter(t => t !== entityRef));
        followedEntities = followedEntities?.filter(t => t !== entityRef);
      });
    },
    [qetaApi],
  );

  const isFollowingEntity = useCallback(
    (entityRef: string) => entities.includes(entityRef),
    [entities],
  );
  return { entities, followEntity, unfollowEntity, isFollowingEntity, loading };
};
