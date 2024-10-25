import { LinkButton } from '@backstage/core-components';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionsRouteRef } from '../../routes';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import { useStyles, useTranslation } from '../../hooks';

export const BackToCollectionsButton = () => {
  const styles = useStyles();
  const collectionsRoute = useRouteRef(collectionsRouteRef);
  const { t } = useTranslation();

  return (
    <LinkButton
      size="small"
      className={`${styles.marginLeft} qetaBackToQuestionsBtn`}
      to={collectionsRoute()}
      startIcon={<ChevronLeft />}
    >
      {t('backToCollectionsButton.title')}
    </LinkButton>
  );
};
