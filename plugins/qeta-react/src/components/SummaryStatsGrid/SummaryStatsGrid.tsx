import {
  GlobalStat,
  StatisticsResponse,
  UserStat,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { isGlobalStat, isUserStat } from '../StatsChart/util';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import CommentIcon from '@material-ui/icons/Comment';
import DescriptionIcon from '@material-ui/icons/Description';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import PeopleIcon from '@material-ui/icons/People';
import TagIcon from '@material-ui/icons/LocalOffer';
import PersonIcon from '@material-ui/icons/Person';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
  card: {
    height: '100%',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[4],
    },
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  value: {
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
  },
  title: {
    color: theme.palette.text.secondary,
  },
  icon: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  gridItem: {
    marginBottom: theme.spacing(1),
  },
}));

const SummaryCard = (props: {
  title: string;
  value?: number;
  icon: React.ReactNode;
}) => {
  const { title, value, icon } = props;
  const classes = useStyles();

  if (value === undefined) {
    return null;
  }

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <div className={classes.icon}>{icon}</div>
        <div>
          <Typography variant="h5" className={classes.value}>
            {value}
          </Typography>
          <Typography variant="subtitle2" className={classes.title}>
            {title}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

export const SummaryStatsGrid = (props: {
  stats: StatisticsResponse<UserStat | GlobalStat>;
}) => {
  const { stats } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useStyles();

  if (!stats.summary) {
    return <Typography variant="subtitle1">{t('stats.noStats')}</Typography>;
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} className={classes.gridItem}>
          <SummaryCard
            title={t('stats.questions')}
            value={stats.summary.totalQuestions}
            icon={<QuestionAnswerIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} className={classes.gridItem}>
          <SummaryCard
            title={t('stats.answers')}
            value={stats.summary.totalAnswers}
            icon={<QuestionAnswerIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} className={classes.gridItem}>
          <SummaryCard
            title={t('stats.articles')}
            value={stats.summary.totalArticles}
            icon={<DescriptionIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} className={classes.gridItem}>
          <SummaryCard
            title={t('stats.comments')}
            value={stats.summary.totalComments}
            icon={<CommentIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} className={classes.gridItem}>
          <SummaryCard
            title={t('stats.views')}
            value={stats.summary.totalViews}
            icon={<VisibilityIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} className={classes.gridItem}>
          <SummaryCard
            title={t('stats.votes')}
            value={stats.summary.totalVotes}
            icon={<ThumbUpIcon />}
          />
        </Grid>
        {isGlobalStat(stats.summary) && (
          <Grid item xs={12} sm={6} md={4} className={classes.gridItem}>
            <SummaryCard
              title={t('stats.users')}
              value={stats.summary!.totalUsers}
              icon={<PeopleIcon />}
            />
          </Grid>
        )}
        {isGlobalStat(stats.summary) && (
          <Grid item xs={12} sm={6} md={4} className={classes.gridItem}>
            <SummaryCard
              title={t('stats.tags')}
              value={stats.summary!.totalTags}
              icon={<TagIcon />}
            />
          </Grid>
        )}
        {isUserStat(stats.summary) && (
          <Grid item xs={12} sm={6} md={4} className={classes.gridItem}>
            <SummaryCard
              title={t('stats.followers')}
              value={stats.summary!.totalFollowers}
              icon={<PersonIcon />}
            />
          </Grid>
        )}
      </Grid>
    </div>
  );
};
