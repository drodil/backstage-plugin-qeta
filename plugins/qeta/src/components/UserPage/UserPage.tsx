import React, { useState } from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  AnswersContainer,
  AskQuestionButton,
  CollectionsGrid,
  PostsContainer,
  PostsGrid,
  useIdentityApi,
  UserFollowButton,
  useTranslation,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { UserStatsContent } from './UserStatsContent';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  const presentation = useEntityPresentation(identity);
  const [tab, setTab] = useState('statistics');
  const { t } = useTranslation();
  const [_searchParams, setSearchParams] = useSearchParams();
  const {
    value: user,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setSearchParams({});
    setTab(newValue);
  };
  const title = (
    <Typography variant="h5" component="h2">
      {presentation.primaryTitle}
      {!loadingUser && !userError && user?.userEntityRef !== identity && (
        <UserFollowButton userRef={identity} />
      )}
    </Typography>
  );

  return (
    <>
      <ContentHeader titleComponent={title}>
        <AskQuestionButton />
        <WriteArticleButton />
      </ContentHeader>
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            onChange={handleChange}
            aria-label={t('userPage.profileTab')}
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
          <PostsGrid author={identity ?? ''} type="article" />
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
