import React, { useCallback } from 'react';
import { Stat } from '@drodil/backstage-plugin-qeta-common';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useIsDarkTheme } from '../../hooks/useIsDarkTheme';
import { useTranslation } from '../../hooks';
import { isGlobalStat, isUserStat } from './util';

export type QetaStatsChartClassKey =
  | 'tooltipLabel'
  | 'tooltipWrapper'
  | 'xAxis'
  | 'lineChart'
  | 'barChart';

const useStyles = makeStyles(
  theme =>
    createStyles({
      tooltipLabel: {
        color: theme.palette.text.primary,
      },
      tooltipWrapper: {
        backgroundColor: `${theme.palette.background.default} !important`,
        border: 'none !important',
      },
      xAxis: {
        color: `${theme.palette.text.primary} !important`,
      },
      lineChart: {},
      barChart: {},
    }),
  { name: 'QetaStatsChart' },
);

type StatType = {
  dataKey:
    | 'totalViews'
    | 'totalQuestions'
    | 'totalAnswers'
    | 'totalComments'
    | 'totalVotes'
    | 'totalUsers'
    | 'totalTags'
    | 'totalArticles'
    | 'totalFollowers';
  name: string;
  color: string;
  enabled: boolean;
  globalStat: boolean;
  userStat: boolean;
};

const DEFAULT_STATS: StatType[] = [
  {
    dataKey: 'totalViews',
    name: 'Total views',
    color: '#8884d8',
    enabled: false,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalQuestions',
    name: 'Total questions',
    color: '#82ca9d',
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalAnswers',
    name: 'Total answers',
    color: '#ff7300',
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalComments',
    name: 'Total comments',
    color: '#739973',
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalVotes',
    name: 'Total votes',
    color: '#d88884',
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalUsers',
    name: 'Total users',
    color: '#ff0000',
    enabled: true,
    globalStat: true,
    userStat: false,
  },
  {
    dataKey: 'totalTags',
    name: 'Total tags',
    color: '#ff00ff',
    enabled: true,
    globalStat: true,
    userStat: false,
  },
  {
    dataKey: 'totalArticles',
    name: 'Total articles',
    color: '#00ff00',
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalFollowers',
    name: 'Total followers',
    color: '#ff0000',
    enabled: true,
    globalStat: false,
    userStat: true,
  },
];

const useChartState = (data: Stat[]) => {
  const styles = useStyles();
  const isDark = useIsDarkTheme();
  const globalStats = isGlobalStat(data[0]);
  const isUserStats = isUserStat(data[0]);
  const [stats, setStats] = React.useState<StatType[]>(
    DEFAULT_STATS.filter(stat => {
      if (globalStats && !stat.globalStat) {
        return false;
      }
      return !(isUserStats && !stat.userStat);
    }),
  );

  const toggleStat = useCallback(
    (name: string) => {
      setStats(prev =>
        prev.map(stat =>
          stat.name === name ? { ...stat, enabled: !stat.enabled } : stat,
        ),
      );
    },
    [setStats],
  );
  const isDisabled = useCallback(
    (name: string) => {
      return stats.find(stat => stat.name === name)?.enabled === false;
    },
    [stats],
  );

  return { styles, isDark, toggleStat, stats, isDisabled };
};

const StatsBarChart = (props: { data: Stat[] }) => {
  const { styles, isDark, stats, toggleStat, isDisabled } = useChartState(
    props.data,
  );
  const localStyles = useStyles();
  return (
    <ResponsiveContainer height={400} width="100%">
      <BarChart
        data={props.data}
        width={900}
        height={300}
        className={localStyles.barChart}
      >
        <ChartTooltip
          labelClassName={styles.tooltipLabel}
          wrapperClassName={styles.tooltipWrapper}
          cursor={{ fill: isDark ? '#4f4f4f' : '#f5f5f5' }}
        />
        {stats.map(stat => (
          <Bar
            key={stat.dataKey}
            dataKey={stat.enabled ? stat.dataKey : 'hidden'}
            name={stat.name}
            fill={stat.color}
          />
        ))}
        <CartesianGrid stroke="#ccc" />
        <XAxis
          dataKey="date"
          tickFormatter={(tick: string) => new Date(tick).toDateString()}
          axisLine={{ stroke: isDark ? 'white' : 'black' }}
          tickLine={{ stroke: isDark ? 'white' : 'black' }}
          tick={{ fill: isDark ? 'white' : 'black' }}
        />
        <YAxis
          allowDecimals={false}
          axisLine={{ stroke: isDark ? 'white' : 'black' }}
          tickLine={{ stroke: isDark ? 'white' : 'black' }}
          tick={{ fill: isDark ? 'white' : 'black' }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ cursor: 'pointer' }}
          formatter={data => {
            return isDisabled(data) ? `[ ] ${data}` : `[x] ${data}`;
          }}
          onClick={data => {
            if (data.value) {
              toggleStat(data.value as string);
            }
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const StatsLineChart = (props: { data: Stat[] }) => {
  const { styles, isDark, stats, toggleStat, isDisabled } = useChartState(
    props.data,
  );
  const localStyles = useStyles();
  return (
    <ResponsiveContainer height={400} width="100%">
      <LineChart
        data={props.data}
        width={900}
        height={300}
        className={localStyles.lineChart}
      >
        <ChartTooltip
          labelClassName={styles.tooltipLabel}
          wrapperClassName={styles.tooltipWrapper}
          cursor={{ fill: isDark ? '#4f4f4f' : '#f5f5f5' }}
        />
        {stats.map(stat => (
          <Line
            key={stat.dataKey}
            dataKey={stat.enabled ? stat.dataKey : 'hidden'}
            name={stat.name}
            stroke={stat.color}
          />
        ))}
        <CartesianGrid stroke="#ccc" />
        <XAxis
          dataKey="date"
          tickFormatter={(tick: string) => new Date(tick).toDateString()}
          axisLine={{ stroke: isDark ? 'white' : 'black' }}
          tickLine={{ stroke: isDark ? 'white' : 'black' }}
          tick={{ fill: isDark ? 'white' : 'black' }}
        />
        <YAxis
          allowDecimals={false}
          axisLine={{ stroke: isDark ? 'white' : 'black' }}
          tickLine={{ stroke: isDark ? 'white' : 'black' }}
          tick={{ fill: isDark ? 'white' : 'black' }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ cursor: 'pointer' }}
          formatter={data => {
            return isDisabled(data) ? `[ ] ${data}` : `[x] ${data}`;
          }}
          onClick={data => {
            if (data.value) {
              toggleStat(data.value as string);
            }
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const StatsChart = (props: { data: Stat[] }) => {
  const { t } = useTranslation();
  const [chart, setChart] = React.useState<'line' | 'bar'>('line');

  if (!props.data || props.data.length === 0) {
    return <Typography variant="subtitle1">{t('stats.noStats')}</Typography>;
  }
  const data = props.data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(d => ({ ...d, hidden: 0 }));

  return (
    <>
      {chart === 'line' ? (
        <StatsLineChart data={data} />
      ) : (
        <StatsBarChart data={data} />
      )}
      <ButtonGroup aria-label="Chart type" style={{ float: 'right' }}>
        <IconButton
          aria-label="Line chart"
          onClick={() => {
            setChart('line');
          }}
          size="large"
        >
          <ShowChartIcon />
        </IconButton>
        <IconButton
          aria-label="Bar chart"
          onClick={() => {
            setChart('bar');
          }}
          size="large"
        >
          <BarChartIcon />
        </IconButton>
      </ButtonGroup>
    </>
  );
};
