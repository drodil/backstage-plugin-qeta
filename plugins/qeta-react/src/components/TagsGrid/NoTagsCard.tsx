import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';

export const NoTagsCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Card>
      <CardContent>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          direction="column"
        >
          <Grid item>
            <Typography variant="h6">
              {t(`tagPage.tags`, { count: 0 })}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
