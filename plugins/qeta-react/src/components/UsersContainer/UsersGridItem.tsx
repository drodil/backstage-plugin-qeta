import { UserResponse } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { userRouteRef } from '../../routes';
import { useIdentityApi } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { GridSize } from '@material-ui/core/Grid';
import { UserFollowButton } from '../Buttons/UserFollowButton';
import Visibility from '@material-ui/icons/Visibility';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DescriptionIcon from '@material-ui/icons/Description';
import LinkIcon from '@material-ui/icons/Link';
import EmojiEvents from '@material-ui/icons/EmojiEvents';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';
import { ClickableLink } from '../Utility/ClickableLink';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { useQetaConfig } from '../../hooks/useQetaConfig';

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
  const { t } = useTranslationRef(qetaTranslationRef);
  const entityRef = stringifyEntityRef(
    parseEntityRef(user.userRef, { defaultKind: 'user' }),
  );
  const { primaryTitle, Icon } = useEntityPresentation(entityRef);
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
  const { disabled } = useQetaConfig();

  // Row 1: reputation (always) + questions + articles + links (conditionally)
  const row1Count = [
    true,
    !disabled.questions,
    !disabled.articles,
    !disabled.links,
  ].filter(Boolean).length;
  const row1Xs = Math.floor(12 / row1Count) as GridSize;

  // Row 2: votes + views (always) + answers (if questions enabled)
  const row2Count = [true, true, !disabled.questions].filter(Boolean).length;
  const row2Xs = Math.floor(12 / row2Count) as GridSize;

  const href = `${userRoute()}/${user.userRef}`;

  return (
    <Card className={classes.card}>
      <ClickableLink href={href} ariaLabel={primaryTitle}>
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
            <Box
              flexShrink={0}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <UserFollowButton userRef={user.userRef} />
            </Box>
          ) : null}
        </Box>
        <CardContent
          className={`${classes.cardContent} ${localClasses.flexColumn}`}
        >
          <Grid container spacing={1} className={localClasses.statsGrid}>
            <Grid item xs={row1Xs}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                className={localClasses.statItem}
              >
                <EmojiEvents fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {user.reputation}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('impactCard.reputation')}
                </Typography>
              </Box>
            </Grid>
            {!disabled.questions && (
              <Grid item xs={row1Xs}>
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
            )}
            {!disabled.articles && (
              <Grid item xs={row1Xs}>
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
            )}
            {!disabled.links && (
              <Grid item xs={row1Xs}>
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
            )}
            {!disabled.questions && (
              <Grid item xs={row2Xs}>
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
            )}
            <Grid item xs={row2Xs}>
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
            <Grid item xs={row2Xs}>
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
          </Grid>
        </CardContent>
      </ClickableLink>
    </Card>
  );
};
