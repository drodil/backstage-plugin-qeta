import { TagGridItem } from './TagGridItem';
import { TagsResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { NoTagsCard } from './NoTagsCard';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { Grid } from '@material-ui/core';

export const TagsGridContent = (props: {
  loading: boolean;
  error: any;
  response?: TagsResponse;
  onTagEdit: () => void;
  isModerator?: boolean;
}) => {
  const { response, onTagEdit, loading, error, isModerator } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  if (loading) {
    return <LoadingGrid />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('tagPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response?.tags || response.tags.length === 0) {
    return <NoTagsCard />;
  }

  return (
    <Grid container item xs={12} justifyContent="center" alignItems="stretch">
      {response?.tags.map(tag => (
        <TagGridItem
          tag={tag}
          key={tag.tag}
          onTagEdit={onTagEdit}
          isModerator={isModerator}
        />
      ))}
    </Grid>
  );
};
