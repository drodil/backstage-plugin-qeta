import { Fragment, ReactNode } from 'react';
import { PostsQuery, PostType } from '@drodil/backstage-plugin-qeta-common';
import { useQetaApi } from '../../hooks';
import { useNavigate } from 'react-router-dom';
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
  questionRouteRef
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
  const { t } = useTranslationRef(qetaTranslationRef);
  const navigate = useNavigate();
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);

  const classes = useStyles();

  const posts = response?.posts ?? [];

  return (
    <RightListContainer>
      <RightList title={props.title} icon={props.icon}>
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <ListItem className={classes.emptyItem} dense key={`skeleton-${i}`}>
              <Skeleton variant="rect" width="100%" height={18} />
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
        {!error && !loading && posts.length === 0 && (
          <ListItem className={classes.emptyItem} dense>
            <ListItemText
              primary={props.noQuestionsLabel}
              classes={{ primary: classes.listItemText }}
            />
          </ListItem>
        )}
        {!error &&
          posts.map(q => {
            const route = (() => {
              switch (q.type) {
                case 'article':
                  return articleRoute;
                case 'link':
                  return linkRoute;
                case 'question':
                default:
                  return questionRoute;
              }
            })();
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
                  onClick={() => navigate(route({ id: q.id.toString(10) }))}
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
