import { ChangeEvent, useState } from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  AnswersContainer,
  AskQuestionButton,
  ButtonContainer,
  CollectionsGrid,
  PostsContainer,
  PostsGrid,
  qetaTranslationRef,
  useIdentityApi,
  UserFollowButton,
  useUserInfo,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { UserStatsContent } from './UserStatsContent';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import {
  Avatar,
  Box,
  makeStyles,
  Tab,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import AssessmentIcon from '@material-ui/icons/Assessment';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import CollectionsIcon from '@material-ui/icons/Collections';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

const useStyles = makeStyles(theme => ({
  tabIcon: {
    marginRight: theme.spacing(1),
  },
  tabPanel: {
    padding: theme.spacing(3),
  },
  avatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    marginRight: theme.spacing(2),
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  tabList: {},
  tabLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 0,
  },
}));

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  const { name, initials, user, secondaryTitle } = useUserInfo(identity);
  const [tab, setTab] = useState('statistics');
  const { t } = useTranslationRef(qetaTranslationRef);
  const [_searchParams, setSearchParams] = useSearchParams();
  const classes = useStyles();
  const {
    value: currentUser,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  const handleChange = (_event: ChangeEvent<{}>, newValue: string) => {
    setSearchParams({});
    setTab(newValue);
  };

  const TabLabel = ({
    icon,
    label,
  }: {
    icon: React.ReactNode;
    label: string;
  }) => (
    <div className={classes.tabLabel}>
      {icon}
      <span>{label}</span>
    </div>
  );

  const title = (
    <Box
      className={classes.headerContent}
      role="banner"
      aria-label={t('userPage.profileHeader')}
    >
      <Avatar
        src={user?.spec?.profile?.picture}
        alt={name}
        variant="rounded"
        className={classes.avatar}
        aria-label={t('userPage.profilePicture', { name })}
      >
        {initials}
      </Avatar>
      <Box>
        <Tooltip title={secondaryTitle || ''} arrow>
          <Typography variant="h5" component="h2" id="user-name">
            {name}
          </Typography>
        </Tooltip>
        {!loadingUser &&
          !userError &&
          currentUser?.userEntityRef !== identity && (
            <UserFollowButton
              userRef={identity}
              style={{ marginLeft: '0.5em' }}
              aria-label={t('userPage.followUser', { name })}
            />
          )}
      </Box>
    </Box>
  );

  return (
    <>
      <ContentHeader titleComponent={title}>
        <ButtonContainer>
          <AskQuestionButton />
          <WriteArticleButton />
        </ButtonContainer>
      </ContentHeader>
      <TabContext value={tab}>
        <Box className={classes.tabList}>
          <TabList
            onChange={handleChange}
            aria-label={t('userPage.profileTab')}
            aria-labelledby="user-name"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              value="statistics"
              label={
                <TabLabel
                  icon={<AssessmentIcon className={classes.tabIcon} />}
                  label={t('userPage.statistics')}
                />
              }
            />
            <Tab
              value="questions"
              label={
                <TabLabel
                  icon={<HelpOutlineIcon className={classes.tabIcon} />}
                  label={t('userPage.questions')}
                />
              }
            />
            <Tab
              value="articles"
              label={
                <TabLabel
                  icon={<CollectionsBookmarkIcon className={classes.tabIcon} />}
                  label={t('userPage.articles')}
                />
              }
            />
            <Tab
              value="collections"
              label={
                <TabLabel
                  icon={<CollectionsIcon className={classes.tabIcon} />}
                  label={t('userPage.collections')}
                />
              }
            />
            <Tab
              value="answers"
              label={
                <TabLabel
                  icon={<QuestionAnswerIcon className={classes.tabIcon} />}
                  label={t('userPage.answers')}
                />
              }
            />
          </TabList>
        </Box>
        <TabPanel value="statistics" className={classes.tabPanel}>
          <UserStatsContent userRef={identity ?? ''} />
        </TabPanel>
        <TabPanel value="questions" className={classes.tabPanel}>
          <PostsContainer
            author={identity ?? ''}
            showNoQuestionsBtn={false}
            type="question"
          />
        </TabPanel>
        <TabPanel value="articles" className={classes.tabPanel}>
          <PostsGrid
            author={identity ?? ''}
            type="article"
            showNoQuestionsBtn={false}
          />
        </TabPanel>
        <TabPanel value="collections" className={classes.tabPanel}>
          <CollectionsGrid owner={identity ?? ''} />
        </TabPanel>
        <TabPanel value="answers" className={classes.tabPanel}>
          <AnswersContainer
            author={identity ?? ''}
            title={t('userPage.answers')}
          />
        </TabPanel>
      </TabContext>
    </>
  );
};
