import React, { ReactNode } from 'react';
import { Box, Container, Grid } from '@material-ui/core';
import { Content, Header, Page } from '@backstage/core-components';
import { Route, Routes } from 'react-router-dom';
import { AskPage } from '../AskPage';
import { QuestionPage } from '../QuestionPage/QuestionPage';
import { TagPage } from '../TagPage/TagPage';
import { UserPage } from '../UserPage/UserPage';
import { FavoritePage } from '../FavoritePage/FavoritePage';
import { StatisticsPage } from '../Statistics';
import {
  articleRouteRef,
  articlesRouteRef,
  askRouteRef,
  collectionCreateRouteRef,
  collectionEditRouteRef,
  collectionRouteRef,
  collectionsRouteRef,
  editArticleRouteRef,
  editQuestionRouteRef,
  entitiesRouteRef,
  entityRouteRef,
  favoriteQuestionsRouteRef,
  questionRouteRef,
  questionsRouteRef,
  statisticsRouteRef,
  tagRouteRef,
  tagsRouteRef,
  userRouteRef,
  usersRouteRef,
  useStyles,
  writeRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import { LeftMenu } from '../LeftMenu/LeftMenu';
import { QuestionsPage } from '../QuestionsPage/QuestionsPage';
import { HomePage } from '../HomePage/HomePage';
import { LeftMenuButton } from '../LeftMenu/LeftMenuButton';
import { ArticlesPage } from '../ArticlesPage/ArticlesPage';
import { WritePage } from '../WritePage/WritePage';
import { ArticlePage } from '../ArticlePage/ArticlePage';
import { CollectionsPage } from '../CollectionsPage/CollectionsPage';
import { CollectionPage } from '../CollectionPage/CollectionPage';
import { CollectionCreatePage } from '../CollectionCreatePage/CollectionCreatePage';
import { EntityPage } from '../EntityPage/EntityPage';
import { UsersPage } from '../UsersPage/UsersPage';

type Props = {
  title?: string;
  subtitle?: string;
  headerElements?: ReactNode[];
  themeId?: string;
  headerTooltip?: string;
  headerType?: string;
  headerTypeLink?: string;
  introElement?: ReactNode;
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
    introElement,
  } = props ?? {};
  const styles = useStyles();

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
        {introElement}
        <Container maxWidth="xl">
          <Grid container spacing={4} justifyContent="flex-start">
            <Grid item md={1} lg={2} className={styles.noPadding}>
              <LeftMenu />
            </Grid>
            <Grid
              item
              md={12}
              lg={10}
              style={{ paddingLeft: '0', paddingRight: '0' }}
            >
              <Box display={{ md: 'block', lg: 'none' }}>
                <LeftMenuButton />
              </Box>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path={questionsRouteRef.path}
                  element={<QuestionsPage />}
                />
                <Route path={askRouteRef.path} element={<AskPage />} />
                <Route
                  path={articlesRouteRef.path}
                  element={<ArticlesPage />}
                />
                <Route path={writeRouteRef.path} element={<WritePage />} />
                <Route
                  path={favoriteQuestionsRouteRef.path}
                  element={<FavoritePage />}
                />
                <Route path={editQuestionRouteRef.path} element={<AskPage />} />
                <Route
                  path={editArticleRouteRef.path}
                  element={<WritePage />}
                />
                <Route
                  path={questionRouteRef.path}
                  element={<QuestionPage />}
                />
                <Route path={articleRouteRef.path} element={<ArticlePage />} />
                <Route path={tagsRouteRef.path} element={<TagPage />} />
                <Route path={tagRouteRef.path} element={<TagPage />} />
                <Route path={usersRouteRef.path} element={<UsersPage />} />
                <Route path={userRouteRef.path} element={<UserPage />} />
                <Route
                  path={statisticsRouteRef.path}
                  element={<StatisticsPage />}
                />
                <Route
                  path={collectionsRouteRef.path}
                  element={<CollectionsPage />}
                />
                <Route
                  path={collectionCreateRouteRef.path}
                  element={<CollectionCreatePage />}
                />
                <Route
                  path={collectionEditRouteRef.path}
                  element={<CollectionCreatePage />}
                />
                <Route
                  path={collectionRouteRef.path}
                  element={<CollectionPage />}
                />
                <Route path={entitiesRouteRef.path} element={<EntityPage />} />
                <Route path={entityRouteRef.path} element={<EntityPage />} />
              </Routes>
            </Grid>
          </Grid>
        </Container>
      </Content>
    </Page>
  );
};
