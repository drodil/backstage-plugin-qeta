import { LinkButton } from '@backstage/core-components';
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import React from 'react';
import { useStyles } from '../../utils/hooks';
import { useRouteRef } from '@backstage/core-plugin-api';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';
import { useSearchParams } from 'react-router-dom';
import { qetaRouteRef } from '@drodil/backstage-plugin-qeta-react';

export const BackToQuestionsButton = (props: { entityPage?: boolean }) => {
  const styles = useStyles();
  const entityRoute = useRouteRef(entityRouteRef);
  const rootRoute = useRouteRef(qetaRouteRef);

  let to = rootRoute();
  const [searchParams] = useSearchParams();
  const entity = searchParams.get('entity');
  if (entity) {
    const entityRef = parseEntityRef(entity);
    if (props.entityPage) {
      to = `${entityRoute(entityRef)}/qeta`;
    } else {
      to = `${rootRoute()}?entity=${entity}`;
    }
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
