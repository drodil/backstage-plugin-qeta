import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import { LinkButton } from '@backstage/core-components';
import HelpOutline from '@material-ui/icons/HelpOutline';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { askRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { useEntityQueryParameter } from '../../utils/hooks';

export const NoQuestionsCard = (props: {
  showNoQuestionsBtn?: boolean;
  entity?: string;
  entityPage?: boolean;
  tags?: string[];
}) => {
  const { showNoQuestionsBtn, entity, entityPage, tags } = props;
  const askRoute = useRouteRef(askRouteRef);
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
            <Typography variant="h6">No questions found</Typography>
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
                Go ahead and ask one!
              </LinkButton>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
