import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { AuthorLink, UpdatedByLink } from '../Links';
import { useTranslation } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import { Avatar, Box, Grid, makeStyles, Typography } from '@material-ui/core';

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
  const { t } = useTranslation();
  const { name, initials, user } = useEntityAuthor(entity);
  const styles = useStyles();

  return (
    <Box className={`qetaAuthorBox ${styles.authorBox}`}>
      <Grid
        container
        alignItems="stretch"
        justifyContent="flex-start"
        spacing={0}
      >
        <Grid item xs={12} style={{ paddingBottom: 0 }}>
          <Typography className="qetaAuthorBoxCreated" variant="caption">
            {t('authorBox.postedAtTime')}{' '}
            <RelativeTimeWithTooltip value={entity.created} />
          </Typography>
        </Grid>

        <Grid item style={{ paddingTop: 0 }}>
          <Avatar
            src={user?.spec?.profile?.picture}
            className="qetaAuthorBoxAvatar avatar"
            alt={name}
            variant="rounded"
            style={{ width: '1.2em', height: '1.2em' }}
          >
            {initials}
          </Avatar>
        </Grid>
        <Grid
          item
          xs={10}
          style={{
            paddingTop: 0,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <Box style={{ paddingLeft: '0.3em' }}>
            <AuthorLink entity={entity} />
          </Box>
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
      </Grid>
    </Box>
  );
};
