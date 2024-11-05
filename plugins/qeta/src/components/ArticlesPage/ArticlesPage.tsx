import { useSearchParams } from 'react-router-dom';
import React, { useEffect } from 'react';
import { ContentHeader } from '@backstage/core-components';
import {
  FollowedEntitiesList,
  FollowedTagsList,
  PostHighlightList,
  PostsGrid,
  useTranslation,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import Grid from '@mui/material/Grid';
import Whatshot from '@mui/icons-material/Whatshot';

export const ArticlesPage = () => {
  const [searchParams] = useSearchParams();

  const [entityRef, setEntityRef] = React.useState<string | undefined>(
    undefined,
  );
  const [tags, setTags] = React.useState<string[] | undefined>(undefined);
  const { t } = useTranslation();
  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
    setTags(filterTags(searchParams.get('tags')));
  }, [searchParams, setEntityRef]);

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={8} xl={9}>
        <ContentHeader title={t('articlesPage.title')}>
          <WriteArticleButton entity={entityRef} tags={tags} />
        </ContentHeader>
        <PostsGrid type="article" />
      </Grid>
      <Grid item lg={4} xl={3}>
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
