import { useParams } from 'react-router-dom';
import {
  CollectionFollowButton,
  DeleteButton,
  EditButton,
  PostsContainer,
  qetaTranslationRef,
  TagsAndEntities,
  useQetaApi,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { Alert, Box, Grid, Header, Skeleton } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

export const CollectionPage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  const {
    value: collection,
    loading,
    error,
  } = useQetaApi(api => api.getCollection(id), [id]);

  if (disabled.collections) {
    return null;
  }

  if (loading) {
    return <Skeleton width="100%" height={200} />;
  }

  if (error || collection === undefined) {
    return (
      <Alert
        status="danger"
        title={t('questionPage.errorLoading', {})}
        description={error?.message}
      />
    );
  }

  return (
    <>
      <Header
        title={collection.title}
        description={collection.description}
        metadata={[
          {
            label: t('metadata.posts'),
            value: collection.postsCount,
          },
          {
            label: t('metadata.followers'),
            value: collection.followers,
          },
          {
            label: t('metadata.owner'),
            value: <EntityRefLink entityRef={collection.owner} />,
          },
        ]}
        customActions={
          <>
            <EditButton entity={collection} compact />
            <DeleteButton entity={collection} compact />
            <CollectionFollowButton collection={collection} />
          </>
        }
      />
      <Grid.Root columns={{ sm: '12' }} gap="6">
        <Grid.Item colSpan={{ sm: '12' }}>
          <Box>
            <TagsAndEntities entity={collection} />
          </Box>
        </Grid.Item>
        <Grid.Item colSpan={{ sm: '12' }}>
          <PostsContainer
            collectionId={collection.id}
            orderBy="rank"
            allowRanking={collection.canEdit}
            defaultView="grid"
            prefix="collection-posts"
          />
        </Grid.Item>
      </Grid.Root>
    </>
  );
};
