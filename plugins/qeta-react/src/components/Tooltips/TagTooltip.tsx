import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { useTagsFollow } from '../../hooks';
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
import LoyaltyOutlined from '@material-ui/icons/LoyaltyOutlined';
import HelpOutline from '@material-ui/icons/HelpOutline';
import DescriptionOutlined from '@material-ui/icons/DescriptionOutlined';
import PeopleAltOutlined from '@material-ui/icons/PeopleAltOutlined';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';

const cache: Map<string, { data: TagResponse; timestamp: number }> = new Map();
const requestCache: Map<string, Promise<TagResponse | undefined>> = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

const TagTooltipContent = ({
  tag,
  interactive,
}: {
  tag: string;
  interactive: boolean;
}) => {
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const tags = useTagsFollow();
  const [resp, setResp] = useState<undefined | TagResponse>();

  useEffect(() => {
    const cached = cache.get(tag);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setResp(cached.data);
      return;
    }

    if (requestCache.has(tag)) {
      requestCache.get(tag)!.then(res => {
        if (res) setResp(res);
      });
      return;
    }

    const promise = qetaApi.getTag(tag).then(res => {
      if (res) {
        cache.set(tag, { data: res, timestamp: Date.now() });
      } else {
        const notFound: TagResponse = {
          id: 0,
          tag,
          postsCount: 0,
          questionsCount: 0,
          articlesCount: 0,
          linksCount: 0,
          followerCount: 0,
          description: t('tagChip.nonExistingTag'),
        };
        cache.set(tag, { data: notFound, timestamp: Date.now() });
        return notFound;
      }
      return res;
    });

    requestCache.set(tag, promise);
    promise.then(res => {
      setResp(res);
      requestCache.delete(tag);
    });
  }, [qetaApi, tag, t]);

  if (!resp) {
    return (
      <Grid container style={{ padding: '0.5em', maxWidth: 300 }} spacing={1}>
        <Grid item xs={12}>
          <Skeleton variant="text" width={100} height={24} />
          <Skeleton variant="text" width={200} height={20} />
          <Skeleton
            variant="rect"
            width={280}
            height={100}
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
          <LoyaltyOutlined fontSize="small" style={{ marginRight: '5px' }} />
          <Typography
            variant="subtitle1"
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              fontWeight: 600,
            }}
          >
            {tag}
          </Typography>
        </Box>
      </Grid>
      {resp.id > 0 && (
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
      )}
      {resp.description && (
        <Grid item xs={12}>
          <MarkdownRenderer content={resp.description} />
        </Grid>
      )}
      {interactive && !tags.loading && resp.id !== 0 && (
        <Grid item xs={12}>
          <Button
            size="small"
            variant="outlined"
            color={tags.isFollowingTag(tag) ? 'secondary' : 'primary'}
            fullWidth
            onClick={() => {
              if (tags.isFollowingTag(tag)) {
                tags.unfollowTag(tag);
              } else {
                tags.followTag(tag);
              }
            }}
            startIcon={
              tags.isFollowingTag(tag) ? <VisibilityOff /> : <Visibility />
            }
          >
            {tags.isFollowingTag(tag)
              ? t('tagButton.unfollow')
              : t('tagButton.follow')}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export const TagTooltip = (
  props: { tag: string; interactive?: boolean } & Omit<TooltipProps, 'title'>,
) => {
  const {
    tag,
    interactive = true,
    children,
    className,
    ...tooltipProps
  } = props;
  const classes = useTooltipStyles();

  return (
    <Tooltip
      title={<TagTooltipContent tag={tag} interactive={interactive} />}
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
