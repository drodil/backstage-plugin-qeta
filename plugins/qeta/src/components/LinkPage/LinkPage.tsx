import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import { PostResponse, QetaSignal } from '@drodil/backstage-plugin-qeta-common';
import {
  AddToCollectionButton,
  AuthorHeaderItem,
  DeleteButton,
  DeletedBanner,
  DraftBanner,
  EditButton,
  FollowPostButton,
  LinkCard,
  PostHistoryButton,
  qetaTranslationRef,
  RelativeTimeWithTooltip,
  RestoreButton,
  useQetaApi,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Alert, Header, HeaderMetadataItem, Skeleton } from '@backstage/ui';

export const LinkPage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const [score, setScore] = useState(0);
  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${id}`);

  const {
    value: post,
    loading,
    error,
    retry,
  } = useQetaApi(api => api.getPost(id), [id]);

  useEffect(() => {
    if (post) {
      setScore(post.score);
    }
  }, [post]);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setScore(lastSignal.score);
    }
  }, [lastSignal]);

  if (disabled.links) {
    return null;
  }

  if (loading) {
    return <Skeleton width="100%" height={200} />;
  }

  if (error || post === undefined) {
    return (
      <Alert
        status="danger"
        title={t('linkPage.errorLoading')}
        description={error?.message}
      />
    );
  }

  if (post.type !== 'link') {
    return (
      <Alert
        status="warning"
        title="Not found"
        description={t('linkPage.notFound')}
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
      label: t('postHeader.clicks'),
      value: score,
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
      {post.status === 'draft' && <DraftBanner />}
      {post.status === 'deleted' && <DeletedBanner />}
      <LinkCard link={post} />
    </>
  );
};
