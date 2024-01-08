import React from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { Container } from '@material-ui/core';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  const presentation = useEntityPresentation(identity);
  return (
    <Content>
      <Container maxWidth="lg">
        <ContentHeader title={`Questions by ${presentation.primaryTitle}`}>
          <BackToQuestionsButton />
          <AskQuestionButton />
        </ContentHeader>
        <QuestionsContainer
          author={identity ?? ''}
          showNoQuestionsBtn={false}
        />
      </Container>
    </Content>
  );
};
