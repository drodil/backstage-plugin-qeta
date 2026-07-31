import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import {
  Article,
  PostResponse,
  QetaSignal,
} from '@drodil/backstage-plugin-qeta-common';
import {
  AddToCollectionButton,
  AIAnswerCard,
  ArticleContent,
  AuthorHeaderItem,
  DeleteButton,
  EditButton,
  FollowPostButton,
  PostHistoryButton,
  qetaTranslationRef,
  RelativeTimeWithTooltip,
  RestoreButton,
  useQetaApi,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import {
  Alert,
  Box,
  Header,
  HeaderMetadataItem,
  Skeleton,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const ArticlePage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  const [views, setViews] = useState(0);

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${id}`);

  const {
    value: post,
    loading,
    error,
    retry,
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

  if (disabled.articles) {
    return null;
  }

  if (loading) {
    return <Skeleton width="100%" height={200} />;
  }

  if (error || post === undefined) {
    return (
      <Alert
        status="danger"
        title={t('articlePage.errorLoading')}
        description={error?.message}
      />
    );
  }

  if (post.type !== 'article') {
    return (
      <Alert
        status="warning"
        title="Not found"
        description={t('articlePage.notFound')}
      />
    );
  }

  const getMetadata = (q: PostResponse): HeaderMetadataItem[] => {
    const metadata: HeaderMetadataItem[] = [
      {
        label: t('postHeader.postedAtTime'),
        value: <RelativeTimeWithTooltip value={q.created} />,
      },
      {
        label: t('postHeader.author'),
        value: <AuthorHeaderItem userEntityRef={q.author} />,
      },
    ];

    if (q.updated) {
      metadata.push({
        label: t('postHeader.updatedAtTime'),
        value: <RelativeTimeWithTooltip value={q.updated} />,
      });
    }
    if (q.updatedBy) {
      metadata.push({
        label: t('postHeader.updatedBy'),
        value: <AuthorHeaderItem userEntityRef={q.updatedBy} />,
      });
    }
    metadata.push({
      label: t('postHeader.views'),
      value: views,
    });

    return metadata;
  };

  return (
    <>
      <Header
        title={post.title}
        metadata={getMetadata(post)}
        customActions={
          <>
            <EditButton entity={post} compact />
            <DeleteButton entity={post} compact />
            <RestoreButton entity={post} compact />
            <PostHistoryButton post={post} onRestore={retry} />
            <FollowPostButton post={post} />
            <AddToCollectionButton post={post} />
          </>
        }
      />
      <Box>
        <AIAnswerCard
          article={post as Article}
          style={{ marginBottom: '2em' }}
        />
        <ArticleContent post={post} views={views} />
      </Box>
    </>
  );
};
