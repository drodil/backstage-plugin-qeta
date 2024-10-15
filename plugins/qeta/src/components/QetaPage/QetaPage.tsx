import React, { ReactNode } from 'react';
import { Container, Grid } from '@material-ui/core';
import { Content, Header, Page } from '@backstage/core-components';
import { Route, Routes } from 'react-router-dom';
import { AskPage } from '../AskPage';
import { QuestionPage } from '../QuestionPage/QuestionPage';
import { TagPage } from '../TagPage/TagPage';
import { UserPage } from '../UserPage/UserPage';
import { QuestionHighlightList } from '../QuestionHighlightList/QuestionHighlightList';
import { useTranslation } from '../../utils/hooks';
import Whatshot from '@material-ui/icons/Whatshot';
import { FavoritePage } from '../FavoritePage/FavoritePage';
import { StatisticsPage } from '../Statistics';
import {
  askRouteRef,
  editQuestionRouteRef,
  favoriteQuestionsRouteRef,
  questionRouteRef,
  questionsRouteRef,
  statisticsRouteRef,
  tagRouteRef,
  tagsRouteRef,
  userRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import { FollowedTagsList } from './FollowedTagsList';
import { FollowedEntitiesList } from './FollowedEntitiesList';
import { LeftMenu } from '../LeftMenu/LeftMenu';
import { QuestionsPage } from '../QuestionsPage/QuestionsPage';
import { HomePage } from '../HomePage/HomePage';

type Props = {
  title?: string;
  subtitle?: string;
  headerElements?: ReactNode[];
  themeId?: string;
  headerTooltip?: string;
  headerType?: string;
  headerTypeLink?: string;
};

export const QetaPage = (props?: Props) => {
  const {
    title = 'Q&A',
    subtitle,
    headerElements,
    themeId = 'tool',
    headerTooltip,
    headerType,
    headerTypeLink,
  } = props ?? {};
  const { t } = useTranslation();

  return (
    <Page themeId={themeId}>
      <Header
        title={title}
        subtitle={subtitle}
        type={headerType}
        typeLink={headerTypeLink}
        tooltip={headerTooltip}
      >
        {headerElements}
      </Header>
      <Content className="qetaHomePage">
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item md={3} lg={2} xl={2}>
              <LeftMenu />
            </Grid>
            <Grid item md={9} lg={7} xl={8}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path={questionsRouteRef.path}
                  element={<QuestionsPage />}
                />
                <Route path={askRouteRef.path} element={<AskPage />} />
                <Route
                  path={favoriteQuestionsRouteRef.path}
                  element={<FavoritePage />}
                />
                <Route path={editQuestionRouteRef.path} element={<AskPage />} />
                <Route
                  path={questionRouteRef.path}
                  element={<QuestionPage />}
                />
                <Route path={tagsRouteRef.path} element={<TagPage />} />
                <Route path={tagRouteRef.path} element={<TagPage />} />
                <Route path={userRouteRef.path} element={<UserPage />} />
                <Route
                  path={statisticsRouteRef.path}
                  element={<StatisticsPage />}
                />
              </Routes>
            </Grid>
            <Grid item lg={3} xl={2}>
              <QuestionHighlightList
                type="hot"
                title={t('highlights.hot.title')}
                noQuestionsLabel={t('highlights.hot.noQuestionsLabel')}
                icon={<Whatshot fontSize="small" />}
              />
              <QuestionHighlightList
                type="unanswered"
                title={t('highlights.unanswered.title')}
                noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
              />
              <QuestionHighlightList
                type="incorrect"
                title={t('highlights.incorrect.title')}
                noQuestionsLabel={t('highlights.incorrect.noQuestionsLabel')}
              />
              <FollowedTagsList />
              <FollowedEntitiesList />
            </Grid>
          </Grid>
        </Container>
      </Content>
    </Page>
  );
};
