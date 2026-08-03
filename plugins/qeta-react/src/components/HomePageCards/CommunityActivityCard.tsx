import { useState } from 'react';
import { qetaTranslationRef } from '../../translation';
import { useQetaApi, useQetaConfig } from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  Select,
  Skeleton,
  Text,
} from '@backstage/ui';
import {
  RiFileAddLine,
  RiQuestionAnswerLine,
  RiEyeLine,
  RiChat3Line,
  RiThumbUpLine,
  RiGroupLine,
  RiTeamLine,
} from '@remixicon/react';
import styles from './CommunityActivityCard.module.css';

export const CommunityActivityCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const [period, setPeriod] = useState('7d');

  const { value: stats, loading } = useQetaApi(
    api => api.getCommunityActivity(period),
    [period],
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Grid.Root columns={{ initial: '12' }} gap="4">
          {Array.from(new Array(6)).map((_, i) => (
            <Grid.Item key={i} colSpan={{ initial: '6', md: '4' }}>
              <Box className={styles.statBox}>
                <Skeleton
                  rounded
                  width={24}
                  height={24}
                  className={styles.statIcon}
                />
                <Skeleton width="60%" height={32} />
                <Skeleton width="40%" />
              </Box>
            </Grid.Item>
          ))}
        </Grid.Root>
      );
    }

    if (!stats) {
      return null;
    }

    const statItems = [
      ...(!disabled.questions || !disabled.articles || !disabled.links
        ? [
            {
              icon: RiFileAddLine,
              value: stats.posts,
              label: t('communityActivity.newPosts'),
            },
          ]
        : []),
      ...(!disabled.questions
        ? [
            {
              icon: RiQuestionAnswerLine,
              value: stats.answers,
              label: t('communityActivity.newAnswers'),
            },
          ]
        : []),
      {
        icon: RiEyeLine,
        value: stats.views,
        label: t('communityActivity.views'),
      },
      {
        icon: RiChat3Line,
        value: stats.comments,
        label: t('communityActivity.newComments'),
      },
      {
        icon: RiThumbUpLine,
        value: stats.votes,
        label: t('communityActivity.newVotes'),
      },
      {
        icon: RiGroupLine,
        value: stats.activeUsers,
        label: t('communityActivity.activeUsers'),
      },
    ];

    return (
      <Grid.Root columns={{ initial: '12' }} gap="4">
        {statItems.map((item, index) => (
          <Grid.Item key={index} colSpan={{ initial: '6', md: '4' }}>
            <Box className={styles.statBox}>
              <item.icon size={24} className={styles.statIcon} />
              <Text className={styles.statValue}>{item.value}</Text>
              <Text
                variant="body-x-small"
                color="secondary"
                className={styles.statLabel}
              >
                {item.label}
              </Text>
            </Box>
          </Grid.Item>
        ))}
      </Grid.Root>
    );
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <RiTeamLine size={20} />
            <Text variant="title-small">{t('communityActivity.title')}</Text>
          </Flex>
          <Select
            size="small"
            className={styles.select}
            aria-label={t('communityActivity.title')}
            selectedKey={period}
            onSelectionChange={key => setPeriod(key as string)}
            options={[
              { value: '1d', label: t('communityActivity.period.1d') },
              { value: '3d', label: t('communityActivity.period.3d') },
              { value: '7d', label: t('communityActivity.period.7d') },
              { value: '14d', label: t('communityActivity.period.14d') },
              { value: '30d', label: t('communityActivity.period.30d') },
              { value: '90d', label: t('communityActivity.period.90d') },
              { value: '1y', label: t('communityActivity.period.1y') },
            ]}
          />
        </Flex>
      </CardHeader>
      <CardBody>{renderContent()}</CardBody>
    </Card>
  );
};
