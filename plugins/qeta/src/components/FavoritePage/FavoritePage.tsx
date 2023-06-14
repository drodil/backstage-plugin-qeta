import React from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { Container } from '@material-ui/core';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';

export const FavoritePage = () => {
  return (
    <Content className="qetaFavoritePage">
      <Container maxWidth="lg">
        <ContentHeader title="Your favorite questions">
          <BackToQuestionsButton />
          <AskQuestionButton />
        </ContentHeader>
        <QuestionsContainer favorite />
      </Container>
    </Content>
  );
};
