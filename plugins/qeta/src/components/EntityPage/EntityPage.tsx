import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useApi } from '@backstage/core-plugin-api';
import {
  AskQuestionButton,
  CreateLinkButton,
  EntitiesContainer,
  EntityFollowButton,
  PostsContainer,
  qetaTranslationRef,
  useQetaApi,
  useQetaConfig,
  WriteArticleButton,
  ContentHeaderCard,
  ContentHeader,
} from '@drodil/backstage-plugin-qeta-react';
import {
  EntityRefLink,
  useEntityPresentation,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { Box, Flex, Skeleton } from '@backstage/ui';
import {
  RiGroupLine,
  RiQuestionAnswerLine,
  RiShapesLine,
} from '@remixicon/react';
import { WarningPanel } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';

const SingleEntityPage = ({ entityRef }: { entityRef: string }) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const [entity, setEntity] = useState<Entity | undefined>(undefined);
  const { Icon } = useEntityPresentation(entityRef);
  const catalogApi = useApi(catalogApiRef);

  useEffect(() => {
    catalogApi.getEntityByRef(entityRef).then(e => setEntity(e));
  }, [catalogApi, entityRef]);

  const {
    value: resp,
    loading,
    error,
  } = useQetaApi(api => api.getEntity(entityRef), [entityRef]);

  if (disabled.entities) {
    return null;
  }

  if (loading) {
    return <Skeleton width="100%" height={200} />;
  }

  if (error || !resp) {
    return (
      <WarningPanel severity="error" title={t('questionPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  const title = (
    <Flex align="center">
      <EntityRefLink
        entityRef={resp.entityRef}
        defaultKind="Component"
        hideIcon
      />
    </Flex>
  );

  const description = `${entity?.kind} ${
    entity?.spec?.type ? `(${entity?.spec?.type})` : ''
  }`;

  return (
    <>
      <ContentHeader
        title={title}
        titleIcon={<RiShapesLine size={28} />}
        description={description}
      >
        <EntityFollowButton entityRef={resp.entityRef} />
        <AskQuestionButton entity={resp.entityRef} />
        <WriteArticleButton entity={resp.entityRef} />
        <CreateLinkButton entity={resp.entityRef} />
      </ContentHeader>
      {resp && (
        <ContentHeaderCard
          description={entity?.metadata?.description}
          imageIcon={
            Icon ? (
              <Box style={{ fontSize: '80px', display: 'flex' }}>
                <Icon fontSize="inherit" />
              </Box>
            ) : (
              <RiShapesLine size={80} />
            )
          }
          stats={[
            {
              label: t('common.postsLabel', {
                count: resp.postsCount,
                itemType: 'post',
              }),
              value: resp.postsCount,
              icon: <RiQuestionAnswerLine size={16} />,
            },
            {
              label: t('common.followersLabel', { count: resp.followerCount }),
              value: resp.followerCount,
              icon: <RiGroupLine size={16} />,
            },
          ]}
        />
      )}
      <PostsContainer
        entity={entityRef}
        filterPanelProps={{ showEntityFilter: false }}
        defaultView="list"
        showTypeLabel
      />
    </>
  );
};

export const EntityPage = () => {
  const { entityRef } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  if (disabled.entities) {
    return null;
  }

  if (entityRef) {
    return <SingleEntityPage entityRef={entityRef} />;
  }

  return (
    <>
      <ContentHeader
        title={t('entitiesPage.defaultTitle')}
        titleIcon={<RiShapesLine size={28} />}
      >
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
      </ContentHeader>
      <EntitiesContainer />
    </>
  );
};
