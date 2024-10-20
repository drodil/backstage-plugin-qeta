import { LinkButton } from '@backstage/core-components';
import React from 'react';
import { useStyles, useTranslation } from '../../utils/hooks';
import { useRouteRef } from '@backstage/core-plugin-api';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';
import { useSearchParams } from 'react-router-dom';
import { questionsRouteRef } from '../../routes';
import ChevronLeft from '@material-ui/icons/ChevronLeft';

export const BackToQuestionsButton = (props: { entityPage?: boolean }) => {
  const styles = useStyles();
  const entityRoute = useRouteRef(entityRouteRef);
  const questionsRoute = useRouteRef(questionsRouteRef);
  const { t } = useTranslation();

  let to = questionsRoute();
  const [searchParams] = useSearchParams();
  const entity = searchParams.get('entity');
  if (entity) {
    const entityRef = parseEntityRef(entity);
    if (props.entityPage) {
      to = `${entityRoute(entityRef)}/qeta`;
    } else {
      to = `${questionsRoute()}?entity=${entity}`;
    }
  }

  return (
    <LinkButton
      className={`${styles.marginRight} qetaBackToQuestionsBtn`}
      to={to}
      startIcon={<ChevronLeft />}
    >
      {t('backToQuestionsButton.title')}
    </LinkButton>
  );
};
