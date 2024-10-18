import React from 'react';
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
import TimeLineIcon from '@material-ui/icons/TimeLine';
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

const StatsBarChart = (props: { data: GlobalStat[] | UserStat[] }) => {
  const styles = useStyles();
  const isDark = useIsDarkTheme();
  const { data } = props;
  const globalStats = isGlobalStat(data[0]);
  return (
    <ResponsiveContainer height={400} width="100%">
      <BarChart data={data} width={900} height={300}>
        <Tooltip
          labelClassName={styles.tooltipLabel}
          wrapperClassName={styles.tooltipWrapper}
          cursor={{ fill: isDark ? '#4f4f4f' : '#f5f5f5' }}
        />
        <Bar name="Total views" dataKey="totalViews" fill="#8884d8" />
        <Bar name="Total questions" dataKey="totalQuestions" fill="#82ca9d" />
        <Bar name="Total answers" dataKey="totalAnswers" fill="#ff7300" />
        <Bar name="Total comments" dataKey="totalComments" fill="#739973" />
        {globalStats && (
          <Bar name="Total users" dataKey="totalUsers" fill="#ff0000" />
        )}
        <Bar name="Total votes" dataKey="totalVotes" fill="#d88884" />
        {globalStats && (
          <Bar name="Total tags" dataKey="totalTags" fill="#ff00ff" />
        )}
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
        <Legend verticalAlign="top" height={36} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const StatsLineChart = (props: { data: GlobalStat[] | UserStat[] }) => {
  const styles = useStyles();
  const isDark = useIsDarkTheme();
  const { data } = props;
  const globalStats = isGlobalStat(data[0]);
  return (
    <ResponsiveContainer height={400} width="100%">
      <LineChart data={data} width={900} height={300}>
        <Tooltip
          labelClassName={styles.tooltipLabel}
          wrapperClassName={styles.tooltipWrapper}
          cursor={{ fill: isDark ? '#4f4f4f' : '#f5f5f5' }}
        />
        <Line name="Total views" dataKey="totalViews" stroke="#8884d8" />
        <Line
          name="Total questions"
          dataKey="totalQuestions"
          stroke="#82ca9d"
        />
        <Line name="Total answers" dataKey="totalAnswers" stroke="#ff7300" />
        <Line name="Total comments" dataKey="totalComments" stroke="#739973" />
        {globalStats && (
          <Line name="Total users" dataKey="totalUsers" stroke="#ff0000" />
        )}
        <Line name="Total votes" dataKey="totalVotes" stroke="#d88884" />
        {globalStats && (
          <Line name="Total tags" dataKey="totalTags" stroke="#ff00ff" />
        )}
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
        <Legend verticalAlign="top" height={36} />
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
  const data = props.data.reverse();

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
          <TimeLineIcon />
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
