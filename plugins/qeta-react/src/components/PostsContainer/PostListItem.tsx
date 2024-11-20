import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
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
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import HelpOutlined from '@mui/icons-material/HelpOutlined';
import { useTranslation } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import { VoteButtonContainer } from '../Styled/VoteButtonContainer';
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
      spacing={2}
      justifyContent="flex-start"
      sx={{ padding: '0.7rem', paddingBottom: '1.0rem' }}
    >
      <Grid item justifyContent="center" style={{ paddingTop: '0px' }}>
        <VoteButtonContainer>
          <VoteButtons entity={post} />
          <FavoriteButton entity={post} />
        </VoteButtonContainer>
      </Grid>
      <Grid item sx={{ display: 'inline-block', width: 'calc(100% - 80px)' }}>
        <Grid container>
          <Grid
            item
            xs={12}
            style={{
              paddingTop: '0.4rem',
              paddingBottom: '0.4rem',
              paddingLeft: '0.8rem',
            }}
          >
            {type === undefined && (
              <Chip
                color="secondary"
                size="small"
                label={`${capitalize(post.type)}`}
                sx={{ userSelect: 'none', marginBottom: 0 }}
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
                sx={theme => ({
                  userSelect: 'none',
                  // eslint-disable-next-line no-nested-ternary
                  borderColor: correctAnswer
                    ? theme.palette.success.main
                    : answersCount === 0
                    ? theme.palette.warning.main
                    : undefined,
                  marginBottom: 0,
                })}
                label={t('common.answers', {
                  count: answersCount,
                })}
              />
            )}
            <Chip
              variant="outlined"
              size="small"
              sx={{ userSelect: 'none', border: 'none', marginBottom: 0 }}
              label={t('common.viewsShort', {
                count: views,
              })}
            />
          </Grid>
          <Grid item xs={12} style={{ paddingTop: '0px' }}>
            <Typography variant="h5" component="div">
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
              style={{ display: 'inline', float: 'right' }}
            >
              <Avatar
                src={user?.spec?.profile?.picture}
                alt={name}
                variant="rounded"
                sx={{
                  display: 'inline-flex !important',
                  marginRight: '0.25rem',
                  fontSize: '1rem',
                  maxWidth: '1rem',
                  maxHeight: '1rem',
                }}
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
