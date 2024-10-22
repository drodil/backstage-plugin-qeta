import { UserResponse } from '@drodil/backstage-plugin-qeta-common';
import {
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../utils';
import { useEntityAuthor } from '../../utils/hooks';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { userRouteRef } from '../../routes';
import { parseEntityRef } from '@backstage/catalog-model';

export const UsersGridItem = (props: { user: UserResponse }) => {
  const { user } = props;
  const userRoute = useRouteRef(userRouteRef);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const compound = parseEntityRef(user.userRef);
  const { primaryTitle, Icon } = useEntityPresentation(compound);
  const { name, initials, user: userEntity } = useEntityAuthor(user);

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
      </Card>
    </Grid>
  );
};
