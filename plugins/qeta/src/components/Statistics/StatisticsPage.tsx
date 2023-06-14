import React from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { Container } from '@material-ui/core';
import { TopRankingUsers } from './TopRankingUsersCard';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';

export const StatisticsPage = () => {
  return (
    <Content className="qetaStatisticsPage">
      <Container maxWidth="lg">
        <ContentHeader title="Statistics">
          <BackToQuestionsButton />
          <AskQuestionButton />
        </ContentHeader>
        <TopRankingUsers limit={10} />
      </Container>
    </Content>
  );
};
