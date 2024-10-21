import { LinkButton } from '@backstage/core-components';
import React from 'react';
import { useStyles, useTranslation } from '../../utils/hooks';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionsRouteRef } from '../../routes';
import ChevronLeft from '@material-ui/icons/ChevronLeft';

export const BackToCollectionsButton = () => {
  const styles = useStyles();
  const collectionsRoute = useRouteRef(collectionsRouteRef);
  const { t } = useTranslation();

  return (
    <LinkButton
      className={`${styles.marginLeft} qetaBackToQuestionsBtn`}
      to={collectionsRoute()}
      startIcon={<ChevronLeft />}
    >
      {t('backToCollectionsButton.title')}
    </LinkButton>
  );
};
