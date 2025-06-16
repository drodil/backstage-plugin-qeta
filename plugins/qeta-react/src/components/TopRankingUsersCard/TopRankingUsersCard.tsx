import { ReactElement, ReactNode } from 'react';
import {
  CardTab,
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
  makeStyles,
  Typography,
  Paper,
  Box,
} from '@material-ui/core';
import { StatisticResponse } from '@drodil/backstage-plugin-qeta-common';
import { TrophyIcon } from './TrophyIcon';
import { UserLink } from '../Links';
import { useQetaApi } from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

const useStyles = makeStyles(theme => {
  return {
    root: {
      '& .MuiTabbedCard-root': {
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      '& .MuiCardHeader-root': {
        padding: theme.spacing(2, 3),
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
      '& .MuiTabs-root': {
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
    trophyIcon: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: '50%',
      boxSizing: 'border-box',
      padding: '0.5rem',
      height: 48,
      width: 48,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'scale(1.05)',
      },
    },
    votesText: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '16px',
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(0.5, 2),
      borderRadius: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    rankingCard: {
      padding: theme.spacing(2),
    },
    rankingCardDescription: {
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(2),
      fontSize: '0.9rem',
    },
    rankingCardList: {
      '& .MuiListItem-root': {
        marginBottom: theme.spacing(1),
        borderRadius: '8px',
        transition: 'background-color 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      },
    },
    rankingRow: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1, 2),
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
    },
    position: {
      fontWeight: 600,
      marginRight: theme.spacing(1),
      color: theme.palette.text.primary,
    },
    divider: {
      margin: theme.spacing(2, 0),
      opacity: 0.5,
    },
  };
});

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
  const classes = useStyles();
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
    <ListItem className={classes.rankingRow}>
      <ListItemAvatar>
        <Avatar className={classes.trophyIcon}>{rankingIcon}</Avatar>
      </ListItemAvatar>

      <ListItemText
        disableTypography
        className={classes.userInfo}
        primary={
          <Box display="flex" alignItems="center">
            <Typography className={classes.position} variant="subtitle1">
              {ordinalPosition}
            </Typography>
            <UserLink entityRef={userRef ?? ''} />
          </Box>
        }
      />

      <div className={classes.votesText}>
        <Typography variant="subtitle1" style={{ fontWeight: 500 }}>
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
  const classes = useStyles();
  const rankingStats = props.limit
    ? props.statistic?.ranking.slice(0, props.limit)
    : props.statistic?.ranking;

  return (
    <Paper elevation={0} className={classes.rankingCard}>
      <Typography className={classes.rankingCardDescription}>
        {props.description}
      </Typography>
      <List className={classes.rankingCardList}>
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
            <hr className={classes.divider} />
            <RankingRow
              total={props.statistic?.loggedUser?.total || 0}
              position={props.statistic?.loggedUser?.position || 0}
              userRef={props.statistic?.loggedUser?.author}
              unit={props.unit}
            />
          </>
        )}
      </List>
    </Paper>
  );
};

export const TopRankingUsers = (props: {
  title?: string;
  hideTitle?: boolean;
  limit?: number;
}) => {
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);
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
        <Box display="flex" justifyContent="center" p={3}>
          <Progress />
        </Box>
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
        <Box display="flex" justifyContent="center" p={3}>
          {t('statistics.notAvailable')}
        </Box>
      </CardTab>,
    ];
  }

  return (
    <div className={classes.root}>
      <TabbedCard title={props.title || t('statistics.ranking')}>
        {content}
      </TabbedCard>
    </div>
  );
};
