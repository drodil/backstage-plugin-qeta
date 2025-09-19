import { ReactNode } from 'react';
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
  createLinkRouteRef,
  editArticleRouteRef,
  editLinkRouteRef,
  editQuestionRouteRef,
  entitiesRouteRef,
  entityRouteRef,
  favoriteQuestionsRouteRef,
  LeftMenu,
  LeftMenuButton,
  linkRouteRef,
  linksRouteRef,
  moderatorRouteRef,
  questionRouteRef,
  questionsRouteRef,
  statisticsRouteRef,
  tagRouteRef,
  tagsRouteRef,
  userRouteRef,
  usersRouteRef,
  writeRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import { QuestionsPage } from '../QuestionsPage/QuestionsPage';
import { HomePage } from '../HomePage/HomePage';
import { ArticlesPage } from '../ArticlesPage/ArticlesPage';
import { WritePage } from '../WritePage/WritePage';
import { ArticlePage } from '../ArticlePage/ArticlePage';
import { LinksPage } from '../LinksPage/LinksPage.tsx';
import { LinkPage } from '../LinkPage/LinkPage.tsx';
import { CreateLinkPage } from '../CreateLinkPage/CreateLinkPage.tsx';
import { CollectionsPage } from '../CollectionsPage/CollectionsPage';
import { CollectionPage } from '../CollectionPage/CollectionPage';
import { CollectionCreatePage } from '../CollectionCreatePage/CollectionCreatePage';
import { EntityPage } from '../EntityPage/EntityPage';
import { UsersPage } from '../UsersPage/UsersPage';
import { ModeratorPage } from '../ModeratorPage/ModeratorPage';
import { Box, Container, Grid } from '@material-ui/core';

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
            <Grid item md={1} lg={2} style={{ padding: 0 }}>
              <Box display={{ md: 'block', lg: 'none' }}>
                <LeftMenuButton />
              </Box>
              <Box display={{ xs: 'none', md: 'block' }}>
                <LeftMenu />
              </Box>
            </Grid>
            <Grid
              item
              md={12}
              lg={10}
              style={{ paddingLeft: '8px', paddingRight: '0' }}
            >
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
                <Route path={linksRouteRef.path} element={<LinksPage />} />
                <Route
                  path={createLinkRouteRef.path}
                  element={<CreateLinkPage />}
                />
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
                  path={editLinkRouteRef.path}
                  element={<CreateLinkPage />}
                />
                <Route
                  path={questionRouteRef.path}
                  element={<QuestionPage />}
                />
                <Route path={linkRouteRef.path} element={<LinkPage />} />
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
                <Route
                  path={moderatorRouteRef.path}
                  element={<ModeratorPage />}
                />
              </Routes>
            </Grid>
          </Grid>
        </Container>
      </Content>
    </Page>
  );
};
