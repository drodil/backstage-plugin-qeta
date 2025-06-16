import { useEffect, useState } from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  ButtonContainer,
  EntitiesGrid,
  EntityFollowButton,
  FollowedEntitiesList,
  PostHighlightList,
  PostsContainer,
  qetaApiRef,
  qetaTranslationRef,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import Whatshot from '@material-ui/icons/Whatshot';
import { useApi } from '@backstage/core-plugin-api';
import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const EntityPage = () => {
  const { entityRef } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const [resp, setResp] = useState<undefined | EntityResponse>();

  const qetaApi = useApi(qetaApiRef);

  useEffect(() => {
    if (!entityRef) {
      setResp(undefined);
      return;
    }

    qetaApi.getEntity(entityRef).then(res => {
      if (res) {
        setResp(res);
      }
    });
  }, [qetaApi, entityRef]);

  let shownTitle: string = t('entitiesPage.defaultTitle');
  let link = undefined;
  if (entityRef) {
    shownTitle = '';
    link = <EntityRefLink entityRef={entityRef} />;
  }

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader
          titleComponent={
            <span style={{ display: 'flex', alignItems: 'center' }}>
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
        {entityRef ? (
          <PostsContainer
            entity={entityRef}
            filterPanelProps={{ showEntityFilter: false }}
          />
        ) : (
          <EntitiesGrid />
        )}
      </Grid>
      <Grid item lg={3} xl={2}>
        <FollowedEntitiesList />
        {resp && (
          <>
            <PostHighlightList
              type="hot"
              title={t('highlights.hotQuestions.title')}
              noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
              icon={<Whatshot fontSize="small" />}
              options={{ entities: [resp.entityRef] }}
              postType="question"
            />
            <PostHighlightList
              type="unanswered"
              title={t('highlights.unanswered.title')}
              noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
              options={{ entities: [resp.entityRef] }}
              postType="question"
            />
            <PostHighlightList
              type="incorrect"
              title={t('highlights.incorrect.title')}
              noQuestionsLabel={t('highlights.incorrect.noQuestionsLabel')}
              options={{ entities: [resp.entityRef] }}
              postType="question"
            />
          </>
        )}
        {!resp && (
          <>
            <PostHighlightList
              type="hot"
              title={t('highlights.hotQuestions.title')}
              noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
              icon={<Whatshot fontSize="small" />}
              postType="question"
            />
            <PostHighlightList
              type="hot"
              title={t('highlights.hotArticles.title')}
              noQuestionsLabel={t('highlights.hotArticles.noArticlesLabel')}
              icon={<Whatshot fontSize="small" />}
              postType="article"
            />
          </>
        )}
      </Grid>
    </Grid>
  );
};
