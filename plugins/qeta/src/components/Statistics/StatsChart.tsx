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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import { useIsDarkTheme, useTranslation } from '../../utils/hooks';

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

export const StatsChart = (props: { data: GlobalStat[] | UserStat[] }) => {
  const styles = useStyles();
  const isDark = useIsDarkTheme();
  const { t } = useTranslation();

  if (props.data.length === 0) {
    return <Typography variant="subtitle1">{t('stats.noStats')}</Typography>;
  }
  const globalStats = isGlobalStat(props.data[0]);

  return (
    <ResponsiveContainer height={300} width="100%">
      <BarChart data={props.data} width={900} height={300}>
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
        <Bar name="Total votes" dataKey="totalVotes" fill="#224422" />
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
