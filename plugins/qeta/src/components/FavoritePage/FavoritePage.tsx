import React from 'react';
import { ContentHeader } from '@backstage/core-components';
import { QuestionsContainer } from '../QuestionsContainer';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { useTranslation } from '../../utils/hooks';

export const FavoritePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <ContentHeader title={t('favoritePage.title')}>
        <AskQuestionButton />
      </ContentHeader>
      <QuestionsContainer favorite />
    </>
  );
};
