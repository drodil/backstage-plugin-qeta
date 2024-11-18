import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { AuthorLink, UpdatedByLink } from '../Links';
import { useTranslation } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';

export type QetaAuthorBoxClassKey = 'authorBox' | 'authorLink';

const useStyles = makeStyles(
  theme => ({
    authorBox: {
      padding: theme.spacing(1),
      float: 'right',
      maxWidth: '200px',
      border: `1px solid ${theme.palette.action.selected}`,
      '& .avatar': {
        width: theme.spacing(3),
        height: theme.spacing(3),
        fontSize: '1rem',
      },
    },
    authorLink: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
  }),
  { name: 'QetaAuthorBox' },
);

export const AuthorBox = (props: { entity: PostResponse | AnswerResponse }) => {
  const { entity } = props;
  const styles = useStyles();
  const { t } = useTranslation();
  const { name, initials, user } = useEntityAuthor(entity);

  return (
    <Box className={`qetaAuthorBox ${styles.authorBox}`}>
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
