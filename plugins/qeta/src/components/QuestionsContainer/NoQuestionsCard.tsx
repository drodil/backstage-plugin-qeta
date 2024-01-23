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
  home?: boolean;
}) => {
  const { showNoQuestionsBtn, entity, home = false } = props;
  const askRoute = useRouteRef(askRouteRef);
  const entityRef = useEntityQueryParameter(entity);

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
                  entityRef
                    ? `${askRoute()}?entity=${entityRef}&home=${home}`
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
