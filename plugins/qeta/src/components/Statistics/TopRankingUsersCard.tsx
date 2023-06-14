import React, { ReactElement, ReactNode } from 'react';
import {
  CardTab,
  Link,
  Progress,
  TabbedCard,
  WarningPanel,
} from '@backstage/core-components';
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { StatisticResponse } from '@drodil/backstage-plugin-qeta-common';
import { useQetaApi } from '../../utils/hooks';
import { TrophyIcon } from './TrophyIcon';
import { useStyles } from './styles';

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
  votes: number;
  position: number;
  rankingIcon?: RankingIcon;
}) => {
  const classes = useStyles();

  const ordinalPosition = props?.position ? getOrdinal(props?.position) : '';
  const name = props?.userRef?.split('/')[1];

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
        <Avatar className={classes.trophyIcon}>{rankingIcon}</Avatar>
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
            >{`${ordinalPosition}`}</Typography>
            <Link
              to={`/qeta/users/${name}`}
              variant="subtitle1"
            >{`${name}`}</Link>
          </div>
        }
      />

      <div className={classes.votesText}>
        <Typography variant="subtitle1">{props?.votes} votes</Typography>
      </div>
    </ListItem>
  );
};

export const RankingCard = (props: {
  limit?: number;
  description: string;
  statistic?: StatisticResponse;
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
              votes={authorStats.total || 0}
              position={authorStats.position || 0}
              userRef={authorStats.author}
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
              votes={props.statistic?.loggedUser?.total || 0}
              position={props.statistic?.loggedUser?.position || 0}
              userRef={props.statistic?.loggedUser?.author}
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
      title: 'Top Upvoted Questions',
      description: 'People who have the highest rated questions',
    },
    {
      title: 'Top Upvoted Answers',
      description: 'People who have the highest rated answers',
    },
    {
      title: 'Top Upvoted Correct Answers',
      description: 'People who have the highest rated correct answers',
    },
  ];

  if ((error || topStatistics === undefined) && !loading) {
    return (
      <WarningPanel severity="error" title="Could not load statistics.">
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
            limit={3}
            statistic={stats}
          />
        </CardTab>
      );
    });
  } else {
    content = [<CardTab>No statistics available</CardTab>];
  }

  return (
    <TabbedCard title={props.title || 'Ranking Q&A 🏆'}>{content}</TabbedCard>
  );
};
