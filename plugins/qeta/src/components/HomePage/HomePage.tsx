import React from 'react';
import { Button, Grid } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
} from '@backstage/core-components';
import { Route, Routes } from 'react-router-dom';
import { AskPage } from '../AskPage';
import { QuestionPage } from '../QuestionPage/QuestionPage';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { TagPage } from '../TagPage/TagPage';
import { UserPage } from '../UserPage/UserPage';
import HelpOutline from '@material-ui/icons/HelpOutline';
import LoyaltyOutlined from '@material-ui/icons/LoyaltyOutlined';
import { QuestionHighlightList } from '../QuestionHighlightList/QuestionHighlightList';
import { useStyles } from '../../utils/hooks';

export const HomePageContent = () => {
  const styles = useStyles();
  return (
    <Content>
      <Grid container spacing={3}>
        <Grid item md={12} lg={9} xl={10}>
          <ContentHeader title="All questions">
            <Button
              href="/qeta/tags"
              className={styles.marginRight}
              startIcon={<LoyaltyOutlined />}
            >
              Tags
            </Button>
            <Button
              variant="contained"
              href="/qeta/ask"
              startIcon={<HelpOutline />}
            >
              Ask question
            </Button>
          </ContentHeader>
          <QuestionsContainer />
        </Grid>
        <Grid item lg={3} xl={2}>
          <QuestionHighlightList
            type="unanswered"
            title="Unanswered questions"
            noQuestionsLabel="No unanswered questions"
          />
          <QuestionHighlightList
            type="incorrect"
            title="Questions without correct answer"
            noQuestionsLabel="No questions without correct answers"
          />
        </Grid>
      </Grid>
    </Content>
  );
};

export const HomePage = () => (
  <Page themeId="tool">
    <Header title="Q&A">
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Routes>
      <Route path="/" element={<HomePageContent />} />
      <Route path="/ask" element={<AskPage />} />
      <Route path="/questions/:id/edit" element={<AskPage />} />
      <Route path="/questions/:id" element={<QuestionPage />} />
      <Route path="/tags/:tag?" element={<TagPage />} />
      <Route path="/users/*" element={<UserPage />} />
    </Routes>
  </Page>
);
