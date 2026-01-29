import { useState } from 'react';
import { qetaTranslationRef } from '../../translation';
import { useQetaApi } from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import PostAddIcon from '@material-ui/icons/PostAdd';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import VisibilityIcon from '@material-ui/icons/Visibility';
import CommentIcon from '@material-ui/icons/Comment';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import PeopleIcon from '@material-ui/icons/People';
import GroupWorkIcon from '@material-ui/icons/GroupWork';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    background:
      theme.palette.type === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.02)',
  },
  statIcon: {
    marginBottom: theme.spacing(0.5),
    color: theme.palette.primary.main,
    opacity: 0.8,
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: '1.3rem',
    color: theme.palette.primary.main,
    lineHeight: 1.2,
  },
  statLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    marginTop: theme.spacing(0.25),
  },
  header: {
    paddingBottom: 0,
  },
  select: {
    fontSize: '0.8rem',
  },
}));

export const CommunityActivityCard = () => {
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);
  const [period, setPeriod] = useState('7d');

  const { value: stats, loading } = useQetaApi(
    api => api.getCommunityActivity(period),
    [period],
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Grid container spacing={2}>
          {Array.from(new Array(6)).map((_, i) => (
            <Grid item xs={6} md={4} key={i}>
              <Box className={classes.statBox}>
                <Skeleton
                  variant="circle"
                  width={24}
                  height={24}
                  className={classes.statIcon}
                />
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (!stats) {
      return null;
    }

    const statItems = [
      {
        icon: PostAddIcon,
        value: stats.posts,
        label: t('communityActivity.newPosts'),
      },
      {
        icon: QuestionAnswerIcon,
        value: stats.answers,
        label: t('communityActivity.newAnswers'),
      },
      {
        icon: VisibilityIcon,
        value: stats.views,
        label: t('communityActivity.views'),
      },
      {
        icon: CommentIcon,
        value: stats.comments,
        label: t('communityActivity.newComments'),
      },
      {
        icon: ThumbUpIcon,
        value: stats.votes,
        label: t('communityActivity.newVotes'),
      },
      {
        icon: PeopleIcon,
        value: stats.activeUsers,
        label: t('communityActivity.activeUsers'),
      },
    ];

    return (
      <Grid container spacing={2}>
        {statItems.map((item, index) => (
          <Grid item xs={6} md={4} key={index}>
            <Box className={classes.statBox}>
              <item.icon className={classes.statIcon} />
              <Typography className={classes.statValue}>
                {item.value}
              </Typography>
              <Typography className={classes.statLabel}>
                {item.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Card className={classes.root} variant="outlined">
      <CardHeader
        title={t('communityActivity.title')}
        className={classes.header}
        avatar={<GroupWorkIcon />}
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <Select
            value={period}
            onChange={e => setPeriod(e.target.value as string)}
            className={classes.select}
            disableUnderline
          >
            <MenuItem value="1d">{t('communityActivity.period.1d')}</MenuItem>
            <MenuItem value="3d">{t('communityActivity.period.3d')}</MenuItem>
            <MenuItem value="7d">{t('communityActivity.period.7d')}</MenuItem>
            <MenuItem value="14d">{t('communityActivity.period.14d')}</MenuItem>
            <MenuItem value="30d">{t('communityActivity.period.30d')}</MenuItem>
            <MenuItem value="90d">{t('communityActivity.period.90d')}</MenuItem>
            <MenuItem value="1y">{t('communityActivity.period.1y')}</MenuItem>
          </Select>
        }
      />
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};
