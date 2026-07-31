import { useNavigate, useParams } from 'react-router-dom';
import {
  CollectionFollowButton,
  ContentHeaderButton,
  DeleteModal,
  collectionEditRouteRef,
  qetaTranslationRef,
  useQetaApi,
  PostsContainer,
  TagsAndEntities,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { Alert, Box, Grid, Header, Skeleton } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useState } from 'react';
import {
  RiDeleteBinLine,
  RiEditLine,
  RiGroupLine,
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
            label: t('common.postsLabel', {
              count: collection.postsCount,
              itemType: 'post',
            }),
            value: (
              <>
                <RiQuestionAnswerLine size={16} /> {collection.postsCount}
              </>
            ),
          },
          {
            label: t('common.followersLabel', {
              count: collection.followers,
            }),
            value: (
              <>
                <RiGroupLine size={16} /> {collection.followers}
              </>
            ),
          },
        ]}
        customActions={
          <>
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
