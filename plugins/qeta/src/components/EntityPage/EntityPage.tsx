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
  WriteArticleButton,
  ContentHeaderCard,
  ContentHeader,
} from '@drodil/backstage-plugin-qeta-react';
import {
  EntityRefLink,
  useEntityPresentation,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import CategoryOutlined from '@material-ui/icons/CategoryOutlined';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';
import { Skeleton } from '@material-ui/lab';
import { WarningPanel } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';

const SingleEntityPage = ({ entityRef }: { entityRef: string }) => {
  const { t } = useTranslationRef(qetaTranslationRef);
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

  if (loading) {
    return <Skeleton variant="rect" height={200} />;
  }

  if (error || !resp) {
    return (
      <WarningPanel severity="error" title={t('questionPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  const title = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <EntityRefLink
        entityRef={resp.entityRef}
        defaultKind="Component"
        hideIcon
      />
      <span style={{ marginLeft: '0.5em', display: 'flex' }}>
        <EntityFollowButton entityRef={resp.entityRef} />
      </span>
    </div>
  );

  const description = `${entity?.kind} ${
    entity?.spec?.type ? `(${entity?.spec?.type})` : ''
  }`;

  return (
    <>
      <ContentHeader
        title={title}
        titleIcon={<CategoryOutlined fontSize="large" />}
        description={description}
      >
        <AskQuestionButton entity={resp.entityRef} />
        <WriteArticleButton entity={resp.entityRef} />
        <CreateLinkButton entity={resp.entityRef} />
      </ContentHeader>
      {resp && (
        <ContentHeaderCard
          description={entity?.metadata?.description}
          imageIcon={
            Icon ? (
              <div style={{ fontSize: '80px', display: 'flex' }}>
                <Icon fontSize="inherit" />
              </div>
            ) : (
              <CategoryOutlined style={{ fontSize: 80 }} />
            )
          }
          stats={[
            {
              label: t('common.postsLabel', {
                count: resp.postsCount,
                itemType: 'post',
              }),
              value: resp.postsCount,
              icon: <QuestionAnswerIcon fontSize="small" />,
            },
            {
              label: t('common.followersLabel', { count: resp.followerCount }),
              value: resp.followerCount,
              icon: <PeopleIcon fontSize="small" />,
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

  if (entityRef) {
    return <SingleEntityPage entityRef={entityRef} />;
  }

  return (
    <>
      <ContentHeader
        title={t('entitiesPage.defaultTitle')}
        titleIcon={<CategoryOutlined fontSize="large" />}
      >
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
      </ContentHeader>
      <EntitiesContainer />
    </>
  );
};
