import CreateIcon from '@material-ui/icons/Create';
import React from 'react';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { writeRouteRef } from '../../routes';
import { useStyles, useTranslation } from '../../utils/hooks';

export const WriteArticleButton = (props: {
  entity?: string;
  tags?: string[];
  entityPage?: boolean;
}) => {
  const { entity, entityPage, tags } = props;
  const writeRoute = useRouteRef(writeRouteRef);
  const { t } = useTranslation();
  const styles = useStyles();

  const params = new URLSearchParams();
  if (entity) {
    params.set('entity', entity);
  }
  if (entityPage) {
    params.set('entityPage', 'true');
  }
  if (tags && tags.length > 0) {
    params.set('tags', tags.join(','));
  }

  return (
    <RequirePermission permission={qetaCreatePostPermission} errorPage={<></>}>
      <LinkButton
        variant="contained"
        to={
          entity || tags ? `${writeRoute()}?${params.toString()}` : writeRoute()
        }
        color="primary"
        className={`${styles.marginLeft} qetaWriteArticleBtn`}
        startIcon={<CreateIcon />}
      >
        {t('writeArticleButton.title')}
      </LinkButton>
    </RequirePermission>
  );
};
