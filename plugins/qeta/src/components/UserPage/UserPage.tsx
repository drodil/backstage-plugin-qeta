import React from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { formatEntityName } from '../../utils/utils';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { Container } from '@material-ui/core';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  return (
    <Content>
      <Container maxWidth="lg">
        <ContentHeader title={`Questions by ${formatEntityName(identity)}`}>
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
