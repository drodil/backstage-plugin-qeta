import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import { WarningPanel } from '@backstage/core-components';
import { PostResponse, QetaSignal } from '@drodil/backstage-plugin-qeta-common';
import {
  AddToCollectionButton,
  ContentHeader,
  CreateLinkButton,
  DeletedBanner,
  DraftBanner,
  LinkCard,
  PostHistoryButton,
  qetaTranslationRef,
  RelativeTimeWithTooltip,
  UpdatedByLink,
  useQetaApi,
  FaviconItem,
  qetaApiRef,
  FollowPostButton,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Flex, Skeleton, Text } from '@backstage/ui';
import { useApi } from '@backstage/core-plugin-api';

export const LinkPage = () => {
  const { id } = useParams();
  const qetaApi = useApi(qetaApiRef);
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
      <WarningPanel severity="error" title={t('linkPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (post.type !== 'link') {
    return <WarningPanel title="Not found" message={t('linkPage.notFound')} />;
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
      <ContentHeader
        title={
          post.url ? (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
              data-testid="link-title"
              onClick={event => {
                event.stopPropagation();
                qetaApi.clickLink(post.id);
              }}
            >
              {post.title}
            </a>
          ) : (
            post.title
          )
        }
        titleIcon={post.url ? <FaviconItem entity={post} /> : undefined}
        description={getDescription(post)}
      >
        <PostHistoryButton post={post} onRestore={retry} />
        <FollowPostButton post={post} />
        <CreateLinkButton />
        <AddToCollectionButton post={post} />
      </ContentHeader>
      {post.status === 'draft' && <DraftBanner />}
      {post.status === 'deleted' && <DeletedBanner />}
      <LinkCard link={post} />
    </>
  );
};
