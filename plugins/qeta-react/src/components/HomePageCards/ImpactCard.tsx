import numeral from 'numeral';
import { useIdentityApi, useQetaApi } from '../../hooks';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Tooltip,
  Typography,
  useTheme,
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

export const ImpactCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const theme = useTheme();
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
        <Box p={2}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={48} />
          <Box mt={2}>
            <Divider />
          </Box>
          <Box mt={2}>
            <Grid container spacing={2}>
              {Array.from(new Array(4)).map((_, i) => (
                <Grid item xs={6} key={i}>
                  <Skeleton variant="circle" width={24} height={24} />
                  <Skeleton variant="text" width="80%" />
                </Grid>
              ))}
            </Grid>
          </Box>
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
      return num >= 1000 ? numeral(num).format('0.0 a') : num;
    };

    const formattedImpact = formatNumber(impact.impact);

    const totalContributions =
      stats.summary.totalQuestions +
      stats.summary.totalAnswers +
      stats.summary.totalArticles +
      stats.summary.totalLinks;

    const statItems = [
      {
        icon: <TrendingUp fontSize="small" />,
        value: formatNumber(totalContributions),
        label: t('impactCard.totalContributions'),
      },
      {
        icon: <HelpOutline fontSize="small" />,
        value: formatNumber(stats.summary.totalQuestions),
        label: t('impactCard.questions'),
      },
      {
        icon: <QuestionAnswer fontSize="small" />,
        value: formatNumber(stats.summary.totalAnswers),
        label: t('impactCard.answers'),
      },
      {
        icon: <DescriptionIcon fontSize="small" />,
        value: formatNumber(stats.summary.totalArticles),
        label: t('impactCard.articles'),
      },
      {
        icon: <LinkIcon fontSize="small" />,
        value: formatNumber(stats.summary.totalLinks),
        label: t('impactCard.links'),
      },
      {
        icon: <ThumbUp fontSize="small" />,
        value: formatNumber(stats.summary.totalVotes),
        label: t('impactCard.votes'),
      },
      {
        icon: <People fontSize="small" />,
        value: formatNumber(stats.summary.totalFollowers),
        label: t('impactCard.followers'),
      },
      {
        icon: <Star fontSize="small" />,
        value: formatNumber(stats.summary.answerScore),
        label: t('impactCard.answerScore'),
      },
      {
        icon: <Star fontSize="small" />,
        value: formatNumber(stats.summary.postScore),
        label: t('impactCard.postScore'),
      },
      {
        icon: <CheckCircle fontSize="small" />,
        value: formatNumber(stats.summary.correctAnswers),
        label: t('impactCard.correctAnswers'),
      },
    ];

    return (
      <>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('impactCard.title')}
        </Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography
            variant="body1"
            aria-label={`${formattedImpact} views`}
            style={{ fontWeight: 'bold', marginBottom: 0, fontSize: '32px' }}
          >
            {formattedImpact}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            style={{ marginLeft: '0.5em', verticalAlign: 'middle' }}
            color="textSecondary"
          >
            {t('impactCard.views')}
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" paragraph>
          {t('impactCard.contributions', {
            lastWeek: impact.lastWeekImpact.toString(10),
          })}
        </Typography>

        <Box display="flex" alignItems="center" mt={2} mb={2}>
          <EmojiEvents
            style={{ color: theme.palette.secondary.main, marginRight: '8px' }}
          />
          <Typography
            variant="subtitle1"
            component="span"
            style={{ fontWeight: 'bold' }}
          >
            {t('impactCard.reputation')}:{' '}
            <Box component="span" style={{ fontSize: '1.1em' }}>
              {stats.summary.reputation || 0}
            </Box>
          </Typography>
        </Box>

        <Divider />

        <Box mt={2}>
          <Grid container spacing={1}>
            {statItems.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Box display="flex" alignItems="center" color="textSecondary">
                  <Tooltip title={item.label}>
                    <Box display="flex" alignItems="center">
                      {item.icon}
                    </Box>
                  </Tooltip>
                  <Box ml={1}>
                    <Typography variant="subtitle2" component="span">
                      {item.value} {item.label.toLowerCase()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </>
    );
  };

  return (
    <Box
      display={{ md: 'none', lg: 'block' }}
      style={{ marginBottom: '1em' }}
      role="region"
      aria-label={t('impactCard.title')}
    >
      <Card elevation={2}>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </Box>
  );
};
