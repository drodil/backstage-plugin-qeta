import { QetaApi, qetaApiRef } from '../api';
import useAsync from 'react-use/lib/useAsync';
import {
  configApiRef,
  IdentityApi,
  identityApiRef,
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
import React, { useEffect } from 'react';
import { UserEntity } from '@backstage/catalog-model';
import {
  AnswerResponse,
  QuestionResponse,
} from '@drodil/backstage-plugin-qeta-common';
import DataLoader from 'dataloader';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../translation';

export function useQetaApi<T>(
  f: (api: QetaApi) => Promise<T>,
  deps: any[] = [],
) {
  const qetaApi = useApi(qetaApiRef);

  return useAsync(async () => {
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

export const useStyles = makeStyles(theme => {
  return {
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
      marginRight: '26px',
      display: 'inline-block',
      verticalAlign: 'top',
    },
    questionCardContent: {
      display: 'inline-block',
      width: 'calc(100% - 70px)',
      minHeight: '160px',
    },
    questionListItemStats: {
      width: '80px',
      textAlign: 'right',
      marginRight: '26px',
      display: 'inline-block',
      verticalAlign: 'top',
      paddingTop: '10px',
    },
    questionListItemContent: {
      display: 'inline-block',
      width: 'calc(100% - 120px)',
    },
    questionListItemAuthor: {
      display: 'inline',
      float: 'right',
    },
    questionListItemAvatar: {
      display: 'inline-flex',
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
    questionHighlightList: {
      width: '100%',
      border: `1px solid ${theme.palette.action.selected}`,
      borderRadius: theme.shape.borderRadius,
      '&:not(:first-child)': {
        marginTop: theme.spacing(2),
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

export const useEntityAuthor = (entity: QuestionResponse | AnswerResponse) => {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const [name, setName] = React.useState<string | undefined>(undefined);
  const [user, setUser] = React.useState<UserEntity | null>(null);
  const [initials, setInitials] = React.useState<string | null>(null);
  const [currentUser, setCurrentUser] = React.useState<string | null>(null);
  const anonymous = entity.anonymous ?? false;
  let author = entity.author;
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
    if (entity.author === currentUser) {
      displayName = 'You';
      if (anonymous) {
        displayName += ' (anonymous)';
      }
    }
    setName(displayName);
  }, [entity.author, anonymous, currentUser, userName]);

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

export const useTranslation = () => {
  return useTranslationRef(qetaTranslationRef);
};
