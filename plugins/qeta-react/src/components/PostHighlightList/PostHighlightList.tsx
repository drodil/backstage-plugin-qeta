import { Fragment, ReactNode } from 'react';
import {
  Post,
  PostsQuery,
  PostType,
  selectByPostType,
} from '@drodil/backstage-plugin-qeta-common';
import { useQetaApi } from '../../hooks';
import { Link } from 'react-router-dom';
import { RightList, RightListContainer } from '../Utility/RightList';
import {
  Box,
  ListItem,
  ListItemText,
  makeStyles,
  Tooltip,
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
                <ListItem
                  dense
                  button
                  className={classes.listItem}
                  component={Link}
                  to={href}
                  aria-label={q.title}
                >
                  <Box className={voteBoxClass}>{vote}</Box>
                  <Tooltip title={q.title} arrow>
                    <ListItemText
                      primary={q.title}
                      classes={{ primary: classes.listItemText }}
                    />
                  </Tooltip>
                </ListItem>
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
