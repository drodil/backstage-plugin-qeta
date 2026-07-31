import { useEffect, useState } from 'react';
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
} from '@drodil/backstage-plugin-qeta-react';
import {
  catalogApiRef,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';
import { Alert, Header, Skeleton } from '@backstage/ui';
import { RiGroupLine, RiQuestionAnswerLine } from '@remixicon/react';
import { Entity } from '@backstage/catalog-model';

const SingleEntityPage = ({ entityRef }: { entityRef: string }) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const [entity, setEntity] = useState<Entity | undefined>(undefined);
  const { primaryTitle } = useEntityPresentation(entityRef);
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
      <Alert
        status="danger"
        title={t('questionPage.errorLoading')}
        description={error?.message}
      />
    );
  }

  const description = [
    `${entity?.kind} ${entity?.spec?.type ? `(${entity?.spec?.type})` : ''}`,
    entity?.metadata?.description,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <Header
        title={primaryTitle}
        description={description}
        metadata={[
          {
            label: t('common.postsLabel', {
              count: resp.postsCount,
              itemType: 'post',
            }),
            value: (
              <>
                <RiQuestionAnswerLine size={16} /> {resp.postsCount}
              </>
            ),
          },
          {
            label: t('common.followersLabel', { count: resp.followerCount }),
            value: (
              <>
                <RiGroupLine size={16} /> {resp.followerCount}
              </>
            ),
          },
        ]}
        customActions={
          <>
            <EntityFollowButton entityRef={resp.entityRef} />
            <AskQuestionButton entity={resp.entityRef} />
            <WriteArticleButton entity={resp.entityRef} />
            <CreateLinkButton entity={resp.entityRef} />
          </>
        }
      />
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
      <Header title={t('entitiesPage.defaultTitle')} />
      <EntitiesContainer />
    </>
  );
};
