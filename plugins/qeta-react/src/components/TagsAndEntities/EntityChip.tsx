import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Button, Chip, Grid, Tooltip, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { entityRouteRef } from '../../routes';
import { qetaApiRef } from '../../api';
import { useTranslation } from '../../utils';
import { useEntityFollow } from '../../utils/hooks';
import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';

const cache: Map<string, EntityResponse> = new Map();

const EntityTooltip = (props: { entity: Entity | string }) => {
  const { entity } = props;
  const entityRef =
    typeof entity === 'string' ? entity : stringifyEntityRef(entity);
  const qetaApi = useApi(qetaApiRef);
  const { primaryTitle } = useEntityPresentation(entity);
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
        <Typography variant="h6">{primaryTitle}</Typography>
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
    <Tooltip
      title={<EntityTooltip entity={entity} />}
      arrow
      interactive
      enterDelay={400}
    >
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
