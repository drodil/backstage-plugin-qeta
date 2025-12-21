import { UserResponse } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { userRouteRef } from '../../routes';
import { useIdentityApi } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import {
  Avatar,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Typography,
  Box,
  makeStyles,
} from '@material-ui/core';
import { UserFollowButton } from '../Buttons/UserFollowButton';
import Visibility from '@material-ui/icons/Visibility';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DescriptionIcon from '@material-ui/icons/Description';
import LinkIcon from '@material-ui/icons/Link';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';

const useStyles = makeStyles(theme => ({
  statsGrid: {
    marginTop: 'auto',
  },
  statItem: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const UsersGridItem = (props: { user: UserResponse }) => {
  const { user } = props;
  const classes = useGridItemStyles();
  const localClasses = useStyles();
  const userRoute = useRouteRef(userRouteRef);
  const navigate = useNavigate();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { primaryTitle, Icon } = useEntityPresentation(user.userRef);
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

  return (
    <Grid item xs={12} md={6} xl={4}>
      <Card
        className={classes.card}
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`${userRoute()}/${user.userRef}`)}
      >
        <Box className={classes.cardHeader} display="flex" alignItems="center">
          {Icon && (
            <Avatar
              src={userEntity?.spec?.profile?.picture}
              className="avatar"
              alt={name}
              variant="rounded"
              style={{ marginRight: 16 }}
            >
              {initials}
            </Avatar>
          )}
          <Box flex={1} minWidth={0}>
            <Tooltip title={secondaryTitle ?? ''} arrow>
              <Typography variant="h6" noWrap>
                {primaryTitle}
              </Typography>
            </Tooltip>
          </Box>
          {!loadingUser &&
          !userError &&
          currentUser?.userEntityRef !== user.userRef ? (
            <Box flexShrink={0}>
              <div
                onClick={e => e.stopPropagation()}
                onKeyPress={() => {}}
                role="button"
                tabIndex={0}
              >
                <UserFollowButton userRef={user.userRef} />
              </div>
            </Box>
          ) : null}
        </Box>
        <CardContent
          className={`${classes.cardContent} ${localClasses.flexColumn}`}
        >
          <Grid container spacing={1} className={localClasses.statsGrid}>
            <Grid item xs={4}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                className={localClasses.statItem}
              >
                <QuestionAnswerIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {user.totalQuestions}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('common.questions')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                className={localClasses.statItem}
              >
                <CheckCircleIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {user.totalAnswers}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('common.answers')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                className={localClasses.statItem}
              >
                <ThumbUpIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {user.totalVotes}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('common.votes')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                className={localClasses.statItem}
              >
                <DescriptionIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {user.totalArticles}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('common.articles')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                className={localClasses.statItem}
              >
                <Visibility fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {user.totalViews}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('common.views')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                className={localClasses.statItem}
              >
                <LinkIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {user.totalLinks}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('common.links')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};
