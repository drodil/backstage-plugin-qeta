import { LinkButton } from '@backstage/core-components';
import React from 'react';
import { useStyles, useTranslation } from '../../utils/hooks';
import { useRouteRef } from '@backstage/core-plugin-api';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';
import { useSearchParams } from 'react-router-dom';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import { articlesRouteRef } from '../../routes';

export const BackToArticlesButton = (props: { entityPage?: boolean }) => {
  const styles = useStyles();
  const entityRoute = useRouteRef(entityRouteRef);
  const articlesRoute = useRouteRef(articlesRouteRef);
  const { t } = useTranslation();

  let to = articlesRoute();
  const [searchParams] = useSearchParams();
  const entity = searchParams.get('entity');
  if (entity) {
    const entityRef = parseEntityRef(entity);
    if (props.entityPage) {
      to = `${entityRoute(entityRef)}/qeta`;
    } else {
      to = `${articlesRoute()}?entity=${entity}`;
    }
  }

  return (
    <LinkButton
      size="small"
      className={`${styles.marginLeft} qetaBackToArticlesBtn`}
      to={to}
      startIcon={<ChevronLeft />}
    >
      {t('backToQuestionsButton.title')}
    </LinkButton>
  );
};
