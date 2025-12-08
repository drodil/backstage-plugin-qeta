import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Avatar, Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useState } from 'react';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { ArticleButtons } from './ArticleButtons';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { WarningPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import { DraftBanner } from '../Utility/DraftBanner';
import { DeletedBanner } from '../Utility/DeletedBanner.tsx';
import { getPostDisplayDate } from '../../utils/utils';

export type QetaArticleContentClassKey =
  | 'content'
  | 'headerImage'
  | 'commentSection'
  | 'commentSectionContainer';

export const useStyles = makeStyles(
  theme => {
    return {
      content: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        marginBottom: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.background.paper}`,
      },
      headerImage: {
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2),
        height: '300px',
        objectFit: 'cover',
        width: '100%',
        border: `1px solid ${theme.palette.background.paper}`,
        boxShadow: theme.shadows[1],
      },
      commentSection: {
        borderBottom: `1px solid ${theme.palette.background.paper}`,
        paddingBottom: theme.spacing(2),
        marginBottom: theme.spacing(2),
        marginLeft: 0,
      },
      commentSectionContainer: {
        marginTop: theme.spacing(4),
      },
    };
  },
  { name: 'QetaArticle' },
);

export const ArticleContent = (props: {
  post: PostResponse;
  views: number;
}) => {
  const { post, views } = props;
  const styles = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { name, initials, user } = useEntityAuthor(post);
  const [postEntity, setPostEntity] = useState(post);
  const onCommentAction = (q: PostResponse, _?: AnswerResponse) => {
    setPostEntity(q);
  };

  if (post.type !== 'article') {
    return (
      <WarningPanel title="Not found" message="Could not find the article" />
    );
  }

  return (
    <>
      <Typography variant="h2">{postEntity.title}</Typography>
      {postEntity.status === 'draft' && <DraftBanner />}
      {postEntity.status === 'deleted' && <DeletedBanner />}
      <Grid container alignItems="center">
        <Grid item>
          <Avatar
            src={user?.spec?.profile?.picture}
            className="qetaAvatar avatar"
            alt={name}
            variant="rounded"
          >
            {initials}
          </Avatar>
        </Grid>
        <Grid item>
          <Typography variant="subtitle1">{name}</Typography>
          <Typography variant="caption">
            {t('common.viewsCount', { count: views })} {' · '}
            {t('authorBox.postedAtTime')}{' '}
            <RelativeTimeWithTooltip value={getPostDisplayDate(postEntity)} />
          </Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <ArticleButtons post={postEntity} />
        </Grid>
      </Grid>
      {postEntity.headerImage && (
        <img
          src={post.headerImage}
          alt={post.title}
          onError={e => (e.currentTarget.style.display = 'none')}
          className={styles.headerImage}
        />
      )}
      <MarkdownRenderer
        content={postEntity.content}
        className={styles.content}
        showToc
      />
      {post.status === 'active' && (
        <Box className={styles.commentSectionContainer}>
          <Typography variant="h6">{t('common.comments')}</Typography>
          <CommentSection
            className={styles.commentSection}
            post={postEntity}
            onCommentAction={onCommentAction}
            showProminentButton
          />
        </Box>
      )}
      <Grid container>
        <Grid item xs={12}>
          <TagsAndEntities entity={postEntity} />
        </Grid>
      </Grid>
    </>
  );
};
