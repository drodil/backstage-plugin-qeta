import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ContentHeader } from '@backstage/core-components';
import {
  ButtonContainer,
  FollowedEntitiesList,
  FollowedTagsList,
  PostHighlightList,
  PostsGrid,
  PostsContainer,
  qetaTranslationRef,
  WriteArticleButton,
  ViewType,
} from '@drodil/backstage-plugin-qeta-react';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import Whatshot from '@material-ui/icons/Whatshot';
import { Grid } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const ArticlesPage = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ViewType>('grid');

  const [entityRef, setEntityRef] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[] | undefined>(undefined);
  const { t } = useTranslationRef(qetaTranslationRef);
  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
    setTags(filterTags(searchParams.get('tags')));
  }, [searchParams, setEntityRef]);

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('articlesPage.title')}>
          <ButtonContainer>
            <WriteArticleButton entity={entityRef} tags={tags} />
          </ButtonContainer>
        </ContentHeader>
        {view === 'grid' ? (
          <PostsGrid type="article" view={view} onViewChange={setView} />
        ) : (
          <PostsContainer type="article" view={view} onViewChange={setView} />
        )}
      </Grid>
      <Grid item lg={3} xl={2}>
        <PostHighlightList
          type="hot"
          title={t('highlights.hotArticles.title')}
          noQuestionsLabel={t('highlights.hotArticles.noArticlesLabel')}
          icon={<Whatshot fontSize="small" />}
          postType="article"
        />
        <FollowedTagsList />
        <FollowedEntitiesList />
      </Grid>
    </Grid>
  );
};
