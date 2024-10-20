import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import { LinkButton } from '@backstage/core-components';
import HelpOutline from '@material-ui/icons/HelpOutline';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { askRouteRef } from '../../routes';
import { useEntityQueryParameter, useTranslation } from '../../utils/hooks';
import { PostType } from '@drodil/backstage-plugin-qeta-common';

export const NoPostsCard = (props: {
  showNoQuestionsBtn?: boolean;
  entity?: string;
  entityPage?: boolean;
  tags?: string[];
  type?: PostType;
}) => {
  const { showNoQuestionsBtn, entity, entityPage, tags, type } = props;
  const askRoute = useRouteRef(askRouteRef);
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

  const itemType = t(`common.${type ?? 'post'}`, {});
  return (
    <Card style={{ marginTop: '2rem' }}>
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
          {showNoQuestionsBtn && (
            <Grid item>
              <LinkButton
                to={
                  entityRef || tags
                    ? `${askRoute()}?${queryParams.toString()}`
                    : `${askRoute()}`
                }
                startIcon={<HelpOutline />}
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
