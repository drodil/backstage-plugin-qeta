import React from 'react';
import { Content, ContentHeader, LinkButton } from '@backstage/core-components';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import { useStyles } from '../../utils/hooks';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { Container } from '@material-ui/core';
import { TopRankingUsers } from './TopRankingUsersCard';

export const StatisticsPage = () => {
  const styles = useStyles();
  return (
    <Content>
      <Container maxWidth="lg">
        <ContentHeader title="Statistics">
          <LinkButton
            to="/qeta"
            className={styles.marginRight}
            startIcon={<HomeOutlined />}
          >
            Back to questions
          </LinkButton>
          <AskQuestionButton />
        </ContentHeader>
        <TopRankingUsers />
      </Container>
    </Content>
  );
};
