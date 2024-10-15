import React from 'react';
import { ContentHeader } from '@backstage/core-components';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { TopRankingUsers } from './TopRankingUsersCard';

export const StatisticsPage = () => {
  return (
    <>
      <ContentHeader title="Statistics">
        <AskQuestionButton />
      </ContentHeader>
      <TopRankingUsers limit={10} />
    </>
  );
};
