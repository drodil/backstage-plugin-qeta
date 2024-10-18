import React, { useCallback } from 'react';
import {
  GlobalStat,
  Stat,
  UserStat,
} from '@drodil/backstage-plugin-qeta-common';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ButtonGroup,
  createStyles,
  IconButton,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { useIsDarkTheme, useTranslation } from '../../utils/hooks';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import BarChartIcon from '@material-ui/icons/BarChart';

const useStyles = makeStyles((theme: Theme) =>
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
  }),
);

const isGlobalStat = (stat: Stat): stat is GlobalStat => {
  return (stat as GlobalStat).totalUsers !== undefined;
};

type StatType = {
  dataKey:
    | 'totalViews'
    | 'totalQuestions'
    | 'totalAnswers'
    | 'totalComments'
    | 'totalVotes'
    | 'totalUsers'
    | 'totalTags';
  name: string;
  color: string;
  enabled: boolean;
  globalStat: boolean;
};

const DEFAULT_STATS: StatType[] = [
  {
    dataKey: 'totalViews',
    name: 'Total views',
    color: '#8884d8',
    enabled: false,
    globalStat: false,
  },
  {
    dataKey: 'totalQuestions',
    name: 'Total questions',
    color: '#82ca9d',
    enabled: true,
    globalStat: false,
  },
  {
    dataKey: 'totalAnswers',
    name: 'Total answers',
    color: '#ff7300',
    enabled: true,
    globalStat: false,
  },
  {
    dataKey: 'totalComments',
    name: 'Total comments',
    color: '#739973',
    enabled: true,
    globalStat: false,
  },
  {
    dataKey: 'totalVotes',
    name: 'Total votes',
    color: '#d88884',
    enabled: true,
    globalStat: false,
  },
  {
    dataKey: 'totalUsers',
    name: 'Total users',
    color: '#ff0000',
    enabled: true,
    globalStat: true,
  },
  {
    dataKey: 'totalTags',
    name: 'Total tags',
    color: '#ff00ff',
    enabled: true,
    globalStat: true,
  },
];

const useChartState = (data: GlobalStat[] | UserStat[]) => {
  const styles = useStyles();
  const isDark = useIsDarkTheme();
  const globalStats = isGlobalStat(data[0]);
  const [stats, setStats] = React.useState<StatType[]>(
    DEFAULT_STATS.filter(stat => {
      return globalStats || !stat.globalStat;
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

const StatsBarChart = (props: { data: GlobalStat[] | UserStat[] }) => {
  const { styles, isDark, stats, toggleStat, isDisabled } = useChartState(
    props.data,
  );
  return (
    <ResponsiveContainer height={400} width="100%">
      <BarChart data={props.data} width={900} height={300}>
        <Tooltip
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

const StatsLineChart = (props: { data: GlobalStat[] | UserStat[] }) => {
  const { styles, isDark, stats, toggleStat, isDisabled } = useChartState(
    props.data,
  );
  return (
    <ResponsiveContainer height={400} width="100%">
      <LineChart data={props.data} width={900} height={300}>
        <Tooltip
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

export const StatsChart = (props: { data: GlobalStat[] | UserStat[] }) => {
  const { t } = useTranslation();
  const [chart, setChart] = React.useState<'line' | 'bar'>('line');

  if (props.data.length === 0) {
    return <Typography variant="subtitle1">{t('stats.noStats')}</Typography>;
  }
  const data = props.data.reverse().map(d => ({ ...d, hidden: 0 }));

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
        >
          <ShowChartIcon />
        </IconButton>
        <IconButton
          aria-label="Bar chart"
          onClick={() => {
            setChart('bar');
          }}
        >
          <BarChartIcon />
        </IconButton>
      </ButtonGroup>
    </>
  );
};
