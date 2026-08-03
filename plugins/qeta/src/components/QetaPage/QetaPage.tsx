import { ReactNode } from 'react';
import { Content, Page } from '@backstage/core-components';
import { Route, Routes, useLocation } from 'react-router-dom';
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
  QetaProvider,
  questionRouteRef,
  questionsRouteRef,
  reviewRouteRef,
  settingsRouteRef,
  statisticsRouteRef,
  tagRouteRef,
  tagsRouteRef,
  userRouteRef,
  usersRouteRef,
  writeRouteRef,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { QuestionsPage } from '../QuestionsPage/QuestionsPage';
import { HomePage } from '../HomePage/HomePage';
import { ArticlesPage } from '../ArticlesPage/ArticlesPage';
import { WritePage } from '../WritePage/WritePage';
import { ArticlePage } from '../ArticlePage/ArticlePage';
import { LinksPage } from '../LinksPage/LinksPage';
import { LinkPage } from '../LinkPage/LinkPage';
import { CreateLinkPage } from '../CreateLinkPage/CreateLinkPage';
import { CollectionsPage } from '../CollectionsPage/CollectionsPage';
import { CollectionPage } from '../CollectionPage/CollectionPage';
import { CollectionCreatePage } from '../CollectionCreatePage/CollectionCreatePage';
import { EntityPage } from '../EntityPage/EntityPage';
import { UsersPage } from '../UsersPage/UsersPage';
import { ModeratorPage } from '../ModeratorPage/ModeratorPage';
import { ReviewPage } from '../ReviewPage/ReviewPage';
import { SettingsPage } from '../SettingsPage/SettingsPage';
import { Box, useBreakpoint } from '@backstage/ui';
import { useSidebarSettings } from '../../hooks/useSidebarSettings';
import { RightContent } from '../RightContent/RightContent';
import type { PluggableList } from 'unified';
import styles from './QetaPage.module.css';

type Props = {
  themeId?: string;
  introElement?: ReactNode;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
};

export const QetaPage = (props?: Props) => {
  const {
    themeId = 'tool',
    introElement,
    remarkPlugins,
    rehypePlugins,
  } = props ?? {};
  const { leftCompact, rightCompact, toggleLeft, toggleRight } =
    useSidebarSettings();
  const { disabled } = useQetaConfig();
  const location = useLocation();
  const { down } = useBreakpoint();
  const isSmallScreen = down('lg');

  // Hide right sidebar on review and moderator pages
  const hideRightSidebar =
    location.pathname.includes('/review') ||
    location.pathname.includes('/moderate');

  return (
    <QetaProvider remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
      <Page themeId={themeId}>
        <Content className="qetaHomePage">
          {introElement}
          <Box className={styles.container}>
            <Box className={styles.row}>
              <Box
                className={`${styles.sidebarColumn} ${
                  leftCompact ? styles.sidebarColumnCompact : ''
                }`}
              >
                {isSmallScreen ? (
                  <LeftMenuButton />
                ) : (
                  <LeftMenu compact={leftCompact} onToggle={toggleLeft} />
                )}
              </Box>
              <Box className={styles.mainColumn}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  {!disabled.questions && (
                    <>
                      <Route
                        path={questionsRouteRef.path}
                        element={<QuestionsPage />}
                      />
                      <Route path={askRouteRef.path} element={<AskPage />} />
                      <Route
                        path={editQuestionRouteRef.path}
                        element={<AskPage />}
                      />
                      <Route
                        path={questionRouteRef.path}
                        element={<QuestionPage />}
                      />
                    </>
                  )}
                  {!disabled.articles && (
                    <>
                      <Route
                        path={articlesRouteRef.path}
                        element={<ArticlesPage />}
                      />
                      <Route
                        path={writeRouteRef.path}
                        element={<WritePage />}
                      />
                      <Route
                        path={editArticleRouteRef.path}
                        element={<WritePage />}
                      />
                      <Route
                        path={articleRouteRef.path}
                        element={<ArticlePage />}
                      />
                    </>
                  )}
                  {!disabled.links && (
                    <>
                      <Route
                        path={linksRouteRef.path}
                        element={<LinksPage />}
                      />
                      <Route
                        path={createLinkRouteRef.path}
                        element={<CreateLinkPage />}
                      />
                      <Route
                        path={editLinkRouteRef.path}
                        element={<CreateLinkPage />}
                      />
                      <Route path={linkRouteRef.path} element={<LinkPage />} />
                    </>
                  )}
                  <Route
                    path={favoriteQuestionsRouteRef.path}
                    element={<FavoritePage />}
                  />
                  {!disabled.tags && (
                    <>
                      <Route path={tagsRouteRef.path} element={<TagPage />} />
                      <Route path={tagRouteRef.path} element={<TagPage />} />
                    </>
                  )}
                  <Route path={usersRouteRef.path} element={<UsersPage />} />
                  <Route path={userRouteRef.path} element={<UserPage />} />
                  <Route
                    path={statisticsRouteRef.path}
                    element={<StatisticsPage />}
                  />
                  {!disabled.collections && (
                    <>
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
                    </>
                  )}
                  {!disabled.entities && (
                    <>
                      <Route
                        path={entitiesRouteRef.path}
                        element={<EntityPage />}
                      />
                      <Route
                        path={entityRouteRef.path}
                        element={<EntityPage />}
                      />
                    </>
                  )}
                  <Route
                    path={moderatorRouteRef.path}
                    element={<ModeratorPage />}
                  />
                  <Route path={reviewRouteRef.path} element={<ReviewPage />} />
                  <Route
                    path={settingsRouteRef.path}
                    element={<SettingsPage />}
                  />
                </Routes>
              </Box>
              {!hideRightSidebar && (
                <Box
                  className={`${styles.rightSidebarColumn} ${
                    rightCompact ? styles.rightSidebarColumnCompact : ''
                  }`}
                >
                  <RightContent compact={rightCompact} onToggle={toggleRight} />
                </Box>
              )}
            </Box>
          </Box>
        </Content>
      </Page>
    </QetaProvider>
  );
};
