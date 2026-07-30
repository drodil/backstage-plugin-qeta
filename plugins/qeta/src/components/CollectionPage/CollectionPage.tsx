import { useNavigate, useParams } from 'react-router-dom';
import {
  CollectionFollowButton,
  ContentHeader,
  ContentHeaderButton,
  ContentHeaderCard,
  DeleteModal,
  collectionEditRouteRef,
  qetaTranslationRef,
  useQetaApi,
  PostsContainer,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { WarningPanel } from '@backstage/core-components';
import { Grid, Skeleton } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useState } from 'react';
import {
  RiDeleteBinLine,
  RiEditLine,
  RiGroupLine,
  RiPlayListLine,
  RiQuestionAnswerLine,
} from '@remixicon/react';
import { useRouteRef } from '@backstage/core-plugin-api';

export const CollectionPage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const navigate = useNavigate();
  const editCollectionRoute = useRouteRef(collectionEditRouteRef);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);

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
      <WarningPanel severity="error" title={t('questionPage.errorLoading', {})}>
        {error?.message}
      </WarningPanel>
    );
  }

  return (
    <>
      <ContentHeader
        title={collection.title}
        titleIcon={<RiPlayListLine size={24} />}
      >
        <CollectionFollowButton collection={collection} />
        {collection.canEdit && (
          <ContentHeaderButton
            icon={<RiEditLine />}
            onClick={() =>
              editCollectionRoute &&
              navigate(
                editCollectionRoute({
                  id: collection.id.toString(10),
                }),
              )
            }
          >
            {t('templateList.editButton', {})}
          </ContentHeaderButton>
        )}
        {collection.canDelete && (
          <ContentHeaderButton
            icon={<RiDeleteBinLine />}
            color="secondary"
            onClick={handleDeleteModalOpen}
          >
            {t('templateList.deleteButton', {})}
          </ContentHeaderButton>
        )}
      </ContentHeader>
      <Grid.Root columns={{ sm: '12' }} gap="6">
        <Grid.Item colSpan={{ sm: '12' }}>
          <ContentHeaderCard
            description={collection.description}
            image={collection.headerImage}
            imageIcon={<RiPlayListLine size={80} />}
            tagsAndEntities={{ entity: collection }}
            stats={[
              {
                label: t('common.postsLabel', {
                  count: collection.postsCount,
                  itemType: 'post',
                }),
                value: collection.postsCount,
                icon: <RiQuestionAnswerLine size={16} />,
              },
              {
                label: t('common.followersLabel', {
                  count: collection.followers,
                }),
                value: collection.followers,
                icon: <RiGroupLine size={16} />,
              },
            ]}
          />
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
      {collection.canDelete && (
        <DeleteModal
          open={deleteModalOpen}
          onClose={handleDeleteModalClose}
          entity={collection}
        />
      )}
    </>
  );
};
