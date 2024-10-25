import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
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
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { entityRouteRef } from '../../routes';
import { parseEntityRef } from '@backstage/catalog-model';
import { useEntityFollow, useTranslation } from '../../hooks';

export const EntitiesGridItem = (props: { entity: EntityResponse }) => {
  const { entity } = props;
  const entityRoute = useRouteRef(entityRouteRef);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const entityFollow = useEntityFollow();
  const compound = parseEntityRef(entity.entityRef);
  const { primaryTitle, Icon } = useEntityPresentation(compound);

  return (
    <Grid item xs={3}>
      <Card
        variant="outlined"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <CardActionArea
          onClick={() => navigate(entityRoute({ entityRef: entity.entityRef }))}
        >
          <CardHeader
            title={primaryTitle}
            avatar={
              Icon ? (
                <Avatar>
                  <Icon />
                </Avatar>
              ) : null
            }
          />
          <CardContent>
            <Typography variant="caption">
              {t('common.posts', {
                count: entity.postsCount,
                itemType: 'post',
              })}
              {' · '}
              {t('common.followers', { count: entity.followerCount })}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions style={{ marginTop: 'auto' }}>
          <Grid container justifyContent="center">
            <Grid item>
              <Tooltip title={t('entityButton.tooltip')}>
                <Button
                  size="small"
                  variant="outlined"
                  color={
                    entityFollow.isFollowingEntity(entity.entityRef)
                      ? 'secondary'
                      : 'primary'
                  }
                  onClick={() => {
                    if (entityFollow.isFollowingEntity(entity.entityRef)) {
                      entityFollow.unfollowEntity(entity.entityRef);
                    } else {
                      entityFollow.followEntity(entity.entityRef);
                    }
                  }}
                >
                  {entityFollow.isFollowingEntity(entity.entityRef)
                    ? t('entityButton.unfollow')
                    : t('entityButton.follow')}
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </Grid>
  );
};
