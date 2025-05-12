import { useState, useEffect } from 'react';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { collectionRouteRef } from '../../routes';
import { qetaApiRef } from '../../api';
import { Collection } from '@drodil/backstage-plugin-qeta-common';
import { useNavigate } from 'react-router-dom';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useTranslation } from '../../hooks';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';
import { Button, Chip, Grid, Tooltip, Typography } from '@material-ui/core';

const cache: Map<number, Collection> = new Map();

const CollectionTooltip = (props: { collectionId: number }) => {
  const { collectionId } = props;
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslation();
  const collections = useCollectionsFollow();
  const [resp, setResp] = useState<undefined | Collection>();

  useEffect(() => {
    if (cache.has(collectionId)) {
      setResp(cache.get(collectionId));
      return;
    }

    qetaApi.getCollection(collectionId).then(res => {
      if (res) {
        cache.set(collectionId, res);
        setResp(res);
      }
    });
  }, [qetaApi, collectionId]);

  if (!resp) {
    return null;
  }

  return (
    <Grid container style={{ padding: '0.5em' }} spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h6">{resp.title}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">
          {t('common.posts', {
            count: resp.posts?.length ?? 0,
            itemType: 'post',
          })}
          {' · '}
          {t('common.followers', { count: resp.followers })}
        </Typography>
      </Grid>
      {resp.description && (
        <Grid item xs={12}>
          <MarkdownRenderer content={resp.description} />
        </Grid>
      )}
      {!collections.loading && (
        <Grid item xs={12}>
          <Button
            size="small"
            variant="outlined"
            color={
              collections.isFollowingCollection(resp) ? 'secondary' : 'primary'
            }
            onClick={() => {
              if (collections.isFollowingCollection(resp)) {
                collections.unfollowCollection(resp);
              } else {
                collections.followCollection(resp);
              }
            }}
          >
            {collections.isFollowingCollection(resp)
              ? t('collectionButton.unfollow')
              : t('collectionButton.follow')}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export const CollectionChip = (props: { collection: Collection }) => {
  const collectionRoute = useRouteRef(collectionRouteRef);
  const navigate = useNavigate();
  const { collection } = props;
  return (
    <Tooltip
      arrow
      title={<CollectionTooltip collectionId={collection.id} />}
      enterDelay={400}
    >
      <Chip
        label={collection.title}
        size="small"
        className="qetaCollectionChip"
        component="a"
        onClick={() => {
          navigate(collectionRoute({ id: collection.id.toString(10) }));
        }}
        clickable
      />
    </Tooltip>
  );
};
