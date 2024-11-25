import React, { ReactElement, ReactNode } from 'react';
import {
  CardTab,
  Progress,
  TabbedCard,
  WarningPanel,
} from '@backstage/core-components';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { StatisticResponse } from '@drodil/backstage-plugin-qeta-common';
import { TrophyIcon } from './TrophyIcon';
import { UserLink } from '../Links';
import { useQetaApi, useTranslation } from '../../hooks';

type RankingIcon = {
  iconsByRanking: Map<number, ReactNode>;
  userRankingIcon: ReactNode;
};

const DefaultRankingIcons = new Map<number, ReactNode>([
  [
    1,
    <TrophyIcon
      style={{ color: '#DAA520', height: '2.2em', width: '2.2em' }}
    />,
  ],
  [
    2,
    <TrophyIcon
      style={{ color: '#C0C0C0', height: '2.1em', width: '2.1em' }}
    />,
  ],
  [3, <TrophyIcon style={{ color: '#B87333', height: '2em', width: '2em' }} />],
]);

const DefaultUserIcon = <TrophyIcon style={{ height: '2em', width: '2em' }} />;

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
    <ListItem className="qetaRankingCardRow">
      <ListItemAvatar>
        <Avatar>{rankingIcon}</Avatar>
      </ListItemAvatar>

      <ListItemText
        disableTypography
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
        primary={
          <div style={{ display: 'flex' }}>
            <Typography
              style={{ marginRight: '10px', fontWeight: 400 }}
              variant="subtitle1"
            >
              {`${ordinalPosition}`} <UserLink entityRef={userRef ?? ''} />
            </Typography>
          </div>
        }
      />

      <div>
        <Typography variant="subtitle1">
          {props?.total} {props.unit}
        </Typography>
      </div>
    </ListItem>
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
    <div style={{ display: 'block' }} className="qetaRankingCard">
      <span className="qetaRankingCardDescription">{props.description}</span>
      <List className="qetaRankingCardList">
        {rankingStats?.map(authorStats => {
          return (
            <RankingRow
              total={authorStats.total || 0}
              position={authorStats.position || 0}
              userRef={authorStats.author}
              unit={props.unit}
            />
          );
        })}
        {!rankingStats?.some(
          authorStats =>
            authorStats.author === props.statistic?.loggedUser?.author,
        ) && (
          <>
            <hr />
            <RankingRow
              total={props.statistic?.loggedUser?.total || 0}
              position={props.statistic?.loggedUser?.position || 0}
              userRef={props.statistic?.loggedUser?.author}
              unit={props.unit}
            />
          </>
        )}
      </List>
    </div>
  );
};

export const TopRankingUsers = (props: {
  title?: string;
  hideTitle?: boolean;
  limit?: number;
}) => {
  const { t } = useTranslation();
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
        <Progress />
      </CardTab>,
    ];
  } else if (topStatistics && topStatistics.length > 0) {
    content = topStatistics?.map((stats, index) => {
      return (
        <CardTab label={tabData[index].title}>
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
    content = [<CardTab>{t('statistics.notAvailable')}</CardTab>];
  }

  return (
    <TabbedCard title={props.title || t('statistics.ranking')}>
      {content}
    </TabbedCard>
  );
};
