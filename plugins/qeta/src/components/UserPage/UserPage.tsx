import { ChangeEvent, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  AnswersContainer,
  AskQuestionButton,
  CollectionsContainer,
  ContentHeader,
  CreateLinkButton,
  PostsContainer,
  qetaTranslationRef,
  useIdentityApi,
  UserFollowButton,
  useUserInfo,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { UserStatsContent } from './UserStatsContent';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { Avatar, Box, makeStyles, Tab, Typography } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import AssessmentIcon from '@material-ui/icons/Assessment';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import CollectionsIcon from '@material-ui/icons/Collections';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import LinkIcon from '@material-ui/icons/Link';

const useStyles = makeStyles(theme => ({
  tabIcon: {
    marginRight: theme.spacing(1),
  },
  tabPanel: {
    padding: theme.spacing(3, 0),
  },
  avatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    marginRight: theme.spacing(3),
    boxShadow: theme.shadows[2],
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3, 0),
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
      aria-label={t('userPage.profileHeader', {})}
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
      <Box display="flex" flexDirection="column" justifyContent="center">
        <Box display="flex" alignItems="center">
          <Typography
            variant="h4"
            component="h2"
            id="user-name"
            style={{ fontWeight: 700 }}
          >
            {name}
          </Typography>
        </Box>
        {(secondaryTitle || user?.spec?.profile?.email) && (
          <Typography variant="h6" color="textSecondary">
            {secondaryTitle || user?.spec?.profile?.email}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <ContentHeader titleComponent={title}>
        {!loadingUser &&
          !userError &&
          currentUser?.userEntityRef !== identity && (
            <UserFollowButton
              userRef={identity}
              aria-label={t('userPage.followUser', { name })}
            />
          )}
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
      </ContentHeader>
      <TabContext value={tab}>
        <Box className={classes.tabList}>
          <TabList
            onChange={handleChange}
            aria-label={t('userPage.profileTab', {})}
            aria-labelledby="user-name"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              value="statistics"
              label={
                <TabLabel
                  icon={<AssessmentIcon className={classes.tabIcon} />}
                  label={t('userPage.statistics', {})}
                />
              }
            />
            <Tab
              value="questions"
              label={
                <TabLabel
                  icon={<HelpOutlineIcon className={classes.tabIcon} />}
                  label={t('userPage.questions', {})}
                />
              }
            />
            <Tab
              value="articles"
              label={
                <TabLabel
                  icon={<CollectionsBookmarkIcon className={classes.tabIcon} />}
                  label={t('userPage.articles', {})}
                />
              }
            />
            <Tab
              value="links"
              label={
                <TabLabel
                  icon={<LinkIcon className={classes.tabIcon} />}
                  label={t('userPage.links', {})}
                />
              }
            />
            <Tab
              value="collections"
              label={
                <TabLabel
                  icon={<CollectionsIcon className={classes.tabIcon} />}
                  label={t('userPage.collections', {})}
                />
              }
            />
            <Tab
              value="answers"
              label={
                <TabLabel
                  icon={<QuestionAnswerIcon className={classes.tabIcon} />}
                  label={t('userPage.answers', {})}
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
            prefix="user-questions"
          />
        </TabPanel>
        <TabPanel value="articles" className={classes.tabPanel}>
          <PostsContainer
            author={identity ?? ''}
            type="article"
            showNoQuestionsBtn={false}
            prefix="user-articles"
          />
        </TabPanel>
        <TabPanel value="links" className={classes.tabPanel}>
          <PostsContainer
            author={identity ?? ''}
            type="link"
            showNoQuestionsBtn={false}
            prefix="user-links"
          />
        </TabPanel>
        <TabPanel value="collections" className={classes.tabPanel}>
          <CollectionsContainer
            owner={identity ?? ''}
            prefix="user-collections"
          />
        </TabPanel>
        <TabPanel value="answers" className={classes.tabPanel}>
          <AnswersContainer
            author={identity ?? ''}
            title={t('userPage.answers', {})}
            prefix="user-answers"
          />
        </TabPanel>
      </TabContext>
    </>
  );
};
