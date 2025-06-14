import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { UserLink } from '../Links';
import { useUserInfo } from '../../hooks/useEntityAuthor';
import { Avatar, Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { ExpertIcon } from '../Icons/ExpertIcon.tsx';

const useStyles = makeStyles(
  theme => ({
    authorBox: {
      padding: theme.spacing(1.5, 2),
      float: 'right',
      maxWidth: 220,
      background: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(0.5),
    },
    authorRow: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
    },
    avatar: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      fontSize: '1rem',
      marginRight: theme.spacing(1),
    },
    authorLink: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      fontWeight: 600,
      fontSize: '1.05rem',
      color: theme.palette.text.primary,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(0.5),
    },
    expertIcon: {
      marginLeft: theme.spacing(0.5),
      verticalAlign: 'middle',
    },
    meta: {
      color: theme.palette.text.secondary,
      fontSize: '0.85rem',
      textAlign: 'center',
      margin: 0,
    },
  }),
  { name: 'QetaAuthorBox' },
);

export const AuthorBox = (props: { userEntityRef: string, time: string | Date, label: string, expert?: boolean, anonymous?: boolean }) => {
  const { userEntityRef, time, label, expert, anonymous } = props;
  const { name, initials, user } = useUserInfo(userEntityRef);
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
            {label}{' '}
            <RelativeTimeWithTooltip value={time} />
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
            <UserLink entityRef={userEntityRef} anonymous={anonymous} />
            {expert && <ExpertIcon />}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
