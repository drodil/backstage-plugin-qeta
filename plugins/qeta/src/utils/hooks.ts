import { QetaApi, qetaApiRef } from '../api';
import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import { makeStyles } from '@material-ui/core';

export function useQetaApi<T>(
  f: (api: QetaApi) => Promise<T>,
  deps: any[] = [],
) {
  const qetaApi = useApi(qetaApiRef);

  return useAsync(async () => {
    return await f(qetaApi);
  }, deps);
}

export const useStyles = makeStyles(theme => {
  return {
    markdownEditor: {
      backgroundColor: 'initial',
      boxShadow: 'none',
      border: `1px solid ${theme.palette.grey[600]}`,
      '& .w-md-editor-toolbar': {
        backgroundColor: 'initial',
      },
    },
    questionCardVote: {
      textAlign: 'center',
      marginRight: '20px',
    },
    questionListPagination: {
      marginTop: theme.spacing(2),
    },
  };
});
