import { UserResponse } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { userRouteRef } from '../../routes';
import { useIdentityApi } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import {
  Avatar,
  Box,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { UserFollowButton } from '../Buttons/UserFollowButton';
import Visibility from '@material-ui/icons/Visibility';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DescriptionIcon from '@material-ui/icons/Description';
import LinkIcon from '@material-ui/icons/Link';
import EmojiEvents from '@material-ui/icons/EmojiEvents';
import { qetaTranslationRef } from '../../translation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Link } from 'react-router-dom';

import { useListItemStyles } from '../../hooks';

const useStyles = makeStyles(theme => ({
  content: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
  },
  statsWrapper: {
    display: 'flex',
    gap: theme.spacing(3),
    marginLeft: theme.spacing(2),
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  actions: {
    marginLeft: theme.spacing(2),
  },
}));

export const UserListItem = (props: { user: UserResponse }) => {
  const { user } = props;
  const classes = useStyles();
  const listItemClasses = useListItemStyles();
  const userRoute = useRouteRef(userRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const {
    name,
    initials,
    user: userEntity,
    secondaryTitle,
  } = useEntityAuthor(user);
  const {
    value: currentUser,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  const href = `${userRoute()}/${user.userRef}`;

  return (
    <Link to={href} className={listItemClasses.root}>
      <Avatar
        src={userEntity?.spec?.profile?.picture}
        alt={name}
        variant="rounded"
      >
        {initials}
      </Avatar>
      <Box className={classes.content}>
        <Tooltip title={secondaryTitle ?? ''} arrow placement="top-start">
          <Typography className={classes.title} noWrap>
            {name}
          </Typography>
        </Tooltip>
      </Box>

      <Box className={classes.statsWrapper}>
        <Tooltip title={t('impactCard.reputation')} arrow>
          <div className={classes.statItem}>
            <EmojiEvents fontSize="small" />
            <Typography variant="body2">{user.reputation}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('common.questions')} arrow>
          <div className={classes.statItem}>
            <QuestionAnswerIcon fontSize="small" />
            <Typography variant="body2">{user.totalQuestions}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('common.answers')} arrow>
          <div className={classes.statItem}>
            <CheckCircleIcon fontSize="small" />
            <Typography variant="body2">{user.totalAnswers}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('common.articles')} arrow>
          <div className={classes.statItem}>
            <DescriptionIcon fontSize="small" />
            <Typography variant="body2">{user.totalArticles}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('common.links')} arrow>
          <div className={classes.statItem}>
            <LinkIcon fontSize="small" />
            <Typography variant="body2">{user.totalLinks}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('common.votes')} arrow>
          <div className={classes.statItem}>
            <ThumbUpIcon fontSize="small" />
            <Typography variant="body2">{user.totalVotes}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('common.views')} arrow>
          <div className={classes.statItem}>
            <Visibility fontSize="small" />
            <Typography variant="body2">{user.totalViews}</Typography>
          </div>
        </Tooltip>
      </Box>

      {!loadingUser &&
      !userError &&
      currentUser?.userEntityRef !== user.userRef ? (
        <Box
          className={classes.actions}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <UserFollowButton userRef={user.userRef} />
        </Box>
      ) : null}
    </Link>
  );
};
