import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { LinkButton } from '@backstage/core-components';
import HelpOutline from '@mui/icons-material/HelpOutline';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { askRouteRef, writeRouteRef } from '../../routes';
import { PostType } from '@drodil/backstage-plugin-qeta-common';
import CreateIcon from '@mui/icons-material/Create';
import { useTranslation } from '../../hooks';
import { useEntityQueryParameter } from '../../hooks/useEntityQueryParameter';

export const NoPostsCard = (props: {
  showNoPostsBtn?: boolean;
  entity?: string;
  entityPage?: boolean;
  tags?: string[];
  type?: PostType;
}) => {
  const { showNoPostsBtn, entity, entityPage, tags, type } = props;
  const askRoute = useRouteRef(askRouteRef);
  const writeRoute = useRouteRef(writeRouteRef);
  const { t } = useTranslation();
  const entityRef = useEntityQueryParameter(entity);

  const queryParams = new URLSearchParams();
  if (entityRef) {
    queryParams.set('entity', entityRef);
  }
  if (entityPage) {
    queryParams.set('entityPage', 'true');
  }
  if (tags && tags.length > 0) {
    queryParams.set('tags', tags.join(','));
  }

  const route = type === 'article' ? writeRoute : askRoute;

  const itemType = t(`common.${type ?? 'post'}`, {});
  return (
    <Card style={{ marginTop: '2em' }}>
      <CardContent>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          direction="column"
        >
          <Grid item>
            <Typography variant="h6">
              {t('postsContainer.noItems', {
                itemType,
              })}
            </Typography>
          </Grid>
          {showNoPostsBtn && (
            <Grid item>
              <LinkButton
                to={
                  entityRef || tags
                    ? `${route()}?${queryParams.toString()}`
                    : `${route()}`
                }
                startIcon={
                  type === 'article' ? <CreateIcon /> : <HelpOutline />
                }
                color="primary"
                variant="outlined"
              >
                {t('postsContainer.createButton')}
              </LinkButton>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
