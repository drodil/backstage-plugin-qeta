import { QetaApi, qetaApiRef } from '../api';
import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import { makeStyles } from '@material-ui/core';
import { CatalogApi } from '@backstage/catalog-client';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

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
      '& .mde-text': {
        backgroundColor: 'initial',
        color: theme.palette.text.primary,
        outline: 'none',
      },
    },
    markdownEditorError: {
      border: `1px solid ${theme.palette.error.main} !important`,
    },
    successColor: {
      color: theme.palette.success.main,
    },
    questionCardVote: {
      textAlign: 'center',
      marginRight: '10px',
      marginLeft: '-10px',
    },
    questionListPagination: {
      marginTop: theme.spacing(2),
    },
    postButton: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
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
      width: '100%',
      marginTop: theme.spacing(3),
    },
  };
});
