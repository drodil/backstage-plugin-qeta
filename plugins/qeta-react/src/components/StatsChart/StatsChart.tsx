import { useState, useCallback } from 'react';
import { Stat } from '@drodil/backstage-plugin-qeta-common';
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
  Tooltip as MuiTooltip,
  CircularProgress,
  Box,
} from '@material-ui/core';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import BarChartIcon from '@material-ui/icons/BarChart';
import { useIsDarkTheme } from '../../hooks/useIsDarkTheme';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { isGlobalStat, isUserStat } from './util';

export type QetaStatsChartClassKey =
  | 'tooltipLabel'
  | 'tooltipWrapper'
  | 'xAxis'
  | 'lineChart'
  | 'barChart';

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      tooltipLabel: {
        color: theme.palette.text.primary,
      },
      tooltipWrapper: {
        backgroundColor: `${theme.palette.background.default} !important`,
        border: 'none !important',
        padding: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[2],
      },
      xAxis: {
        color: `${theme.palette.text.primary} !important`,
      },
      lineChart: {},
      barChart: {},
      chartContainer: {
        position: 'relative',
        width: '100%',
        height: 500,
      },
      loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1,
      },
      chartTypeButton: {
        '&.Mui-selected': {
          backgroundColor: theme.palette.action.selected,
        },
      },
      errorMessage: {
        color: theme.palette.error.main,
        textAlign: 'center',
        padding: theme.spacing(2),
      },
      legend: {
        '& .recharts-legend-item-text': {
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize,
          color: theme.palette.text.primary,
        },
      },
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

const getDefaultStats = (isDark: boolean, t: any): StatType[] => [
  {
    dataKey: 'totalViews',
    name: t('stats.totalViews'),
    color: isDark ? '#a3bffa' : '#1e40af', // blue-400 / blue-900
    enabled: false,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalQuestions',
    name: t('stats.totalQuestions'),
    color: isDark ? '#6ee7b7' : '#047857', // green-300 / green-800
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalAnswers',
    name: t('stats.totalAnswers'),
    color: isDark ? '#fbbf24' : '#b45309', // yellow-400 / yellow-800
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalComments',
    name: t('stats.totalComments'),
    color: isDark ? '#2dd4bf' : '#0e7490', // teal-400 / cyan-800
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalVotes',
    name: t('stats.totalVotes'),
    color: isDark ? '#f87171' : '#991b1b', // red-400 / red-800
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalUsers',
    name: t('stats.totalUsers'),
    color: isDark ? '#a78bfa' : '#6d28d9', // purple-400 / purple-800
    enabled: true,
    globalStat: true,
    userStat: false,
  },
  {
    dataKey: 'totalTags',
    name: t('stats.totalTags'),
    color: isDark ? '#34d399' : '#065f46', // emerald-400 / emerald-900
    enabled: true,
    globalStat: true,
    userStat: false,
  },
  {
    dataKey: 'totalArticles',
    name: t('stats.totalArticles'),
    color: isDark ? '#60a5fa' : '#1d4ed8', // blue-400 / blue-800
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'totalFollowers',
    name: t('stats.totalFollowers'),
    color: isDark ? '#f472b6' : '#be185d', // pink-400 / pink-800
    enabled: true,
    globalStat: false,
    userStat: true,
  },
];

const useChartState = (data: Stat[]) => {
  const styles = useStyles();
  const isDark = useIsDarkTheme();
  const { t } = useTranslationRef(qetaTranslationRef);
  const globalStats = isGlobalStat(data[0]);
  const isUserStats = isUserStat(data[0]);
  const [stats, setStats] = useState<StatType[]>(
    getDefaultStats(isDark, t).filter(stat => {
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

const legendWrapperStyle = {
  cursor: 'pointer',
  display: 'flex',
  gap: 16,
  marginLeft: 48,
};

// Custom tick renderer for angled date labels
const XAxisTick = (props: any) => {
  const { x, y, payload, fill } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-6}
        y={-12}
        dy={16}
        textAnchor="end"
        fill={fill}
        transform="rotate(-90)"
        fontSize="12"
      >
        {new Date(payload.value).toDateString()}
      </text>
    </g>
  );
};

const StatsBarChart = (props: { data: Stat[] }) => {
  const { styles, isDark, stats, toggleStat, isDisabled } = useChartState(
    props.data,
  );
  const localStyles = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <ResponsiveContainer height={500} width="100%">
      <BarChart
        data={props.data}
        width={1000}
        height={400}
        margin={{ bottom: 80, right: 30 }}
        className={localStyles.barChart}
        aria-label={t('stats.barChart')}
      >
        <Tooltip
          labelClassName={styles.tooltipLabel}
          wrapperClassName={styles.tooltipWrapper}
          cursor={{ fill: isDark ? '#4f4f4f' : '#f5f5f5' }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div role="tooltip" aria-label={t('stats.tooltip')}>
                  <p>{new Date(label).toLocaleDateString()}</p>
                  {payload.map((entry: any) => (
                    <p key={entry.name} style={{ color: entry.color }}>
                      {entry.name}: {entry.value}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        {stats.map(stat => (
          <Bar
            key={stat.dataKey}
            dataKey={stat.enabled ? stat.dataKey : 'hidden'}
            name={stat.name}
            fill={stat.color}
            aria-label={stat.name}
          />
        ))}
        <CartesianGrid stroke={isDark ? '#4f4f4f' : '#e0e0e0'} />
        <XAxis
          dataKey="date"
          tickFormatter={(tick: string) => new Date(tick).toDateString()}
          axisLine={{ stroke: isDark ? 'white' : 'black' }}
          tickLine={{ stroke: isDark ? 'white' : 'black' }}
          tick={<XAxisTick fill={isDark ? 'white' : 'black'} />}
          angle={-90}
          dy={10}
          aria-label={t('stats.dateAxis')}
        />
        <YAxis
          allowDecimals={false}
          axisLine={{ stroke: isDark ? 'white' : 'black' }}
          tickLine={{ stroke: isDark ? 'white' : 'black' }}
          tick={{ fill: isDark ? 'white' : 'black' }}
          aria-label={t('stats.valueAxis')}
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={legendWrapperStyle}
          className={localStyles.legend}
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
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <ResponsiveContainer height={500} width="100%">
      <LineChart
        data={props.data}
        width={1000}
        height={400}
        margin={{ bottom: 80, right: 30 }}
        className={localStyles.lineChart}
      >
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
          tick={<XAxisTick fill={isDark ? 'white' : 'black'} />}
          angle={-45}
          dy={10}
          aria-label={t('stats.dateAxis')}
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
          wrapperStyle={legendWrapperStyle}
          className={localStyles.legend}
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

export const StatsChart = (props: {
  data: Stat[];
  loading?: boolean;
  error?: string;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const [chart, setChart] = useState<'line' | 'bar'>('line');
  const classes = useStyles();

  if (props.error) {
    return (
      <Typography variant="subtitle1" className={classes.errorMessage}>
        {props.error}
      </Typography>
    );
  }

  if (!props.data || props.data.length === 0) {
    return <Typography variant="subtitle1">{t('stats.noStats')}</Typography>;
  }

  const data = props.data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(d => ({ ...d, hidden: 0 }));

  return (
    <Box className={classes.chartContainer}>
      {props.loading && (
        <div className={classes.loadingOverlay}>
          <CircularProgress />
        </div>
      )}
      {chart === 'line' ? (
        <StatsLineChart data={data} />
      ) : (
        <StatsBarChart data={data} />
      )}
      <ButtonGroup
        aria-label={t('stats.chartType')}
        style={{ float: 'right' }}
        role="radiogroup"
      >
        <MuiTooltip title={t('stats.lineChart')}>
          <IconButton
            aria-label={t('stats.lineChart')}
            onClick={() => setChart('line')}
            className={classes.chartTypeButton}
            aria-checked={chart === 'line'}
            role="radio"
          >
            <ShowChartIcon />
          </IconButton>
        </MuiTooltip>
        <MuiTooltip title={t('stats.barChart')}>
          <IconButton
            aria-label={t('stats.barChart')}
            onClick={() => setChart('bar')}
            className={classes.chartTypeButton}
            aria-checked={chart === 'bar'}
            role="radio"
          >
            <BarChartIcon />
          </IconButton>
        </MuiTooltip>
      </ButtonGroup>
    </Box>
  );
};
