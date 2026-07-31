import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import { PostResponse, QetaSignal } from '@drodil/backstage-plugin-qeta-common';
import {
  AddToCollectionButton,
  CreateLinkButton,
  DeletedBanner,
  DraftBanner,
  LinkCard,
  PostHistoryButton,
  qetaTranslationRef,
  RelativeTimeWithTooltip,
  UpdatedByLink,
  useQetaApi,
  FollowPostButton,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Alert, Box, Flex, Header, Skeleton, Text } from '@backstage/ui';

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

  const getDescription = (q: PostResponse) => {
    return (
      <Flex align="center" gap="1" style={{ flexWrap: 'wrap' }}>
        <Text as="span" variant="body-small">
          {t('authorBox.postedAtTime')}{' '}
          <RelativeTimeWithTooltip value={q.created} />
        </Text>
        {q.updated && (
          <Text as="span" variant="body-small">
            {' · '}
            {t('authorBox.updatedAtTime')}{' '}
            <RelativeTimeWithTooltip value={q.updated} />{' '}
            {t('authorBox.updatedBy')} <UpdatedByLink entity={q} />
          </Text>
        )}
        <Text as="span" variant="body-small">
          {' · '}
          {t('common.clicksCount', { count: score })}
        </Text>
      </Flex>
    );
  };

  return (
    <>
      <Header
        title={post.title}
        customActions={
          <>
            <PostHistoryButton post={post} onRestore={retry} />
            <FollowPostButton post={post} />
            <CreateLinkButton />
            <AddToCollectionButton post={post} />
          </>
        }
      />
      <Box style={{ marginBottom: 'var(--bui-space-4)' }}>
        {getDescription(post)}
      </Box>
      {post.status === 'draft' && <DraftBanner />}
      {post.status === 'deleted' && <DeletedBanner />}
      <LinkCard link={post} />
    </>
  );
};
