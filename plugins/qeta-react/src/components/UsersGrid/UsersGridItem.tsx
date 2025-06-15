import { UserResponse } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { userRouteRef } from '../../routes';
import { parseEntityRef } from '@backstage/catalog-model';
import { useIdentityApi, useUserFollow } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import {
  Avatar,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Tooltip,
  Typography,
} from '@material-ui/core';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const UsersGridItem = (props: { user: UserResponse }) => {
  const { user } = props;
  const userRoute = useRouteRef(userRouteRef);
  const navigate = useNavigate();
  const { t } = useTranslationRef(qetaTranslationRef);
  const compound = parseEntityRef(user.userRef);
  const { primaryTitle, Icon } = useEntityPresentation(compound);
  const { name, initials, user: userEntity } = useEntityAuthor(user);
  const users = useUserFollow();
  const {
    value: currentUser,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  return (
    <Grid item xs={4}>
      <Card
        variant="outlined"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <CardActionArea
          onClick={() => navigate(`${userRoute()}/${user.userRef}`)}
        >
          <CardHeader
            title={primaryTitle}
            avatar={
              Icon ? (
                <Avatar
                  src={userEntity?.spec?.profile?.picture}
                  className="avatar"
                  alt={name}
                  variant="rounded"
                >
                  {initials}
                </Avatar>
              ) : null
            }
          />
          <CardContent>
            <Typography variant="caption">
              {t('common.posts', {
                count: user.totalQuestions,
                itemType: 'question',
              })}
              {' · '}
              {t('common.answers', {
                count: user.totalAnswers,
              })}
              {' · '}
              {t('common.posts', {
                count: user.totalArticles,
                itemType: 'article',
              })}
              {' · '}
              {t('common.posts', {
                count: user.totalComments,
                itemType: 'comment',
              })}
              {' · '}
              {t('common.votes', {
                count: user.totalVotes,
              })}
              {' · '}
              {t('common.viewsShort', {
                count: user.totalViews,
              })}
            </Typography>
          </CardContent>
        </CardActionArea>
        {!loadingUser &&
          !userError &&
          currentUser?.userEntityRef !== user.userRef && (
            <CardActions style={{ marginTop: 'auto' }}>
              <Grid container justifyContent="center">
                <Grid item>
                  <Tooltip title={t('userButton.tooltip')}>
                    <Button
                      size="small"
                      variant="outlined"
                      color={
                        users.isFollowingUser(user.userRef)
                          ? 'secondary'
                          : 'primary'
                      }
                      onClick={() => {
                        if (users.isFollowingUser(user.userRef)) {
                          users.unfollowUser(user.userRef);
                        } else {
                          users.followUser(user.userRef);
                        }
                      }}
                      startIcon={
                        users.isFollowingUser(user.userRef) ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )
                      }
                    >
                      {users.isFollowingUser(user.userRef)
                        ? t('userButton.unfollow')
                        : t('userButton.follow')}
                    </Button>
                  </Tooltip>
                </Grid>
              </Grid>
            </CardActions>
          )}
      </Card>
    </Grid>
  );
};
