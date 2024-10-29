import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import { Skeleton } from '@material-ui/lab';
import { ContentHeader, WarningPanel } from '@backstage/core-components';
import { QetaSignal } from '@drodil/backstage-plugin-qeta-common';
import {
  AddToCollectionButton,
  ArticleContent,
  useQetaApi,
  useTranslation,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { Container } from '@material-ui/core';

export const ArticlePage = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const [views, setViews] = useState(0);

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${id}`);

  const {
    value: post,
    loading,
    error,
  } = useQetaApi(api => api.getPost(id), [id]);

  useEffect(() => {
    if (post) {
      setViews(post.views);
    }
  }, [post]);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  if (loading) {
    return <Skeleton variant="rect" height={200} />;
  }

  if (error || post === undefined) {
    return (
      <WarningPanel severity="error" title={t('articlePage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  return (
    <>
      <ContentHeader>
        <WriteArticleButton />
        <AddToCollectionButton post={post} />
      </ContentHeader>
      <Container maxWidth="md">
        <ArticleContent post={post} views={views} />
      </Container>
    </>
  );
};
