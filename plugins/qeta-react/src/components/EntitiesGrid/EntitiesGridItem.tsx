import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import {
  Avatar,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Typography,
  IconButton,
  Box,
  makeStyles,
} from '@material-ui/core';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { entityRouteRef } from '../../routes';
import { parseEntityRef } from '@backstage/catalog-model';
import { useEntityFollow } from '../../hooks';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
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

export const EntitiesGridItem = (props: { entity: EntityResponse }) => {
  const { entity } = props;
  const classes = useGridItemStyles();
  const localClasses = useStyles();
  const entityRoute = useRouteRef(entityRouteRef);
  const navigate = useNavigate();
  const { t } = useTranslationRef(qetaTranslationRef);
  const entityFollow = useEntityFollow();
  const compound = parseEntityRef(entity.entityRef);
  const { primaryTitle, Icon, secondaryTitle } =
    useEntityPresentation(compound);

  return (
    <Grid item xs={12} sm={6} md={6} xl={4}>
      <Card
        className={classes.card}
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(entityRoute({ entityRef: entity.entityRef }))}
      >
        <Box className={classes.cardHeader} display="flex" alignItems="center">
          {Icon && (
            <Avatar style={{ marginRight: 16 }}>
              <Icon />
            </Avatar>
          )}
          <Box flex={1} minWidth={0}>
            <Tooltip title={secondaryTitle ?? ''} arrow>
              <Typography variant="h6" noWrap>
                {primaryTitle}
              </Typography>
            </Tooltip>
          </Box>
          <Box flexShrink={0}>
            <Tooltip
              title={
                entityFollow.isFollowingEntity(entity.entityRef)
                  ? t('entityButton.unfollow')
                  : t('entityButton.follow')
              }
            >
              <IconButton
                aria-label="follow"
                onClick={e => {
                  e.stopPropagation();
                  if (entityFollow.isFollowingEntity(entity.entityRef)) {
                    entityFollow.unfollowEntity(entity.entityRef);
                  } else {
                    entityFollow.followEntity(entity.entityRef);
                  }
                }}
              >
                {entityFollow.isFollowingEntity(entity.entityRef) ? (
                  <VisibilityOff />
                ) : (
                  <Visibility />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <CardContent
          className={`${classes.cardContent} ${localClasses.flexColumn}`}
        >
          <Grid container spacing={1} className={localClasses.statsGrid}>
            <Grid item xs={6}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                className={localClasses.statItem}
              >
                <QuestionAnswerIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {entity.postsCount}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('common.postsLabel', {
                    count: entity.postsCount,
                    itemType: 'post',
                  })}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                className={localClasses.statItem}
              >
                <PeopleIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {entity.followerCount}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('common.followersLabel', { count: entity.followerCount })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};
