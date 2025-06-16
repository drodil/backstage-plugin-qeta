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
import { useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { entityRouteRef } from '../../routes';
import { parseEntityRef } from '@backstage/catalog-model';
import { useEntityFollow } from '../../hooks';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';

export const EntitiesGridItem = (props: { entity: EntityResponse }) => {
  const { entity } = props;
  const classes = useGridItemStyles();
  const entityRoute = useRouteRef(entityRouteRef);
  const navigate = useNavigate();
  const { t } = useTranslationRef(qetaTranslationRef);
  const entityFollow = useEntityFollow();
  const compound = parseEntityRef(entity.entityRef);
  const { primaryTitle, Icon } = useEntityPresentation(compound);

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card className={classes.card} variant="outlined">
        <CardActionArea
          onClick={() => navigate(entityRoute({ entityRef: entity.entityRef }))}
        >
          <CardHeader
            className={classes.cardHeader}
            title={
              <Tooltip title={primaryTitle} arrow>
                <span className={classes.ellipsis}>{primaryTitle}</span>
              </Tooltip>
            }
            titleTypographyProps={{ variant: 'h6' }}
            avatar={
              Icon ? (
                <Avatar>
                  <Icon />
                </Avatar>
              ) : null
            }
          />
          <CardContent className={classes.cardContent}>
            <Typography className={classes.stats} variant="caption">
              {t('common.posts', {
                count: entity.postsCount,
                itemType: 'post',
              })}
              {' · '}
              {t('common.followers', { count: entity.followerCount })}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions className={classes.cardActions}>
          <Grid container justifyContent="center">
            <Grid item>
              <Tooltip title={t('entityButton.tooltip')}>
                <Button
                  className={classes.actionButton}
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
                  startIcon={
                    entityFollow.isFollowingEntity(entity.entityRef) ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )
                  }
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
