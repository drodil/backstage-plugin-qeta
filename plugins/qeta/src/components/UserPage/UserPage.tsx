import React, { useState } from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  AnswersContainer,
  AskQuestionButton,
  PostsContainer,
  PostsGrid,
  useTranslation,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { Box, Tab } from '@material-ui/core';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { UserStatsContent } from './UserStatsContent';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  const presentation = useEntityPresentation(identity);
  const [tab, setTab] = useState('statistics');
  const { t } = useTranslation();
  const [_searchParams, setSearchParams] = useSearchParams();

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setSearchParams({});
    setTab(newValue);
  };
  return (
    <>
      <ContentHeader title={`${presentation.primaryTitle}`}>
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
