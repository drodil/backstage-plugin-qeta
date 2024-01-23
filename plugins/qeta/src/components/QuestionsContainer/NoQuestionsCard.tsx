import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import { LinkButton } from '@backstage/core-components';
import HelpOutline from '@material-ui/icons/HelpOutline';
import React from 'react';

export const NoQuestionsCard = (props: {
  showNoQuestionsBtn?: boolean;
  entity?: string;
}) => {
  const { showNoQuestionsBtn, entity } = props;

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
                to={entity ? `/qeta/ask?entity=${entity}` : '/qeta/ask'}
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
