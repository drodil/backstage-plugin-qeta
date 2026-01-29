import {
  PostHighlightListContent,
  qetaTranslationRef,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { makeStyles } from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';

const useStyles = makeStyles(theme => ({
  container: {
    borderLeft: `3px solid ${theme.palette.info.main}`,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(33, 150, 243, 0.08)'
        : 'rgba(33, 150, 243, 0.05)',
    borderRadius: theme.shape.borderRadius,
    padding: `${theme.spacing(1)}px 2px ${theme.spacing(1)}px`,
    marginBottom: theme.spacing(2),
  },
  title: {
    color: theme.palette.info.main,
    fontWeight: 600,
  },
}));

export const LinkedPosts = (props: { postId: number }) => {
  const { postId } = props;
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  const {
    value: posts,
    loading,
    error,
  } = useQetaApi(api => api.getLinkedPosts(postId), [postId]);

  if (error || !posts || posts.length === 0) {
    return null;
  }

  return (
    <PostHighlightListContent
      title={t('rightMenu.linkedPosts')}
      posts={posts}
      loading={loading}
      containerClassName={classes.container}
      titleClassName={classes.title}
      icon={<LinkIcon fontSize="small" />}
    />
  );
};
