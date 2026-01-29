import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import { WarningPanel } from '@backstage/core-components';
import { Article, QetaSignal } from '@drodil/backstage-plugin-qeta-common';
import {
  AddToCollectionButton,
  AIAnswerCard,
  ArticleContent,
  ContentHeader,
  qetaTranslationRef,
  useQetaApi,
  WriteArticleButton,
  FollowPostButton,
} from '@drodil/backstage-plugin-qeta-react';
import { Container } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import LibraryBooksOutlined from '@material-ui/icons/LibraryBooksOutlined';

export const ArticlePage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);

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

  if (post.type !== 'article') {
    return (
      <WarningPanel title="Not found" message={t('articlePage.notFound')} />
    );
  }

  return (
    <>
      <ContentHeader
        title={post.title}
        titleIcon={<LibraryBooksOutlined fontSize="large" />}
      >
        <FollowPostButton post={post} />
        <WriteArticleButton />
        <AddToCollectionButton post={post} />
      </ContentHeader>
      <Container maxWidth={false}>
        <AIAnswerCard
          article={post as Article}
          style={{ marginBottom: '2em' }}
        />
        <ArticleContent post={post} views={views} />
      </Container>
    </>
  );
};
