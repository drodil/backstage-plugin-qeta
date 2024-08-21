import React, { useState } from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
import { useParams, useSearchParams } from 'react-router-dom';
import { QuestionsContainer } from '../QuestionsContainer';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { Box, Container, Tab } from '@material-ui/core';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { AnswersContainer } from '../AnswersContainer';
import { useTranslation } from '../../utils/hooks';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  const presentation = useEntityPresentation(identity);
  const [tab, setTab] = useState('questions');
  const { t } = useTranslation();
  const [_searchParams, setSearchParams] = useSearchParams();

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setSearchParams({});
    setTab(newValue);
  };
  return (
    <Content>
      <Container maxWidth="lg">
        <ContentHeader title={`${presentation.primaryTitle}`}>
          <BackToQuestionsButton />
          <AskQuestionButton />
        </ContentHeader>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={handleChange}
              aria-label={t('userPage.profileTab')}
            >
              <Tab label={t('userPage.questions')} value="questions" />
              <Tab label={t('userPage.answers')} value="answers" />
            </TabList>
          </Box>
          <TabPanel value="questions">
            <QuestionsContainer
              author={identity ?? ''}
              showNoQuestionsBtn={false}
            />
          </TabPanel>
          <TabPanel value="answers">
            <AnswersContainer
              author={identity ?? ''}
              title={t('userPage.answers')}
            />
          </TabPanel>
        </TabContext>
      </Container>
    </Content>
  );
};
