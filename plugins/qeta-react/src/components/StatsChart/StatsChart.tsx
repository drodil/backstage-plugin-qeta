import { useState, useCallback } from 'react';
import { Stat } from '@drodil/backstage-plugin-qeta-common';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Box,
  ButtonIcon,
  Flex,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { RiBarChartLine, RiLineChartLine } from '@remixicon/react';
import { useIsDarkTheme } from '../../hooks/useIsDarkTheme';
import { useQetaConfig } from '../../hooks/useQetaConfig';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { isGlobalStat, isUserStat } from './util';
import styles from './StatsChart.module.css';

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
    | 'totalLinks'
    | 'totalFollowers'
    | 'reputation'
    | 'answerScore'
    | 'postScore'
    | 'correctAnswers'
    | 'activeUsers';
  name: string;
  color: string;
  enabled: boolean;
  globalStat: boolean;
  userStat: boolean;
};

const getDefaultStats = (isDark: boolean, t: any): StatType[] => [
  {
    dataKey: 'reputation',
    name: t('stats.reputation'),
    color: isDark ? '#fcd34d' : '#d97706', // amber-300 / amber-600
    enabled: false,
    globalStat: false,
    userStat: true,
  },
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
    dataKey: 'activeUsers',
    name: t('stats.activeUsers'),
    color: isDark ? '#a78bfa' : '#6d28d9', // purple-400 / purple-800
    enabled: true,
    globalStat: true,
    userStat: false,
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
  {
    dataKey: 'totalLinks',
    name: t('stats.totalLinks'),
    color: isDark ? '#26c6da' : '#00838f', // teal-400 / teal-900
    enabled: true,
    globalStat: true,
    userStat: true,
  },
  {
    dataKey: 'answerScore',
    name: t('stats.answerScore'),
    color: isDark ? '#a855f7' : '#7e22ce', // purple-500 / purple-700
    enabled: false,
    globalStat: false,
    userStat: true,
  },
  {
    dataKey: 'postScore',
    name: t('stats.postScore'),
    color: isDark ? '#22c55e' : '#15803d', // green-500 / green-700
    enabled: false,
    globalStat: false,
    userStat: true,
  },
  {
    dataKey: 'correctAnswers',
    name: t('stats.correctAnswers'),
    color: isDark ? '#eab308' : '#a16207', // yellow-500 / yellow-700
    enabled: true,
    globalStat: false,
    userStat: true,
  },
];

const useChartState = (data: Stat[]) => {
  const isDark = useIsDarkTheme();
  const { disabled } = useQetaConfig();
  const { t } = useTranslationRef(qetaTranslationRef);
  const globalStats = data && data.length > 0 ? isGlobalStat(data[0]) : false;
  const isUserStats = data && data.length > 0 ? isUserStat(data[0]) : false;
  const [stats, setStats] = useState<StatType[]>(
    getDefaultStats(isDark, t).filter(stat => {
      if (globalStats && !stat.globalStat) {
        return false;
      }
      if (isUserStats && !stat.userStat) {
        return false;
      }
      if (
        disabled.questions &&
        ['totalQuestions', 'totalAnswers', 'correctAnswers'].includes(
          stat.dataKey,
        )
      ) {
        return false;
      }
      if (disabled.articles && stat.dataKey === 'totalArticles') {
        return false;
      }
      if (disabled.links && stat.dataKey === 'totalLinks') {
        return false;
      }
      if (disabled.tags && stat.dataKey === 'totalTags') {
        return false;
      }
      return true;
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

  return { isDark, toggleStat, stats, isDisabled };
};

// Custom tick renderer for angled date labels
const XAxisTick = (props: any) => {
  const { x, y, payload, fill, fontFamily } = props;
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
        style={{ fontFamily }}
      >
        {new Date(payload.value).toDateString()}
      </text>
    </g>
  );
};

const StatsBarChart = (props: {
  data: any[];
  stats: StatType[];
  isDark: boolean;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <ResponsiveContainer height={500} width="100%">
      <BarChart
        data={props.data}
        width={1000}
        height={400}
        margin={{ bottom: 80, right: 30 }}
        className={styles.barChart}
        aria-label={t('stats.barChart')}
      >
        <RechartsTooltip
          labelClassName={styles.tooltipLabel}
          wrapperClassName={styles.tooltipWrapper}
          cursor={{ fill: props.isDark ? '#4f4f4f' : '#f5f5f5' }}
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
        {props.stats.map(stat => (
          <Bar
            key={stat.dataKey}
            dataKey={stat.enabled ? stat.dataKey : 'hidden'}
            name={stat.name}
            fill={stat.color}
            aria-label={stat.name}
          />
        ))}
        <CartesianGrid stroke={props.isDark ? '#4f4f4f' : '#e0e0e0'} />
        <XAxis
          dataKey="date"
          tickFormatter={(tick: string) => new Date(tick).toDateString()}
          axisLine={{ stroke: props.isDark ? 'white' : 'black' }}
          tickLine={{ stroke: props.isDark ? 'white' : 'black' }}
          tick={
            <XAxisTick
              fill={props.isDark ? 'white' : 'black'}
              fontFamily="var(--bui-font-regular)"
            />
          }
          angle={-90}
          dy={10}
          aria-label={t('stats.dateAxis')}
        />
        <YAxis
          allowDecimals={false}
          axisLine={{ stroke: props.isDark ? 'white' : 'black' }}
          tickLine={{ stroke: props.isDark ? 'white' : 'black' }}
          tick={{ fill: props.isDark ? 'white' : 'black' }}
          aria-label={t('stats.valueAxis')}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const StatsLineChart = (props: {
  data: any[];
  stats: StatType[];
  isDark: boolean;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <ResponsiveContainer height={500} width="100%">
      <LineChart
        data={props.data}
        width={1000}
        height={400}
        margin={{ bottom: 80, right: 30 }}
        className={styles.lineChart}
      >
        <RechartsTooltip
          labelClassName={styles.tooltipLabel}
          wrapperClassName={styles.tooltipWrapper}
          cursor={{ fill: props.isDark ? '#4f4f4f' : '#f5f5f5' }}
        />
        {props.stats.map(stat => (
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
          axisLine={{ stroke: props.isDark ? 'white' : 'black' }}
          tickLine={{ stroke: props.isDark ? 'white' : 'black' }}
          tick={
            <XAxisTick
              fill={props.isDark ? 'white' : 'black'}
              fontFamily="var(--bui-font-regular)"
            />
          }
          angle={-45}
          dy={10}
          aria-label={t('stats.dateAxis')}
        />
        <YAxis
          allowDecimals={false}
          axisLine={{ stroke: props.isDark ? 'white' : 'black' }}
          tickLine={{ stroke: props.isDark ? 'white' : 'black' }}
          tick={{ fill: props.isDark ? 'white' : 'black' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const StatsChart = (props: {
  data: Stat[];
  summary?: Record<string, number | Date | string>;
  loading?: boolean;
  error?: string;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const [chart, setChart] = useState<'line' | 'bar'>('line');
  const { stats, isDark, toggleStat } = useChartState(props.data);

  if (props.error) {
    return (
      <Text as="div" variant="body-large" className={styles.errorMessage}>
        {props.error}
      </Text>
    );
  }

  if (!props.data || props.data.length === 0) {
    return (
      <Text as="div" variant="body-large">
        {t('stats.noStats')}
      </Text>
    );
  }

  const data = props.data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(d => ({ ...d, hidden: 0 }));

  return (
    <Box>
      <Flex
        justify="center"
        gap="4"
        className={styles.statButtons}
        style={{ flexWrap: 'wrap' }}
      >
        {stats.map(stat => {
          const value = props.summary ? props.summary[stat.dataKey] : undefined;
          const isActive = stat.enabled;
          const defaultBorder = isDark
            ? 'rgba(255,255,255,0.12)'
            : 'rgba(0,0,0,0.12)';
          const borderColor = isActive ? stat.color : defaultBorder;
          const activeBg = isDark
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.05)';
          const backgroundColor = isActive ? activeBg : 'transparent';

          return (
            <Box
              key={stat.dataKey}
              className={styles.statBox}
              style={{
                borderColor,
                backgroundColor,
                opacity: isActive ? 1 : 0.5,
              }}
              onClick={() => toggleStat(stat.name)}
            >
              <Text
                as="div"
                variant="title-medium"
                weight="bold"
                style={{ color: stat.color }}
              >
                {value instanceof Date
                  ? value.toLocaleDateString()
                  : (value ?? '-')}
              </Text>
              <Text as="div" variant="body-small" color="secondary">
                {stat.name}
              </Text>
            </Box>
          );
        })}
      </Flex>
      <Box className={styles.chartContainer}>
        {props.loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
          </div>
        )}
        {chart === 'line' ? (
          <StatsLineChart data={data} stats={stats} isDark={isDark} />
        ) : (
          <StatsBarChart data={data} stats={stats} isDark={isDark} />
        )}
        <Flex
          justify="end"
          gap="1"
          role="radiogroup"
          aria-label={t('stats.chartType')}
          className={styles.chartTypeGroup}
        >
          <TooltipTrigger>
            <ButtonIcon
              aria-label={t('stats.lineChart')}
              icon={<RiLineChartLine size={16} />}
              variant={chart === 'line' ? 'secondary' : 'tertiary'}
              size="small"
              onPress={() => setChart('line')}
              {...({
                role: 'radio',
                'aria-checked': chart === 'line',
              } as Record<string, unknown>)}
            />
            <Tooltip>{t('stats.lineChart')}</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <ButtonIcon
              aria-label={t('stats.barChart')}
              icon={<RiBarChartLine size={16} />}
              variant={chart === 'bar' ? 'secondary' : 'tertiary'}
              size="small"
              onPress={() => setChart('bar')}
              {...({ role: 'radio', 'aria-checked': chart === 'bar' } as Record<
                string,
                unknown
              >)}
            />
            <Tooltip>{t('stats.barChart')}</Tooltip>
          </TooltipTrigger>
        </Flex>
      </Box>
    </Box>
  );
};
