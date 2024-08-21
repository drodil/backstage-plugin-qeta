import React from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
import { QuestionsContainer } from '../QuestionsContainer';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { Container } from '@material-ui/core';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';
import { useTranslation } from '../../utils/hooks';

export const FavoritePage = () => {
  const { t } = useTranslation();
  return (
    <Content className="qetaFavoritePage">
      <Container maxWidth="lg">
        <ContentHeader title={t('favoritePage.title')}>
          <BackToQuestionsButton />
          <AskQuestionButton />
        </ContentHeader>
        <QuestionsContainer favorite />
      </Container>
    </Content>
  );
};
