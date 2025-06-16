import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { CSSProperties, useEffect, useState } from 'react';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { entityRouteRef } from '../../routes';
import { qetaApiRef } from '../../api';
import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { useEntityFollow } from '../../hooks';
import {
  Box,
  Button,
  Chip,
  Grid,
  Tooltip,
  Typography,
} from '@material-ui/core';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';
import { useNavigate } from 'react-router-dom';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';

const cache: Map<string, EntityResponse> = new Map();

const EntityTooltip = (props: { entity: Entity | string }) => {
  const { entity } = props;
  const entityRef =
    typeof entity === 'string' ? entity : stringifyEntityRef(entity);
  const qetaApi = useApi(qetaApiRef);
  const { primaryTitle, secondaryTitle, Icon } = useEntityPresentation(entity);
  const { t } = useTranslationRef(qetaTranslationRef);
  const entitiesFollow = useEntityFollow();
  const [resp, setResp] = useState<undefined | EntityResponse>();

  useEffect(() => {
    if (cache.has(entityRef)) {
      setResp(cache.get(entityRef));
      return;
    }

    qetaApi.getEntity(entityRef).then(res => {
      if (res) {
        cache.set(entityRef, res);
        setResp(res);
      }
    });
  }, [qetaApi, entityRef]);

  if (!resp) {
    return null;
  }

  return (
    <Grid container style={{ padding: '0.5em' }} spacing={1}>
      <Grid item xs={12}>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          {Icon ? <Icon fontSize="small" /> : null}
          <Typography
            variant="subtitle1"
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {primaryTitle}
          </Typography>
        </Box>
        <Typography variant="subtitle2">{secondaryTitle}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">
          {t('common.posts', { count: resp.postsCount, itemType: 'post' })}
          {' · '}
          {t('common.followers', { count: resp.followerCount })}
        </Typography>
      </Grid>
      {!entitiesFollow.loading && (
        <Grid item xs={12}>
          <Button
            size="small"
            variant="outlined"
            color={
              entitiesFollow.isFollowingEntity(entityRef)
                ? 'secondary'
                : 'primary'
            }
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

export const EntityChip = (props: {
  entity: Entity | string;
  style?: CSSProperties;
  useHref?: boolean;
}) => {
  const { entity } = props;
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle, Icon } = useEntityPresentation(entity);
  const navigate = useNavigate();
  const entityRef =
    typeof entity === 'string' ? entity : stringifyEntityRef(entity);
  const classes = useTooltipStyles();
  return (
    <Tooltip
      title={<EntityTooltip entity={entity} />}
      arrow
      enterDelay={400}
      interactive
      classes={{
        tooltip: classes.tooltip,
        arrow: classes.tooltipArrow,
      }}
    >
      <Chip
        label={primaryTitle}
        size="small"
        style={props.style}
        icon={Icon ? <Icon fontSize="small" /> : undefined}
        variant="outlined"
        className="qetaEntityChip"
        component="a"
        href={props.useHref ? entityRoute({ entityRef }) : undefined}
        target={props.useHref ? '_blank' : undefined}
        onClick={
          !props.useHref
            ? () => {
                navigate(entityRoute({ entityRef }));
              }
            : undefined
        }
        clickable
      />
    </Tooltip>
  );
};
