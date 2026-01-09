import { Fragment, ReactNode } from 'react';
import {
  Post,
  PostsQuery,
  PostType,
  removeMarkdownFormatting,
  selectByPostType,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useQetaApi, useUserInfo } from '../../hooks';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';
import { Link } from 'react-router-dom';
import { RightList, RightListContainer } from '../Utility/RightList';
import {
  Avatar,
  Box,
  Grid,
  ListItem,
  ListItemText,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  articleRouteRef,
  linkRouteRef,
  questionRouteRef,
} from '../../routes.ts';
import { useRouteRef } from '@backstage/core-plugin-api';
import numeral from 'numeral';
import QuestionAnswerOutlined from '@material-ui/icons/QuestionAnswerOutlined';
import ChatBubbleOutline from '@material-ui/icons/ChatBubbleOutline';
import VisibilityOutlined from '@material-ui/icons/VisibilityOutlined';
import ThumbUpOutlined from '@material-ui/icons/ThumbUpOutlined';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';

const useStyles = makeStyles(theme => ({
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px',
    minHeight: 28,
    cursor: 'pointer',
    transition: 'background 0.2s',
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
  emptyItem: {
    padding: '0 0 0 0.6rem',
  },
  voteBox: {
    minWidth: 28,
    maxWidth: 28,
    height: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    fontWeight: 600,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(0.5),
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
  },
  voteBoxPositive: {
    background: theme.palette.success.main,
    color: theme.palette.getContrastText(theme.palette.success.main),
  },
  voteBoxNegative: {
    background: theme.palette.error.main,
    color: theme.palette.getContrastText(theme.palette.error.main),
  },
  listItemText: {
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
  },
}));
function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

const PostTooltip = (props: { post: Post }) => {
  const { post } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const { name, initials, user } = useUserInfo(
    post.author,
    post.anonymous ?? false,
  );

  return (
    <Grid container style={{ padding: '0.5em' }} spacing={1}>
      <Grid item xs={12}>
        <Typography
          variant="subtitle1"
          style={{
            fontWeight: 600,
            marginBottom: '0.5em',
          }}
        >
          {post.title}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5em',
          }}
        >
          <Avatar
            src={user?.spec?.profile?.picture}
            alt={name}
            variant="rounded"
            style={{ width: '20px', height: '20px', marginRight: '0.5em' }}
          >
            {initials}
          </Avatar>
          <Typography variant="body2" style={{ marginRight: '0.5em' }}>
            {name}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            style={{ marginTop: '0.5em' }}
          >
            <RelativeTimeWithTooltip value={post.created} />
          </Typography>
        </Box>
      </Grid>

      {post.tags && post.tags.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="caption" color="textSecondary">
            {post.tags.map(tag => `#${tag}`).join(' ')}
          </Typography>
        </Grid>
      )}

      {post.content && (
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            {truncate(removeMarkdownFormatting(post.content), 150)}
          </Typography>
        </Grid>
      )}

      <Grid item xs={12}>
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          style={{ gap: '1em' }}
        >
          <Box display="flex" alignItems="center">
            <ThumbUpOutlined
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {post.score} {t('common.votes', {})}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <VisibilityOutlined
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {post.views} {t('common.views', {})}
            </Typography>
          </Box>

          {post.type === 'question' && (
            <Box display="flex" alignItems="center">
              <QuestionAnswerOutlined
                style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
              />
              <Typography variant="caption">
                {post.answersCount} {t('common.answers', {})}
              </Typography>
            </Box>
          )}

          <Box display="flex" alignItems="center">
            <ChatBubbleOutline
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {post.commentsCount} {t('common.comments', {})}
            </Typography>
          </Box>

          {post.correctAnswer && (
            <Box display="flex" alignItems="center" color="success.main">
              <CheckCircleOutline
                style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
              />
              <Typography variant="caption">
                {t('questionPage.correctAnswer', {})}
              </Typography>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export const PostHighlightListContent = (props: {
  loading?: boolean;
  error?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  posts: Post[];
  title: string;
  icon?: ReactNode;
  noPostsLabel?: string;
  disableLoading?: boolean;
}) => {
  const { loading, error, posts, title, icon, noPostsLabel, disableLoading } =
    props;
  const classes = useStyles();
  const tooltipClasses = useTooltipStyles();
  const { t } = useTranslationRef(qetaTranslationRef);
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);

  return (
    <RightListContainer>
      <RightList title={title} icon={icon}>
        {loading &&
          !disableLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <ListItem className={classes.listItem} dense key={`skeleton-${i}`}>
              <Box className={classes.voteBox}>
                <Skeleton variant="rect" width="100%" height="100%" />
              </Box>
              <Skeleton variant="text" width="80%" />
            </ListItem>
          ))}
        {error && (
          <ListItem className={classes.emptyItem} dense>
            <ListItemText
              primary={t('highlights.loadError')}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>
        )}
        {!error && !loading && posts.length === 0 && noPostsLabel && (
          <ListItem className={classes.emptyItem} dense>
            <ListItemText
              primary={noPostsLabel}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>
        )}
        {!error &&
          posts.map(q => {
            const route = selectByPostType(
              q.type,
              questionRoute,
              articleRoute,
              linkRoute,
            );
            const href = route({ id: q.id.toString(10) });
            const vote = formatShortNumber(q.score);
            let voteBoxClass = classes.voteBox;
            if (q.correctAnswer) {
              voteBoxClass = `${classes.voteBox} ${classes.voteBoxPositive}`;
            } else if (q.score < 0) {
              voteBoxClass = `${classes.voteBox} ${classes.voteBoxNegative}`;
            }
            return (
              <Fragment key={q.id}>
                <Tooltip
                  arrow
                  title={<PostTooltip post={q} />}
                  enterDelay={400}
                  classes={{
                    tooltip: tooltipClasses.tooltip,
                    arrow: tooltipClasses.tooltipArrow,
                  }}
                >
                  <ListItem
                    dense
                    button
                    className={classes.listItem}
                    component={Link}
                    to={href}
                    aria-label={q.title}
                  >
                    <Box className={voteBoxClass}>{vote}</Box>
                    <ListItemText
                      primary={q.title}
                      classes={{ primary: classes.listItemText }}
                    />
                  </ListItem>
                </Tooltip>
              </Fragment>
            );
          })}
      </RightList>
    </RightListContainer>
  );
};
export const PostHighlightList = (props: {
  type: string;
  title: string;
  noQuestionsLabel: string;
  icon?: ReactNode;
  options?: PostsQuery;
  postType?: PostType;
}) => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api =>
      api.getPostsList(props.type, {
        limit: 5,
        type: props.postType,
        includeTags: false,
        includeAttachments: false,
        includeComments: false,
        includeAnswers: false,
        includeVotes: false,
        includeEntities: false,
        includeExperts: false,
        ...props.options,
      }),
    [],
  );

  const posts = response?.posts ?? [];

  return (
    <PostHighlightListContent
      posts={posts}
      loading={loading}
      error={error}
      title={props.title}
      icon={props.icon}
      noPostsLabel={props.noQuestionsLabel}
    />
  );
};
