import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { qetaApiRef } from '../../api';
import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { useEntityFollow } from '../../hooks';
import {
  Box,
  Button,
  Grid,
  Tooltip,
  TooltipProps,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';
import HelpOutline from '@material-ui/icons/HelpOutline';
import DescriptionOutlined from '@material-ui/icons/DescriptionOutlined';
import PeopleAltOutlined from '@material-ui/icons/PeopleAltOutlined';
import { qetaTranslationRef } from '../../translation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';

const cache: Map<string, { data: EntityResponse; timestamp: number }> =
  new Map();
const requestCache: Map<
  string,
  Promise<EntityResponse | undefined>
> = new Map();
const TTL = 5 * 60 * 1000;

const EntityTooltipContent = ({
  entity,
  interactive,
}: {
  entity: Entity | string;
  interactive: boolean;
}) => {
  const entityRef =
    typeof entity === 'string' ? entity : stringifyEntityRef(entity);
  const qetaApi = useApi(qetaApiRef);
  const { primaryTitle, secondaryTitle, Icon } = useEntityPresentation(entity);
  const { t } = useTranslationRef(qetaTranslationRef);
  const entitiesFollow = useEntityFollow();
  const [resp, setResp] = useState<undefined | EntityResponse>();

  useEffect(() => {
    const cached = cache.get(entityRef);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setResp(cached.data);
      return;
    }

    if (requestCache.has(entityRef)) {
      requestCache.get(entityRef)?.then(res => {
        if (res) setResp(res);
      });
      return;
    }

    const promise = qetaApi.getEntity(entityRef).then(res => {
      if (res) {
        cache.set(entityRef, { data: res, timestamp: Date.now() });
      }
      return res || undefined;
    });

    requestCache.set(entityRef, promise);
    promise.then(res => {
      if (res) setResp(res);
      requestCache.delete(entityRef);
    });
  }, [qetaApi, entityRef]);

  if (!resp) {
    return (
      <Grid container style={{ padding: '0.5em', maxWidth: 300 }} spacing={1}>
        <Grid item xs={12}>
          <Skeleton variant="text" width={150} height={24} />
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton
            variant="rect"
            width={280}
            height={60}
            style={{ marginTop: 8 }}
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container style={{ padding: '0.5em', maxWidth: 300 }} spacing={1}>
      <Grid item xs={12}>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          {Icon ? (
            <Box marginRight={1} display="flex" alignItems="center">
              <Icon fontSize="small" />
            </Box>
          ) : null}
          <Typography
            variant="subtitle1"
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              fontWeight: 600,
            }}
          >
            {primaryTitle}
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="textSecondary">
          {secondaryTitle}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" flexWrap="wrap" style={{ gap: '1em' }}>
          <Box display="flex" alignItems="center">
            <HelpOutline
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {resp.questionsCount} {t('common.questions')}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <DescriptionOutlined
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {resp.articlesCount} {t('common.articles')}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <PeopleAltOutlined
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {t('common.followers', { count: resp.followerCount })}
            </Typography>
          </Box>
        </Box>
      </Grid>
      {interactive && !entitiesFollow.loading && (
        <Grid item xs={12}>
          <Button
            size="small"
            variant="outlined"
            color={
              entitiesFollow.isFollowingEntity(entityRef)
                ? 'secondary'
                : 'primary'
            }
            fullWidth
            onClick={() => {
              if (entitiesFollow.isFollowingEntity(entityRef)) {
                entitiesFollow.unfollowEntity(entityRef);
              } else {
                entitiesFollow.followEntity(entityRef);
              }
            }}
            startIcon={
              entitiesFollow.isFollowingEntity(entityRef) ? (
                <VisibilityOff />
              ) : (
                <Visibility />
              )
            }
          >
            {entitiesFollow.isFollowingEntity(entityRef)
              ? t('entityButton.unfollow')
              : t('entityButton.follow')}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export const EntityTooltip = (
  props: {
    entity: Entity | string;
    interactive?: boolean;
  } & Omit<TooltipProps, 'title'>,
) => {
  const {
    entity,
    interactive = true,
    children,
    className,
    ...tooltipProps
  } = props;
  const classes = useTooltipStyles();

  return (
    <Tooltip
      title={<EntityTooltipContent entity={entity} interactive={interactive} />}
      interactive={interactive}
      arrow
      classes={{
        tooltip: classes.tooltip,
        arrow: classes.tooltipArrow,
        ...props.classes,
      }}
      className={className}
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  );
};
