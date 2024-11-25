import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import { MarkdownRenderer } from '../MarkdownRenderer';
import React from 'react';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { ArticleButtons } from './ArticleButtons';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { WarningPanel } from '@backstage/core-components';
import { useTranslation } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import { styled } from '@mui/system';

const HeaderImage = styled('img', { name: 'QetaArticleHeaderImage' })(
  ({ theme }) => ({
    marginBottom: '2em',
    marginTop: '2em',
    height: '250px',
    objectFit: 'cover',
    width: '100%',
    borderColor: theme.palette.background.paper,
    borderStyle: 'solid',
    borderWidth: '1px',
  }),
);

export const ArticleContent = (props: {
  post: PostResponse;
  views: number;
}) => {
  const { post, views } = props;
  const { t } = useTranslation();
  const { name, initials, user } = useEntityAuthor(post);
  const [postEntity, setPostEntity] = React.useState(post);
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
            {t('common.views', { count: views })} {' · '}
            {t('authorBox.postedAtTime')}{' '}
            <RelativeTimeWithTooltip value={postEntity.created} />
          </Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12} marginTop={2}>
          <ArticleButtons post={postEntity} />
        </Grid>
        <Grid item xs={12}>
          {postEntity.headerImage && (
            <HeaderImage src={post.headerImage} alt={post.title} />
          )}
          <MarkdownRenderer
            content={postEntity.content}
            sx={{
              fontSize: '113% !important',
              paddingTop: postEntity.headerImage ? 2 : 4,
              paddingBottom: 4,
            }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            borderColor: 'background.paper',
            borderBottomStyle: 'solid',
            borderBottomWidth: '1px',
            paddingBottom: 4,
            marginBottom: 2,
          }}
        >
          <TagsAndEntities entity={postEntity} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">{t('common.comments')}</Typography>
          <CommentSection
            post={postEntity}
            onCommentDelete={onCommentAction}
            onCommentPost={onCommentAction}
            sx={{
              marginBottom: 2,
              paddingBottom: 2,
              marginLeft: '0',
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};
