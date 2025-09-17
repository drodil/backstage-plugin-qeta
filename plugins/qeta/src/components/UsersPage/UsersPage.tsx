import {
  FollowedUsersList,
  PostHighlightList,
  qetaTranslationRef,
  UsersGrid,
} from '@drodil/backstage-plugin-qeta-react';
import { ContentHeader } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import Whatshot from '@material-ui/icons/Whatshot';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const UsersPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('usersPage.title')} />
        <UsersGrid />
      </Grid>
      <Grid item lg={3} xl={2}>
        <FollowedUsersList />
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
        <PostHighlightList
          type="hot"
          title={t('highlights.hotLinks.title')}
          noQuestionsLabel={t('highlights.hotLinks.noLinksLabel')}
          icon={<Whatshot fontSize="small" />}
          postType="link"
        />
      </Grid>
    </Grid>
  );
};
