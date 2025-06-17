import { UsersResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { UsersGridItem } from './UsersGridItem';
import { NoUsersCard } from './NoUsersCard';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { Grid } from '@material-ui/core';

export const UsersGridContent = (props: {
  loading: boolean;
  error: any;
  response?: UsersResponse;
}) => {
  const { response, error, loading } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  if (loading) {
    return <LoadingGrid />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('usersPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response?.users || response.users.length === 0) {
    return (
      <Grid xs={12}>
        <NoUsersCard />
      </Grid>
    );
  }

  return (
    <Grid container item xs={12} alignItems="stretch">
      {response.users.map(entity => (
        <UsersGridItem user={entity} key={entity.userRef} />
      ))}
    </Grid>
  );
};
