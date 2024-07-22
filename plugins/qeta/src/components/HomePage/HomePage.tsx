import React, { ReactNode, useEffect } from 'react';
import {
  Container,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from '@material-ui/core';
import {
  Content,
  ContentHeader,
  Header,
  Page,
} from '@backstage/core-components';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import { AskPage } from '../AskPage';
import { QuestionPage } from '../QuestionPage/QuestionPage';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { TagPage } from '../TagPage/TagPage';
import { UserPage } from '../UserPage/UserPage';
import LoyaltyOutlined from '@material-ui/icons/LoyaltyOutlined';
import { QuestionHighlightList } from '../QuestionHighlightList/QuestionHighlightList';
import { useIdentityApi, useStyles } from '../../utils/hooks';
import Whatshot from '@material-ui/icons/Whatshot';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import StarIcon from '@material-ui/icons/Star';
import { FavoritePage } from '../FavoritePage/FavoritePage';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { StatisticsPage, TrophyIcon } from '../Statistics';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  askRouteRef,
  editQuestionRouteRef,
  favoriteQuestionsRouteRef,
  questionRouteRef,
  statisticsRouteRef,
  tagRouteRef,
  tagsRouteRef,
  userRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import AccountBox from '@material-ui/icons/AccountBox';

const MoreMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const tagsRoute = useRouteRef(tagsRouteRef);
  const favoritesRoute = useRouteRef(favoriteQuestionsRouteRef);
  const statisticsRoute = useRouteRef(statisticsRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const open = Boolean(anchorEl);
  const styles = useStyles();
  const {
    value: user,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  const handleMenuOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip arrow title="More">
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleMenuOpen}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={handleMenuClose}
      >
        {user && !loadingUser && !userError && (
          <MenuItem component="a" href={`${userRoute()}/${user.userEntityRef}`}>
            <ListItemIcon className={styles.menuIcon}>
              <AccountBox fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
        )}
        <MenuItem component="a" href={tagsRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <LoyaltyOutlined fontSize="small" />
          </ListItemIcon>
          Tags
        </MenuItem>
        <MenuItem component="a" href={favoritesRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <StarIcon fontSize="small" />
          </ListItemIcon>
          Favorite questions
        </MenuItem>
        <MenuItem component="a" href={statisticsRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <TrophyIcon />
          </ListItemIcon>
          Statistics
        </MenuItem>
      </Menu>
    </>
  );
};

export const HomePageContent = () => {
  const [searchParams] = useSearchParams();
  const [entityRef, setEntityRef] = React.useState<string | undefined>(
    undefined,
  );
  const [tags, setTags] = React.useState<string[] | undefined>(undefined);
  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
    setTags(filterTags(searchParams.get('tags')));
  }, [searchParams, setEntityRef]);

  return (
    <Content className="qetaHomePage">
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} lg={9} xl={10}>
            <ContentHeader title="All questions">
              <MoreMenu />
              <AskQuestionButton entity={entityRef} tags={tags} />
            </ContentHeader>
            <QuestionsContainer entity={entityRef} tags={tags} />
          </Grid>
          <Grid item lg={3} xl={2}>
            <QuestionHighlightList
              type="hot"
              title="Hot questions"
              noQuestionsLabel="No questions"
              icon={<Whatshot fontSize="small" />}
            />
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
      </Container>
    </Content>
  );
};

type Props = {
  title?: string;
  subtitle?: string;
  headerElements?: ReactNode[];
  themeId?: string;
  headerTooltip?: string;
  headerType?: string;
  headerTypeLink?: string;
};

export const HomePage = (props?: Props) => {
  const {
    title = 'Q&A',
    subtitle,
    headerElements,
    themeId = 'tool',
    headerTooltip,
    headerType,
    headerTypeLink,
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
      <Routes>
        <Route path="/" element={<HomePageContent />} />
        <Route path={askRouteRef.path} element={<AskPage />} />
        <Route
          path={favoriteQuestionsRouteRef.path}
          element={<FavoritePage />}
        />
        <Route path={editQuestionRouteRef.path} element={<AskPage />} />
        <Route path={questionRouteRef.path} element={<QuestionPage />} />
        <Route path={tagsRouteRef.path} element={<TagPage />} />
        <Route path={tagRouteRef.path} element={<TagPage />} />
        <Route path={userRouteRef.path} element={<UserPage />} />
        <Route path={statisticsRouteRef.path} element={<StatisticsPage />} />
      </Routes>
    </Page>
  );
};
