import React from 'react';
import { Content, ContentHeader, LinkButton } from '@backstage/core-components';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import { useStyles } from '../../utils/hooks';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { Container } from '@material-ui/core';

export const FavoritePage = () => {
  const styles = useStyles();
  return (
    <Content>
      <Container maxWidth="lg">
        <ContentHeader title="Your favorite questions">
          <LinkButton
            to="/qeta"
            className={styles.marginRight}
            startIcon={<HomeOutlined />}
          >
            Back to questions
          </LinkButton>
          <AskQuestionButton />
        </ContentHeader>
        <QuestionsContainer favorite />
      </Container>
    </Content>
  );
};
