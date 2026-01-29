import {
  AskQuestionButton,
  ContentHeader,
  CreateLinkButton,
  qetaTranslationRef,
  SuggestionsCard,
  GetStartedCard,
  WriteArticleButton,
  Timeline,
} from '@drodil/backstage-plugin-qeta-react';
import { Grid } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import HomeOutlined from '@material-ui/icons/HomeOutlined';

export const HomePage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <>
      <ContentHeader
        title={t('homePage.title')}
        titleIcon={<HomeOutlined fontSize="large" />}
      >
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
      </ContentHeader>
      <Grid container>
        <Grid item xs={12}>
          <GetStartedCard />
        </Grid>
        <Grid item xs={12}>
          <SuggestionsCard />
        </Grid>
        <Grid item xs={12}>
          <Timeline />
        </Grid>
      </Grid>
    </>
  );
};
