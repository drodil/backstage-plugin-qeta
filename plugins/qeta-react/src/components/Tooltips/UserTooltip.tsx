import { useIdentityApi, useUserFollow, useUserInfo } from '../../hooks';
import {
  Avatar,
  Box,
  Button,
  Grid,
  Tooltip,
  TooltipProps,
  Typography,
} from '@material-ui/core';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';
import HelpOutline from '@material-ui/icons/HelpOutline';
import QuestionAnswerOutlined from '@material-ui/icons/QuestionAnswerOutlined';
import DescriptionOutlined from '@material-ui/icons/DescriptionOutlined';
import Stars from '@material-ui/icons/Stars';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import { useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useEffect, useState } from 'react';
import { UserStat } from '@drodil/backstage-plugin-qeta-common';
import { qetaApiRef } from '../../api';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';
import { Skeleton } from '@material-ui/lab';

const cache: Map<string, { data: UserStat; timestamp: number }> = new Map();
const requestCache: Map<string, Promise<UserStat | undefined>> = new Map();
const TTL = 5 * 60 * 1000;

const UserTooltipContent = ({
  entityRef,
  anonymous,
  interactive,
}: {
  entityRef: string;
  anonymous?: boolean;
  interactive: boolean;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const qetaApi = useApi(qetaApiRef);

  const { name, initials, user, secondaryTitle } = useUserInfo(
    entityRef,
    anonymous ?? entityRef === 'anonymous',
  );
  const [stats, setStats] = useState<UserStat | undefined>();

  useEffect(() => {
    const cached = cache.get(entityRef);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setStats(cached.data);
      return;
    }

    if (requestCache.has(entityRef)) {
      requestCache.get(entityRef)!.then(res => {
        if (res) setStats(res);
      });
      return;
    }

    const promise = qetaApi.getUserStats(entityRef).then(res => {
      if (res && res.summary) {
        cache.set(entityRef, { data: res.summary, timestamp: Date.now() });
        return res.summary;
      }
      return undefined;
    });

    requestCache.set(entityRef, promise);
    promise.then(res => {
      if (res) setStats(res);
      requestCache.delete(entityRef);
    });
  }, [qetaApi, entityRef]);

  const { value: currentUser } = useIdentityApi(
    api => api.getBackstageIdentity(),
    [],
  );
  const users = useUserFollow();

  if (!stats) {
    return (
      <Grid container style={{ padding: '0.5em', maxWidth: 300 }} spacing={1}>
        <Grid item xs={12}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Box style={{ display: 'inline-block', marginRight: '1em' }}>
              <Skeleton variant="circle" width={40} height={40} />
            </Box>
            <Box style={{ overflow: 'hidden', flex: 1 }}>
              <Skeleton variant="text" width={100} height={24} />
              <Skeleton variant="text" width={150} height={20} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container style={{ padding: '0.5em', maxWidth: 300 }} spacing={1}>
      <Grid item xs={12}>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <Box style={{ display: 'inline-block', marginRight: '1em' }}>
            <Avatar
              src={user?.spec?.profile?.picture}
              alt={name}
              variant="rounded"
              style={{ width: '48px', height: '48px' }}
            >
              {initials}
            </Avatar>
          </Box>
          <Box style={{ overflow: 'hidden' }}>
            <Typography
              variant="subtitle1"
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                fontWeight: 600,
              }}
            >
              {name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {secondaryTitle}
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" flexWrap="wrap" style={{ gap: '0.5em' }}>
          <Box display="flex" alignItems="center">
            <HelpOutline
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {stats.totalQuestions} {t('common.questions')}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <QuestionAnswerOutlined
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {stats.totalAnswers} {t('common.answers', {})}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <DescriptionOutlined
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {stats.totalArticles} {t('common.articles')}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Stars
              style={{
                fontSize: '0.875rem',
                marginRight: '0.25em',
                color: '#ffc107',
              }}
            />
            <Typography variant="caption">
              {stats.reputation} {t('impactCard.reputation')}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Visibility
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {stats.totalViews} {t('common.views')}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <CheckCircleOutline
              style={{
                fontSize: '0.875rem',
                marginRight: '0.25em',
                color: '#4caf50',
              }}
            />
            <Typography variant="caption">
              {stats.correctAnswers} {t('impactCard.correctAnswers')}
            </Typography>
          </Box>
        </Box>
      </Grid>
      {interactive &&
        !users.loading &&
        currentUser?.userEntityRef !== entityRef && (
          <Grid item xs={12}>
            <Button
              size="small"
              variant="outlined"
              color={users.isFollowingUser(entityRef) ? 'secondary' : 'primary'}
              fullWidth
              onClick={() => {
                if (users.isFollowingUser(entityRef)) {
                  users.unfollowUser(entityRef);
                } else {
                  users.followUser(entityRef);
                }
              }}
              startIcon={
                users.isFollowingUser(entityRef) ? (
                  <VisibilityOff />
                ) : (
                  <Visibility />
                )
              }
            >
              {users.isFollowingUser(entityRef)
                ? t('userButton.unfollow')
                : t('userButton.follow')}
            </Button>
          </Grid>
        )}
    </Grid>
  );
};

export const UserTooltip = (
  props: {
    entityRef: string;
    anonymous?: boolean;
    interactive?: boolean;
  } & Omit<TooltipProps, 'title'>,
) => {
  const {
    entityRef,
    anonymous,
    interactive = true,
    children,
    className,
    ...tooltipProps
  } = props;
  const classes = useTooltipStyles();

  return (
    <Tooltip
      title={
        <UserTooltipContent
          entityRef={entityRef}
          anonymous={anonymous}
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
