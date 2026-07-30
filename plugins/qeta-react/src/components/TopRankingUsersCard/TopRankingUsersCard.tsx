import { ReactElement, ReactNode } from 'react';
import {
  CardTab,
  Progress,
  TabbedCard,
  WarningPanel,
} from '@backstage/core-components';
import { Box, Flex, List, ListRow, Text } from '@backstage/ui';
import { StatisticResponse } from '@drodil/backstage-plugin-qeta-common';
import { TrophyIcon } from './TrophyIcon';
import { UserLink } from '../Links';
import { useQetaApi, useQetaConfig } from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import styles from './TopRankingUsersCard.module.css';

type RankingIcon = {
  iconsByRanking: Map<number, ReactNode>;
  userRankingIcon: ReactNode;
};

const DefaultRankingIcons = new Map<number, ReactNode>([
  [
    1,
    <TrophyIcon
      style={{ color: '#DAA520', height: '2.2rem', width: '2.2rem' }}
    />,
  ],
  [
    2,
    <TrophyIcon
      style={{ color: '#C0C0C0', height: '2.1rem', width: '2.1rem' }}
    />,
  ],
  [
    3,
    <TrophyIcon style={{ color: '#B87333', height: '2rem', width: '2rem' }} />,
  ],
]);

const DefaultUserIcon = (
  <TrophyIcon style={{ height: '2rem', width: '2rem' }} />
);

const getOrdinal = (n: number) => {
  if (n % 10 === 1 && n % 100 !== 11) {
    return `${n}st`;
  } else if (n % 10 === 2 && n % 100 !== 12) {
    return `${n}nd`;
  } else if (n % 10 === 3 && n % 100 !== 13) {
    return `${n}rd`;
  }

  return `${n}th`;
};

export const RankingRow = (props: {
  userRef?: string;
  total: number;
  position: number;
  rankingIcon?: RankingIcon;
  unit: string;
}) => {
  const userRef = props.userRef;

  const ordinalPosition = props?.position ? getOrdinal(props?.position) : '';

  const userIcon = props.rankingIcon?.userRankingIcon
    ? props.rankingIcon?.userRankingIcon
    : DefaultUserIcon;

  const topRankingIcon = props.rankingIcon
    ? props.rankingIcon.iconsByRanking.get(Number(props?.position))
    : DefaultRankingIcons.get(Number(props?.position)) || DefaultUserIcon;

  const rankingIcon = props?.position > 3 ? userIcon : topRankingIcon;

  return (
    <List>
      <ListRow
        icon={<div className={styles.trophyIcon}>{rankingIcon}</div>}
        customActions={
          <div className={styles.votesText}>
            <Text variant="body-medium" weight="bold">
              {props?.total} {props.unit}
            </Text>
          </div>
        }
      >
        <Flex align="center" gap="2">
          <Text
            className={`${styles.position} ${
              props.position <= 3 ? styles.topPosition : ''
            }`}
            variant="body-medium"
            weight="bold"
          >
            {ordinalPosition}
          </Text>
          <UserLink entityRef={userRef ?? ''} />
        </Flex>
      </ListRow>
    </List>
  );
};

export const RankingCard = (props: {
  limit?: number;
  description: string;
  statistic?: StatisticResponse;
  unit: string;
}) => {
  const rankingStats = props.limit
    ? props.statistic?.ranking.slice(0, props.limit)
    : props.statistic?.ranking;

  return (
    <Box className={styles.rankingCard}>
      <Text className={styles.rankingCardDescription} variant="body-medium">
        {props.description}
      </Text>
      <Flex direction="column" gap="2">
        {rankingStats?.map(authorStats => (
          <RankingRow
            total={authorStats.total || 0}
            position={authorStats.position || 0}
            userRef={authorStats.author}
            unit={props.unit}
            key={authorStats.author}
          />
        ))}
        {!rankingStats?.some(
          authorStats =>
            authorStats.author === props.statistic?.loggedUser?.author,
        ) && (
          <>
            <div className={styles.divider} />
            <RankingRow
              total={props.statistic?.loggedUser?.total || 0}
              position={props.statistic?.loggedUser?.position || 0}
              userRef={props.statistic?.loggedUser?.author}
              unit={props.unit}
            />
          </>
        )}
      </Flex>
    </Box>
  );
};

export const TopRankingUsers = (props: {
  title?: string;
  hideTitle?: boolean;
  limit?: number;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const {
    value: topStatistics,
    loading,
    error,
  } = useQetaApi(api =>
    api.getTopStatisticsHomepage({
      options: { limit: 50 },
    }),
  );

  const tabData = [
    {
      title: t('statistics.mostQuestions.title'),
      description: t('statistics.mostQuestions.description'),
      unit: 'questions',
    },
    {
      title: t('statistics.mostAnswers.title'),
      description: t('statistics.mostAnswers.description'),
      unit: 'answers',
    },
    {
      title: t('statistics.topVotedQuestions.title'),
      description: t('statistics.topVotedQuestions.description'),
      unit: 'votes',
    },
    {
      title: t('statistics.topVotedAnswers.title'),
      description: t('statistics.topVotedAnswers.description'),
      unit: 'votes',
    },
    {
      title: t('statistics.topVotedCorrectAnswers.title'),
      description: t('statistics.topVotedCorrectAnswers.description'),
      unit: 'votes',
    },
  ];

  if (disabled.questions) {
    return null;
  }

  if ((error || topStatistics === undefined) && !loading) {
    return (
      <WarningPanel severity="error" title={t('statistics.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  let content: ReactElement[];

  if (loading) {
    content = [
      <CardTab>
        <Flex justify="center" className={styles.loadingBox}>
          <Progress />
        </Flex>
      </CardTab>,
    ];
  } else if (topStatistics && topStatistics.length > 0) {
    content = topStatistics?.map((stats, index) => {
      return (
        <CardTab label={tabData[index].title} key={tabData[index].title}>
          <RankingCard
            description={tabData[index].description}
            limit={props.limit}
            statistic={stats}
            unit={tabData[index].unit}
          />
        </CardTab>
      );
    });
  } else {
    content = [
      <CardTab>
        <Flex justify="center" className={styles.loadingBox}>
          {t('statistics.notAvailable')}
        </Flex>
      </CardTab>,
    ];
  }

  return (
    <div className={styles.root}>
      <TabbedCard title={props.title || t('statistics.ranking')}>
        {content}
      </TabbedCard>
    </div>
  );
};
