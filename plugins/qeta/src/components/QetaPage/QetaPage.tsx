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
  QetaProvider,
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
import { Box, Container, Grid, makeStyles } from '@material-ui/core';
import { useSidebarSettings } from '../../hooks/useSidebarSettings';
import { RightContent } from '../RightContent/RightContent';
import type { PluggableList } from 'unified';

type Props = {
  title?: string;
  subtitle?: string;
  headerElements?: ReactNode[];
  themeId?: string;
  headerTooltip?: string;
  headerType?: string;
  headerTypeLink?: string;
  introElement?: ReactNode;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
};

type StyleProps = {
  leftCompact: boolean;
  rightCompact: boolean;
};

const useStyles = makeStyles(theme => ({
  sidebarColumn: {
    padding: 0,
    transition: 'all 0.2s ease-in-out',
    flexShrink: 0,
    [theme.breakpoints.up('lg')]: {
      width: (props: StyleProps) => (props.leftCompact ? 72 : 220),
      minWidth: (props: StyleProps) => (props.leftCompact ? 72 : 220),
    },
    [theme.breakpoints.down('md')]: {
      width: '100%',
      marginBottom: theme.spacing(1),
    },
  },
  rightSidebarColumn: {
    padding: 0,
    transition: 'all 0.2s ease-in-out',
    flexShrink: 0,
    [theme.breakpoints.up('lg')]: {
      width: (props: StyleProps) => (props.rightCompact ? 72 : 300),
      minWidth: (props: StyleProps) => (props.rightCompact ? 72 : 300),
    },
    [theme.breakpoints.down('md')]: {
      width: '100%',
      marginTop: theme.spacing(1),
    },
  },
  mainColumn: {
    paddingRight: 0,
    minWidth: 0,
    transition: 'all 0.2s ease-in-out',
    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
    },
  },
}));

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
    remarkPlugins,
    rehypePlugins,
  } = props ?? {};
  const { leftCompact, rightCompact, toggleLeft, toggleRight } =
    useSidebarSettings();

  const classes = useStyles({
    leftCompact,
    rightCompact,
  });

  return (
    <QetaProvider remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
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
            <Grid container spacing={3} justifyContent="flex-start">
              <Grid item className={classes.sidebarColumn}>
                <Box display={{ xs: 'block', lg: 'none' }}>
                  <LeftMenuButton />
                </Box>
                <Box display={{ xs: 'none', lg: 'block' }}>
                  <LeftMenu compact={leftCompact} onToggle={toggleLeft} />
                </Box>
              </Grid>
              <Grid item xs className={classes.mainColumn}>
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
                  <Route
                    path={editQuestionRouteRef.path}
                    element={<AskPage />}
                  />
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
                  <Route
                    path={articleRouteRef.path}
                    element={<ArticlePage />}
                  />
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
                  <Route
                    path={entitiesRouteRef.path}
                    element={<EntityPage />}
                  />
                  <Route path={entityRouteRef.path} element={<EntityPage />} />
                  <Route
                    path={moderatorRouteRef.path}
                    element={<ModeratorPage />}
                  />
                </Routes>
              </Grid>
              <Grid item className={classes.rightSidebarColumn}>
                <RightContent compact={rightCompact} onToggle={toggleRight} />
              </Grid>
            </Grid>
          </Container>
        </Content>
      </Page>
    </QetaProvider>
  );
};
