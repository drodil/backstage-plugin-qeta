import { useState, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import {
  Collection,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';
import {
  Box,
  Button,
  Grid,
  Tooltip,
  TooltipProps,
  Typography,
} from '@material-ui/core';
import LibraryBooksOutlined from '@material-ui/icons/LibraryBooksOutlined';
import PeopleAltOutlined from '@material-ui/icons/PeopleAltOutlined';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';
import { Skeleton } from '@material-ui/lab';

const cache: Map<number, { data: Collection; timestamp: number }> = new Map();
const requestCache: Map<number, Promise<Collection | undefined>> = new Map();
const TTL = 5 * 60 * 1000;

const CollectionTooltipContent = ({
  collectionId,
  interactive,
}: {
  collectionId: number;
  interactive: boolean;
}) => {
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const collections = useCollectionsFollow();
  const [resp, setResp] = useState<undefined | Collection>();

  useEffect(() => {
    const cached = cache.get(collectionId);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setResp(cached.data);
      return;
    }

    if (requestCache.has(collectionId)) {
      requestCache.get(collectionId)!.then(res => {
        if (res) setResp(res);
      });
      return;
    }

    const promise = qetaApi.getCollection(collectionId).then(res => {
      if (res) {
        cache.set(collectionId, { data: res, timestamp: Date.now() });
        return res;
      }
      return undefined;
    });

    requestCache.set(collectionId, promise);
    promise.then(res => {
      if (res) setResp(res);
      requestCache.delete(collectionId);
    });
  }, [qetaApi, collectionId]);

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
          <LibraryBooksOutlined style={{ marginRight: '0.5em' }} />
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            {resp.title}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" flexWrap="wrap" style={{ gap: '1em' }}>
          <Box display="flex" alignItems="center">
            <LibraryBooksOutlined
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {t('common.posts', {
                count: resp.postsCount ?? resp.posts?.length ?? 0,
                itemType: 'post',
              })}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <PeopleAltOutlined
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {t('common.followers', { count: resp.followers })}
            </Typography>
          </Box>
        </Box>
      </Grid>
      {resp.description && (
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            {truncate(removeMarkdownFormatting(resp.description), 150)}
          </Typography>
        </Grid>
      )}
      {interactive && !collections.loading && (
        <Grid item xs={12}>
          <Button
            size="small"
            variant="outlined"
            color={
              collections.isFollowingCollection(resp) ? 'secondary' : 'primary'
            }
            fullWidth
            onClick={() => {
              if (collections.isFollowingCollection(resp)) {
                collections.unfollowCollection(resp);
              } else {
                collections.followCollection(resp);
              }
            }}
            startIcon={
              collections.isFollowingCollection(resp) ? (
                <VisibilityOff />
              ) : (
                <Visibility />
              )
            }
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

export const CollectionTooltip = (
  props: {
    collectionId: number;
    interactive?: boolean;
  } & Omit<TooltipProps, 'title'>,
) => {
  const {
    collectionId,
    interactive = true,
    children,
    className,
    ...tooltipProps
  } = props;
  const classes = useTooltipStyles();

  return (
    <Tooltip
      title={
        <CollectionTooltipContent
          collectionId={collectionId}
          interactive={interactive}
        />
      }
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
