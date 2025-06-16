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
import { Avatar, Box, Tab, Typography, Tooltip } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  const { name, initials, user, secondaryTitle } = useUserInfo(identity);
  const [tab, setTab] = useState('statistics');
  const { t } = useTranslationRef(qetaTranslationRef);
  const [_searchParams, setSearchParams] = useSearchParams();
  const {
    value: currentUser,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  const handleChange = (_event: ChangeEvent<{}>, newValue: string) => {
    setSearchParams({});
    setTab(newValue);
  };
  const title = (
    <Box
      style={{ display: 'flex', alignItems: 'center' }}
      role="banner"
      aria-label={t('userPage.profileHeader')}
    >
      <Box style={{ display: 'inline-block', marginRight: '1em' }}>
        <Avatar
          src={user?.spec?.profile?.picture}
          alt={name}
          variant="rounded"
          aria-label={t('userPage.profilePicture', { name })}
        >
          {initials}
        </Avatar>
      </Box>
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            onChange={handleChange}
            aria-label={t('userPage.profileTab')}
            aria-labelledby="user-name"
          >
            <Tab label={t('userPage.statistics')} value="statistics" />
            <Tab label={t('userPage.questions')} value="questions" />
            <Tab label={t('userPage.articles')} value="articles" />
            <Tab label={t('userPage.collections')} value="collections" />
            <Tab label={t('userPage.answers')} value="answers" />
          </TabList>
        </Box>
        <TabPanel value="statistics">
          <UserStatsContent userRef={identity ?? ''} />
        </TabPanel>
        <TabPanel value="questions">
          <PostsContainer
            author={identity ?? ''}
            showNoQuestionsBtn={false}
            type="question"
          />
        </TabPanel>
        <TabPanel value="articles">
          <PostsGrid
            author={identity ?? ''}
            type="article"
            showNoQuestionsBtn={false}
          />
        </TabPanel>
        <TabPanel value="collections">
          <CollectionsGrid owner={identity ?? ''} />
        </TabPanel>
        <TabPanel value="answers">
          <AnswersContainer
            author={identity ?? ''}
            title={t('userPage.answers')}
          />
        </TabPanel>
      </TabContext>
    </>
  );
};
