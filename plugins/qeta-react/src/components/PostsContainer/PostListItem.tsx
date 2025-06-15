import { Link } from '@backstage/core-components';
import { useEffect, useState } from 'react';
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
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import { VoteButtonContainer } from '../Utility/VoteButtonContainer';
import { UserLink } from '../Links';
import {
  Chip,
  Grid,
  makeStyles,
  Typography,
  useTheme,
} from '@material-ui/core';
import { SmallAvatar } from '../Utility/SmallAvatar';

export interface PostListItemProps {
  post: PostResponse;
  entity?: string;
  type?: PostType;
}

const useStyles = makeStyles(() => ({
  author: {
    alignItems: 'center',
    display: 'flex',
    height: '24px',
  },
  timestamp: {
    marginLeft: '0.3em',
  },
}));

export const PostListItem = (props: PostListItemProps) => {
  const { post, entity, type } = props;

  const [correctAnswer, setCorrectAnswer] = useState(post.correctAnswer);
  const [answersCount, setAnswersCount] = useState(post.answersCount);
  const [views, setViews] = useState(post.views);
  const { t } = useTranslationRef(qetaTranslationRef);
  const styles = useStyles();

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
  const theme = useTheme();

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
      style={{ padding: '0.7em', paddingBottom: '1.0em' }}
    >
      <Grid item style={{ paddingTop: '0em', marginTop: '-0.5em' }}>
        <VoteButtonContainer>
          <VoteButtons entity={post} />
          <FavoriteButton entity={post} />
        </VoteButtonContainer>
      </Grid>
      <Grid
        item
        style={{ display: 'inline-block', width: 'calc(100% - 53px)' }}
      >
        <Grid container>
          <Grid
            item
            container
            alignItems="center"
            spacing={0}
            justifyContent="space-between"
            xs={12}
            style={{
              paddingTop: '0',
              paddingBottom: '0.5em',
              marginLeft: '-0.2em',
            }}
          >
            <Grid item style={{ display: 'flex', alignItems: 'center' }}>
              {type === undefined && (
                <Chip
                  color="secondary"
                  size="small"
                  style={{ marginBottom: 0 }}
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
                  style={{
                    marginBottom: 0,
                    userSelect: 'none',
                    // eslint-disable-next-line no-nested-ternary
                    borderColor: correctAnswer
                      ? theme.palette.success.main
                      : answersCount === 0
                      ? theme.palette.warning.main
                      : undefined,
                  }}
                  label={t('common.answers', {
                    count: answersCount,
                  })}
                />
              )}
              <Chip
                variant="outlined"
                size="small"
                style={{ marginBottom: 0 }}
                label={t('common.viewsShort', {
                  count: views,
                })}
              />
            </Grid>
            <Grid item>
              <Typography
                variant="caption"
                display="inline"
                className={styles.author}
              >
                <SmallAvatar
                  src={user?.spec?.profile?.picture}
                  alt={name}
                  variant="rounded"
                >
                  {initials}
                </SmallAvatar>
                <UserLink entityRef={post.author} anonymous={post.anonymous} />{' '}
                <Link to={href} className={styles.timestamp}>
                  <RelativeTimeWithTooltip value={post.created} />
                </Link>
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ paddingTop: '0px' }}>
            <Typography variant="h5" component="div">
              <Link to={href} className="qetaPostListItemQuestionBtn">
                {post.title}
              </Link>
            </Typography>
            <Typography
              variant="body2"
              noWrap
              component="div"
              className="qetaPostListItemContent"
              style={{ marginTop: '0.6em' }}
            >
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(post.content), 150),
              )}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TagsAndEntities entity={post} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
