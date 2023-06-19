import { LinkButton } from '@backstage/core-components';
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import React from 'react';
import { useStyles } from '../../utils/hooks';
import { useRouteRef } from '@backstage/core-plugin-api';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';

export const BackToQuestionsButton = () => {
  const styles = useStyles();
  const entityRoute = useRouteRef(entityRouteRef);

  let to = '/qeta';
  const params = new URLSearchParams(window.location.search);

  const entity = params.get('entity');
  if (entity) {
    const entityRef = parseEntityRef(entity);
    to = `${entityRoute(entityRef)}/qeta`;
  }

  return (
    <LinkButton
      className={`${styles.marginRight} qetaBackToQuestionsBtn`}
      to={to}
      startIcon={<HomeOutlined />}
    >
      Back to questions
    </LinkButton>
  );
};
