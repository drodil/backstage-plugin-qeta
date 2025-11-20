import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { UserLink } from '../Links';
import { useUserInfo } from '../../hooks/useEntityAuthor';
import { Avatar, Box, makeStyles, Typography } from '@material-ui/core';
import { ExpertIcon } from '../Icons/ExpertIcon.tsx';

const useStyles = makeStyles(
  theme => ({
    authorBox: {
      padding: theme.spacing(0, 1.5, 0, 0),
      textAlign: 'right',
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.5),
      marginLeft: theme.spacing(2),
      maxWidth: '200px',
    },
    authorBoxCompact: {
      display: 'flex',
      gap: theme.spacing(0.5),
      alignItems: 'center',
      marginBottom: '8px',
      '& > *': {
        fontSize: '12px',
        display: 'inline-flex',
        lineHeight: '16px',
      },
    },
    timeRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    avatar: {
      width: '20px',
      height: '20px',
    },
    avatarCompact: {
      width: '16px',
      height: '16px',
    },
    authorInfo: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      color: theme.palette.text.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: theme.spacing(0.5),
    },
    authorLink: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      color: theme.palette.text.primary,
    },
    expertIcon: {
      marginLeft: theme.spacing(0.5),
      verticalAlign: 'middle',
    },
    meta: {
      color: theme.palette.text.secondary,
      textAlign: 'center',
      margin: 0,
    },
  }),
  { name: 'QetaAuthorBox' },
);

export const AuthorBox = (props: {
  userEntityRef: string;
  time: string | Date;
  label: string;
  expert?: boolean;
  anonymous?: boolean;
  compact?: boolean;
}) => {
  const { userEntityRef, time, label, expert, anonymous, compact } = props;
  const { name, initials, user } = useUserInfo(userEntityRef);
  const styles = useStyles();

  if (compact) {
    return (
      <Box className={`qetaAuthorBox ${styles.authorBoxCompact}`}>
        <Avatar
          src={user?.spec?.profile?.picture}
          className={`qetaAuthorBoxAvatar ${styles.avatarCompact}`}
          alt={name}
          variant="rounded"
        >
          {initials}
        </Avatar>
        <UserLink entityRef={userEntityRef} anonymous={anonymous} />
        {expert && <ExpertIcon className={styles.expertIcon} />}
        <Typography className="qetaAuthorBoxCreated" variant="caption">
          <RelativeTimeWithTooltip value={time} />
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={`qetaAuthorBox ${styles.authorBox}`}>
      <Box className={styles.timeRow}>
        <Typography className="qetaAuthorBoxCreated" variant="caption">
          {label} <RelativeTimeWithTooltip value={time} />
        </Typography>
      </Box>
      <Box className={styles.authorInfo}>
        <Avatar
          src={user?.spec?.profile?.picture}
          className={`qetaAuthorBoxAvatar ${styles.avatar}`}
          alt={name}
          variant="rounded"
        >
          {initials}
        </Avatar>
        <Box className={styles.authorLink}>
          <UserLink entityRef={userEntityRef} anonymous={anonymous} />
          {expert && <ExpertIcon className={styles.expertIcon} />}
        </Box>
      </Box>
    </Box>
  );
};
