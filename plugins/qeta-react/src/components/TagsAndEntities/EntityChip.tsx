import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import React, { useEffect } from 'react';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { entityRouteRef } from '../../routes';
import { qetaApiRef } from '../../api';
import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { useEntityFollow, useTranslation } from '../../hooks';

const cache: Map<string, EntityResponse> = new Map();

const EntityTooltip = (props: { entity: Entity | string }) => {
  const { entity } = props;
  const entityRef =
    typeof entity === 'string' ? entity : stringifyEntityRef(entity);
  const qetaApi = useApi(qetaApiRef);
  const { primaryTitle, secondaryTitle, Icon } = useEntityPresentation(entity);
  const { t } = useTranslation();
  const entitiesFollow = useEntityFollow();
  const [resp, setResp] = React.useState<undefined | EntityResponse>();

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
    <Grid container style={{ padding: '0.5rem' }} spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h6">
          {Icon ? <Icon fontSize="small" /> : null} {primaryTitle}
        </Typography>
        <Typography variant="subtitle1">{secondaryTitle}</Typography>
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
                entitiesFollow.followEntity(entityRef);
              } else {
                entitiesFollow.followEntity(entityRef);
              }
            }}
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

export const EntityChip = (props: { entity: Entity | string }) => {
  const { entity } = props;
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle } = useEntityPresentation(entity);
  const entityRef =
    typeof entity === 'string' ? entity : stringifyEntityRef(entity);
  return (
    <Tooltip title={<EntityTooltip entity={entity} />} arrow enterDelay={400}>
      <Chip
        label={primaryTitle}
        size="small"
        variant="outlined"
        className="qetaEntityChip"
        component="a"
        href={entityRoute({ entityRef })}
        clickable
      />
    </Tooltip>
  );
};
