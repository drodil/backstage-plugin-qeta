import numeral from 'numeral';
import { useIdentityApi, useQetaApi } from '../../hooks';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { Alert, Skeleton } from '@material-ui/lab';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  ImpactResponse,
  StatisticsResponse,
  UserStat,
} from '@drodil/backstage-plugin-qeta-common';
import ThumbUp from '@material-ui/icons/ThumbUp';
import HelpOutline from '@material-ui/icons/HelpOutline';
import QuestionAnswer from '@material-ui/icons/QuestionAnswer';
import People from '@material-ui/icons/People';
import EmojiEvents from '@material-ui/icons/EmojiEvents';
import DescriptionIcon from '@material-ui/icons/Description';
import LinkIcon from '@material-ui/icons/Link';
import Star from '@material-ui/icons/Star';
import CheckCircle from '@material-ui/icons/CheckCircle';
import TrendingUp from '@material-ui/icons/TrendingUp';
import VisibilityIcon from '@material-ui/icons/Visibility';

const useStyles = makeStyles(theme => ({
  card: {
    height: '100%',
  },
  header: {
    paddingBottom: 0,
  },
  content: {
    paddingTop: theme.spacing(1),
  },
  heroSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
    marginBottom: theme.spacing(1.5),
  },
  viewsBox: {
    display: 'flex',
    alignItems: 'baseline',
  },
  viewsValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    lineHeight: 1,
  },
  viewsLabel: {
    marginLeft: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: '0.9rem',
  },
  reputationBox: {
    display: 'flex',
    alignItems: 'center',
    background:
      theme.palette.type === 'dark'
        ? 'rgba(255, 215, 0, 0.1)'
        : 'rgba(255, 215, 0, 0.15)',
    padding: theme.spacing(0.75, 1.5),
    borderRadius: 20,
  },
  reputationIcon: {
    color: '#FFD700',
    marginRight: theme.spacing(0.5),
    fontSize: '1.2rem',
  },
  reputationValue: {
    fontWeight: 'bold',
    fontSize: '1rem',
    userSelect: 'none',
  },
  statGrid: {
    marginTop: theme.spacing(0.5),
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
  },
  statIcon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
    fontSize: '1rem',
  },
  statValue: {
    fontWeight: 'bold',
    marginRight: theme.spacing(0.5),
    minWidth: 24,
  },
  statLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.8rem',
  },
  contributionsText: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    fontSize: '0.875rem',
  },
}));

export const ImpactCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useStyles();
  const { value: user, loading: userLoading } = useIdentityApi(
    api => api.getBackstageIdentity(),
    [],
  );

  const {
    value: response,
    loading: statsLoading,
    error,
  } = useQetaApi<{
    impact: ImpactResponse;
    stats: StatisticsResponse<UserStat>;
  } | null>(
    async api => {
      if (!user) {
        return null;
      }
      const [impact, stats] = await Promise.all([
        api.getUserImpact(),
        api.getUserStats(user.userEntityRef),
      ]);
      return { impact, stats };
    },
    [user],
  );

  const loading = userLoading || statsLoading;

  const renderContent = () => {
    if (loading) {
      return (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Skeleton variant="text" width="40%" height={40} />
            <Skeleton
              variant="rect"
              width={80}
              height={32}
              style={{ borderRadius: 16 }}
            />
          </Box>
          <Grid container spacing={1}>
            {Array.from(new Array(6)).map((_, i) => (
              <Grid item xs={6} key={i}>
                <Skeleton variant="text" width="80%" />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error">{t('impactCard.error')}</Alert>;
    }

    if (!response) {
      return null;
    }

    const { impact, stats } = response;

    const formatNumber = (num: number) => {
      return num >= 1000 ? numeral(num).format('0.0a') : num;
    };

    const statItems = [
      {
        icon: TrendingUp,
        value:
          stats.summary.totalQuestions +
          stats.summary.totalAnswers +
          stats.summary.totalArticles +
          stats.summary.totalLinks,
        label: t('impactCard.totalContributions'),
      },
      {
        icon: HelpOutline,
        value: stats.summary.totalQuestions,
        label: t('impactCard.questions'),
      },
      {
        icon: QuestionAnswer,
        value: stats.summary.totalAnswers,
        label: t('impactCard.answers'),
      },
      {
        icon: DescriptionIcon,
        value: stats.summary.totalArticles,
        label: t('impactCard.articles'),
      },
      {
        icon: LinkIcon,
        value: stats.summary.totalLinks,
        label: t('impactCard.links'),
      },
      {
        icon: ThumbUp,
        value: stats.summary.totalVotes,
        label: t('impactCard.votes'),
      },
      {
        icon: People,
        value: stats.summary.totalFollowers,
        label: t('impactCard.followers'),
      },
      {
        icon: Star,
        value: stats.summary.postScore,
        label: t('impactCard.postScore'),
      },
      {
        icon: CheckCircle,
        value: stats.summary.correctAnswers,
        label: t('impactCard.correctAnswers'),
      },
    ];

    return (
      <>
        <Box className={classes.heroSection}>
          <Box className={classes.viewsBox}>
            <Typography className={classes.viewsValue}>
              {formatNumber(impact.impact)}
            </Typography>
            <Typography className={classes.viewsLabel}>
              {t('impactCard.views')}
            </Typography>
          </Box>
          <Box className={classes.reputationBox}>
            <EmojiEvents className={classes.reputationIcon} />
            <Typography className={classes.reputationValue}>
              {stats.summary.reputation || 0}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" className={classes.contributionsText}>
          {t('impactCard.contributions', {
            lastWeek: impact.lastWeekImpact.toString(10),
          })}
        </Typography>

        <Grid container spacing={1} className={classes.statGrid}>
          {statItems.map((item, index) => (
            <Grid item xs={6} sm={4} key={index}>
              <Tooltip title={item.label}>
                <Box className={classes.statItem}>
                  <item.icon className={classes.statIcon} />
                  <Typography className={classes.statValue}>
                    {formatNumber(item.value)}
                  </Typography>
                  <Typography className={classes.statLabel} noWrap>
                    {item.label}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        title={t('impactCard.title')}
        className={classes.header}
        avatar={<VisibilityIcon />}
        titleTypographyProps={{ variant: 'h5' }}
      />
      <CardContent className={classes.content}>{renderContent()}</CardContent>
    </Card>
  );
};
