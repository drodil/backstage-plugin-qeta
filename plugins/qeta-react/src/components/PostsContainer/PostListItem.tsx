import { Avatar, Chip, Grid, Typography, useTheme } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  PostResponse,
  PostType,
  QetaSignal,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, questionRouteRef } from '../../routes';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { useSignal } from '@backstage/plugin-signals-react';
import { VoteButtons } from '../Buttons/VoteButtons';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { capitalize } from 'lodash';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import HelpOutlined from '@material-ui/icons/HelpOutlined';
import { useStyles, useTranslation } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import { UserLink } from '../Links';

export interface PostListItemProps {
  post: PostResponse;
  entity?: string;
  type?: PostType;
}

export const PostListItem = (props: PostListItemProps) => {
  const { post, entity, type } = props;

  const [correctAnswer, setCorrectAnswer] = useState(post.correctAnswer);
  const [answersCount, setAnswersCount] = useState(post.answersCount);
  const [views, setViews] = useState(post.views);
  const { t } = useTranslation();
  const styles = useStyles();
  const theme = useTheme();

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${post.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setCorrectAnswer(lastSignal.correctAnswer);
      setAnswersCount(lastSignal.answersCount);
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const { name, initials, user } = useEntityAuthor(post);

  const route = post.type === 'question' ? questionRoute : articleRoute;
  const href = entity
    ? `${route({
        id: post.id.toString(10),
      })}?entity=${entity}`
    : route({ id: post.id.toString(10) });

  return (
    <Grid
      container
      spacing={0}
      className={styles.questionListItem}
      justifyContent="flex-start"
    >
      <Grid container item xs={1} justifyContent="center">
        <div className={styles.questionCardVote}>
          <VoteButtons entity={post} />
          <FavoriteButton entity={post} />
        </div>
      </Grid>
      <Grid item xs={11} className={styles.questionListItemContent}>
        <Grid container spacing={1}>
          <Grid
            item
            xs={12}
            style={{ marginLeft: '0px', paddingLeft: '0px', paddingTop: '0px' }}
          >
            {type === undefined && (
              <Chip
                color="secondary"
                size="small"
                label={`${capitalize(post.type)}`}
                icon={
                  post.type === 'question' ? (
                    <HelpOutlined />
                  ) : (
                    <CollectionsBookmarkIcon />
                  )
                }
              />
            )}
            {post.type === 'question' && (
              <Chip
                variant="outlined"
                size="small"
                label={t('common.answers', {
                  count: answersCount,
                })}
                style={{
                  userSelect: 'none',
                  // eslint-disable-next-line no-nested-ternary
                  borderColor: correctAnswer
                    ? theme.palette.success.main
                    : answersCount === 0
                    ? theme.palette.warning.main
                    : undefined,
                  marginBottom: 0,
                }}
              />
            )}
            <Chip
              variant="outlined"
              size="small"
              style={{ border: 'none', marginBottom: '0' }}
              label={t('common.viewsShort', {
                count: views,
              })}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="h5"
              component="div"
              style={{ marginTop: '3px' }}
            >
              <Link to={href} className="qetaPostListItemQuestionBtn">
                {post.title}
              </Link>
            </Typography>
            <Typography
              variant="caption"
              noWrap
              component="div"
              className="qetaPostListItemContent"
              style={{ marginBottom: '5px' }}
            >
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(post.content), 150),
              )}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TagsAndEntities entity={post} />
            <Typography
              variant="caption"
              display="inline"
              className={`${styles.questionListItemAuthor} qetaPostListItemAuthor`}
            >
              <Avatar
                src={user?.spec?.profile?.picture}
                className={styles.questionListItemAvatar}
                alt={name}
                variant="rounded"
              >
                {initials}
              </Avatar>
              <UserLink entityRef={post.author} />{' '}
              <Link to={href} className="qetaPostListItemQuestionBtn">
                <RelativeTimeWithTooltip value={post.created} />
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
