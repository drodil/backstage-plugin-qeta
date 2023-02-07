import React from 'react';
import {
  Button,
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
import { Route, Routes } from 'react-router-dom';
import { AskPage } from '../AskPage';
import { QuestionPage } from '../QuestionPage/QuestionPage';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { TagPage } from '../TagPage/TagPage';
import { UserPage } from '../UserPage/UserPage';
import HelpOutline from '@material-ui/icons/HelpOutline';
import LoyaltyOutlined from '@material-ui/icons/LoyaltyOutlined';
import { QuestionHighlightList } from '../QuestionHighlightList/QuestionHighlightList';
import { useIdentityApi, useStyles } from '../../utils/hooks';
import Whatshot from '@material-ui/icons/Whatshot';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import StarIcon from '@material-ui/icons/Star';
import AccountBox from '@material-ui/icons/AccountBox';
import { FavoritePage } from '../FavoritePage/FavoritePage';

const MoreMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
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
        <MenuItem component="a" href="/qeta/tags">
          <ListItemIcon className={styles.menuIcon}>
            <LoyaltyOutlined fontSize="small" />
          </ListItemIcon>
          Tags
        </MenuItem>
        {user && !loadingUser && !userError && (
          <MenuItem component="a" href={`/qeta/users/${user?.userEntityRef}`}>
            <ListItemIcon className={styles.menuIcon}>
              <AccountBox fontSize="small" />
            </ListItemIcon>
            My questions
          </MenuItem>
        )}
        <MenuItem component="a" href="/qeta/questions/favorite">
          <ListItemIcon className={styles.menuIcon}>
            <StarIcon fontSize="small" />
          </ListItemIcon>
          Favorite questions
        </MenuItem>
      </Menu>
    </>
  );
};

export const HomePageContent = () => {
  return (
    <Content>
      <Grid container spacing={3}>
        <Grid item md={12} lg={9} xl={10}>
          <ContentHeader title="All questions">
            <MoreMenu />
            <Button
              variant="contained"
              href="/qeta/ask"
              color="primary"
              startIcon={<HelpOutline />}
            >
              Ask question
            </Button>
          </ContentHeader>
          <QuestionsContainer />
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
    </Content>
  );
};

type Props = {
  title?: string;
  subtitle?: string;
  headerElements?: JSX.Element[];
};

export const HomePage = (props: Props) => (
  <Page themeId="tool">
    <Header title={props.title ?? 'Q&A'} subtitle={props.subtitle}>
      {props.headerElements}
    </Header>
    <Routes>
      <Route path="/" element={<HomePageContent />} />
      <Route path="/ask" element={<AskPage />} />
      <Route path="/questions/favorite" element={<FavoritePage />} />
      <Route path="/questions/:id/edit" element={<AskPage />} />
      <Route path="/questions/:id" element={<QuestionPage />} />
      <Route path="/tags" element={<TagPage />} />
      <Route path="/tags/:tag" element={<TagPage />} />
      <Route path="/users/*" element={<UserPage />} />
    </Routes>
  </Page>
);
