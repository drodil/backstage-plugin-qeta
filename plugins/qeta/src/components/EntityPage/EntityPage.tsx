import { useEffect, useState } from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  ButtonContainer,
  CreateLinkButton,
  EntitiesGrid,
  EntityFollowButton,
  PostsContainer,
  PostsGrid,
  qetaApiRef,
  qetaTranslationRef,
  ViewType,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { Card, CardContent, Typography } from '@material-ui/core';
import CategoryOutlined from '@material-ui/icons/CategoryOutlined';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const EntityPage = () => {
  const { entityRef } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const [resp, setResp] = useState<undefined | EntityResponse>();
  const [view, setView] = useState<ViewType>('list');

  const qetaApi = useApi(qetaApiRef);
  const alertApi = useApi(alertApiRef);

  useEffect(() => {
    if (!entityRef) {
      setResp(undefined);
      return;
    }

    qetaApi
      .getEntity(entityRef)
      .then(res => {
        if (res) {
          setResp(res);
        }
      })
      .catch(e => {
        alertApi.post({
          message: e.message,
          severity: 'error',
          display: 'transient',
        });
      });
  }, [qetaApi, entityRef, alertApi]);

  let shownTitle: string = t('entitiesPage.defaultTitle');
  let link = undefined;
  if (entityRef) {
    shownTitle = '';
    link = <EntityRefLink entityRef={entityRef} />;
  }

  return (
    <>
      <ContentHeader
        titleComponent={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <CategoryOutlined fontSize="large" style={{ marginRight: '8px' }} />
            <Typography
              variant="h5"
              component="h2"
              style={{ marginRight: '0.5em' }}
            >
              {shownTitle} {link}
            </Typography>
            {entityRef && <EntityFollowButton entityRef={entityRef} />}
          </span>
        }
      >
        <ButtonContainer>
          <AskQuestionButton entity={entityRef} />
          <WriteArticleButton entity={entityRef} />
          <CreateLinkButton entity={entityRef} />
        </ButtonContainer>
      </ContentHeader>
      {resp && (
        <Card variant="outlined" style={{ marginBottom: '1em' }}>
          <CardContent>
            <Typography variant="caption">
              {t('common.posts', {
                count: resp.postsCount,
                itemType: 'post',
              })}
              {' · '}
              {t('common.followers', { count: resp.followerCount })}
            </Typography>
          </CardContent>
        </Card>
      )}
      {entityRef &&
        (view === 'grid' ? (
          <PostsGrid
            entity={entityRef}
            filterPanelProps={{ showEntityFilter: false }}
            view={view}
            onViewChange={setView}
          />
        ) : (
          <PostsContainer
            entity={entityRef}
            filterPanelProps={{ showEntityFilter: false }}
            view={view}
            showTypeLabel
            onViewChange={setView}
          />
        ))}
      {!entityRef && <EntitiesGrid />}
    </>
  );
};
