import numeral from 'numeral';
import { useIdentityApi, useQetaApi, useQetaConfig } from '../../hooks';
import {
  Alert,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  Skeleton,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  ImpactResponse,
  StatisticsResponse,
  UserStat,
} from '@drodil/backstage-plugin-qeta-common';
import {
  RiThumbUpLine,
  RiQuestionLine,
  RiQuestionAnswerLine,
  RiGroupLine,
  RiTrophyLine,
  RiFileTextLine,
  RiLinkM,
  RiStarLine,
  RiCheckboxCircleLine,
  RiLineChartLine,
  RiEyeLine,
} from '@remixicon/react';
import styles from './ImpactCard.module.css';

export const ImpactCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
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
        <div className={styles.loadingContainer}>
          <Flex justify="between" className={styles.loadingHero}>
            <Skeleton width="40%" height={40} />
            <Skeleton rounded width={80} height={32} />
          </Flex>
          <Grid.Root columns={{ initial: '12' }} gap="2">
            {Array.from(new Array(6)).map((_, i) => (
              <Grid.Item key={i} colSpan={{ initial: '6' }}>
                <Skeleton width="80%" />
              </Grid.Item>
            ))}
          </Grid.Root>
        </div>
      );
    }

    if (error) {
      return <Alert status="danger" icon description={t('impactCard.error')} />;
    }

    if (!response) {
      return null;
    }

    const { impact, stats } = response;

    const formatNumber = (num: number) => {
      return num >= 1000 ? numeral(num).format('0.0a') : num;
    };

    const totalContributions = [
      !disabled.questions ? stats.summary.totalQuestions : 0,
      !disabled.questions ? stats.summary.totalAnswers : 0,
      !disabled.articles ? stats.summary.totalArticles : 0,
      !disabled.links ? stats.summary.totalLinks : 0,
    ].reduce((sum, value) => sum + value, 0);

    const statItems = [
      {
        icon: RiLineChartLine,
        value: totalContributions,
        label: t('impactCard.totalContributions'),
      },
      ...(!disabled.questions
        ? [
            {
              icon: RiQuestionLine,
              value: stats.summary.totalQuestions,
              label: t('impactCard.questions'),
            },
            {
              icon: RiQuestionAnswerLine,
              value: stats.summary.totalAnswers,
              label: t('impactCard.answers'),
            },
          ]
        : []),
      ...(!disabled.articles
        ? [
            {
              icon: RiFileTextLine,
              value: stats.summary.totalArticles,
              label: t('impactCard.articles'),
            },
          ]
        : []),
      ...(!disabled.links
        ? [
            {
              icon: RiLinkM,
              value: stats.summary.totalLinks,
              label: t('impactCard.links'),
            },
          ]
        : []),
      {
        icon: RiThumbUpLine,
        value: stats.summary.totalVotes,
        label: t('impactCard.votes'),
      },
      {
        icon: RiGroupLine,
        value: stats.summary.totalFollowers,
        label: t('impactCard.followers'),
      },
      {
        icon: RiStarLine,
        value: stats.summary.postScore,
        label: t('impactCard.postScore'),
      },
      {
        icon: RiCheckboxCircleLine,
        value: stats.summary.correctAnswers,
        label: t('impactCard.correctAnswers'),
      },
    ];

    return (
      <>
        <Flex justify="between" align="center" className={styles.heroSection}>
          <Flex align="baseline" gap="1">
            <Text className={styles.viewsValue}>
              {formatNumber(impact.impact)}
            </Text>
            <Text color="secondary" className={styles.viewsLabel}>
              {t('impactCard.views')}
            </Text>
          </Flex>
          <Flex align="center" gap="1" className={styles.reputationBox}>
            <RiTrophyLine size={18} className={styles.reputationIcon} />
            <Text className={styles.reputationValue}>
              {stats.summary.reputation || 0}
            </Text>
          </Flex>
        </Flex>

        <Text
          variant="body-small"
          color="secondary"
          className={styles.contributionsText}
        >
          {t('impactCard.contributions', {
            lastWeek: impact.lastWeekImpact.toString(10),
          })}
        </Text>

        <Grid.Root
          columns={{ initial: '12' }}
          gap="2"
          className={styles.statGrid}
        >
          {statItems.map((item, index) => (
            <Grid.Item key={index} colSpan={{ initial: '6', sm: '4' }}>
              <TooltipTrigger>
                <Box className={styles.statItem}>
                  <item.icon size={16} className={styles.statIcon} />
                  <Text className={styles.statValue}>
                    {formatNumber(item.value)}
                  </Text>
                  <Text
                    variant="body-small"
                    color="secondary"
                    className={styles.statLabel}
                    truncate
                  >
                    {item.label}
                  </Text>
                </Box>
                <Tooltip>{item.label}</Tooltip>
              </TooltipTrigger>
            </Grid.Item>
          ))}
        </Grid.Root>
      </>
    );
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <Flex align="center" gap="2">
          <RiEyeLine size={20} />
          <Text variant="title-small">{t('impactCard.title')}</Text>
        </Flex>
      </CardHeader>
      <CardBody>{renderContent()}</CardBody>
    </Card>
  );
};
