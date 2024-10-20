import { Avatar, Box, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { useEntityAuthor, useStyles, useTranslation } from '../../utils/hooks';
import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { AuthorLink, UpdatedByLink } from '../Links';

export const AuthorBox = (props: { entity: PostResponse | AnswerResponse }) => {
  const { entity } = props;
  const styles = useStyles();
  const { t } = useTranslation();
  const { name, initials, user } = useEntityAuthor(entity);

  return (
    <Box className={`qetaAuthorBox ${styles.questionCardAuthor}`}>
      <Grid container alignItems="center">
        <Grid item xs={12} style={{ paddingBottom: 0 }}>
          <Typography className="qetaAuthorBoxCreated" variant="caption">
            {t('authorBox.postedAtTime')}{' '}
            <RelativeTimeWithTooltip value={entity.created} />
          </Typography>
        </Grid>
        {entity.updated && entity.updatedBy && (
          <Grid item xs={12} style={{ paddingBottom: 0, paddingTop: 0 }}>
            <Typography className="qetaAuthorBoxUpdated" variant="caption">
              {t('authorBox.updatedAtTime')}{' '}
              <RelativeTimeWithTooltip value={entity.updated} />{' '}
              {t('authorBox.updatedBy')} <UpdatedByLink entity={entity} />
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
