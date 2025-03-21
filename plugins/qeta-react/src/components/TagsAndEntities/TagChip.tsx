import React, { CSSProperties, useEffect } from 'react';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';
import { qetaApiRef } from '../../api';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import { useNavigate } from 'react-router-dom';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { useTagsFollow, useTranslation } from '../../hooks';
import { Button, Chip, Grid, Tooltip, Typography } from '@material-ui/core';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';

const cache: Map<string, TagResponse> = new Map();

const TagTooltip = (props: { tag: string }) => {
  const { tag } = props;
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslation();
  const tags = useTagsFollow();
  const [resp, setResp] = React.useState<undefined | TagResponse>();

  useEffect(() => {
    if (cache.has(tag)) {
      setResp(cache.get(tag));
      return;
    }

    qetaApi.getTag(tag).then(res => {
      if (res) {
        cache.set(tag, res);
        setResp(res);
      } else {
        setResp({
          id: 0,
          tag,
          postsCount: 0,
          followerCount: 0,
          description: t('tagChip.nonExistingTag'),
        });
      }
    });
  }, [qetaApi, tag, t]);

  if (!resp) {
    return null;
  }

  return (
    <Grid container style={{ padding: '0.5em' }} spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h6">{tag}</Typography>
      </Grid>
      {resp.id > 0 && (
        <Grid item xs={12}>
          <Typography variant="subtitle2">
            {t('common.posts', { count: resp.postsCount, itemType: 'post' })}
            {' · '}
            {t('common.followers', { count: resp.followerCount })}
          </Typography>
        </Grid>
      )}
      {resp.description && (
        <Grid item xs={12}>
          <MarkdownRenderer content={resp.description} />
        </Grid>
      )}
      {!tags.loading && resp.id !== 0 && (
        <Grid item xs={12}>
          <Button
            size="small"
            variant="outlined"
            color={tags.isFollowingTag(tag) ? 'secondary' : 'primary'}
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

export const TagChip = (props: {
  tag: string;
  style?: CSSProperties;
  useHref?: boolean;
}) => {
  const tagRoute = useRouteRef(tagRouteRef);
  const navigate = useNavigate();
  const { tag } = props;
  return (
    <Tooltip
      arrow
      title={<TagTooltip tag={tag} />}
      enterDelay={400}
      interactive
    >
      <Chip
        label={tag}
        size="small"
        className="qetaTagChip"
        component="a"
        style={props.style}
        href={props.useHref ? tagRoute({ tag }) : undefined}
        target={props.useHref ? '_blank' : undefined}
        onClick={
          !props.useHref
            ? () => {
                navigate(tagRoute({ tag }));
              }
            : undefined
        }
        clickable
      />
    </Tooltip>
  );
};
