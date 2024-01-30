import { Avatar, Box, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { useEntityAuthor, useStyles } from '../../utils/hooks';
import {
  AnswerResponse,
  QuestionResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip/RelativeTimeWithTooltip';
import { AuthorLink, UpdatedByLink } from '../Links/Links';

export const AuthorBox = (props: {
  entity: QuestionResponse | AnswerResponse;
}) => {
  const { entity } = props;
  const styles = useStyles();
  const { name, initials, user } = useEntityAuthor(entity);

  return (
    <Box className={`qetaAuthorBox ${styles.questionCardAuthor}`}>
      <Grid container alignItems="center">
        <Grid item xs={12} style={{ paddingBottom: 0 }}>
          <Typography className="qetaAuthorBoxCreated" variant="caption">
            Posted <RelativeTimeWithTooltip value={entity.created} />
          </Typography>
        </Grid>
        {entity.updated && entity.updatedBy && (
          <Grid item xs={12} style={{ paddingBottom: 0, paddingTop: 0 }}>
            <Typography className="qetaAuthorBoxUpdated" variant="caption">
              Updated <RelativeTimeWithTooltip value={entity.updated} /> by{' '}
              <UpdatedByLink entity={entity} />
            </Typography>
          </Grid>
        )}
        <Grid item xs={2}>
          <Avatar
            src={user?.spec?.profile?.picture}
            className="qetaAuthorBoxAvatar avatar"
            alt={name}
            variant="rounded"
          >
            {initials}
          </Avatar>
        </Grid>
        <Grid item xs={10} className={styles.authorLink}>
          <Box style={{ paddingLeft: '5px' }}>
            <AuthorLink entity={entity} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
