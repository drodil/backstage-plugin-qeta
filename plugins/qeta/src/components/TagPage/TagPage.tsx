import React from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { TagsContainer } from './TagsContainer';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { Container } from '@material-ui/core';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';
import { useTranslation } from '../../utils/hooks';
import { TagFollowButton } from '../Buttons/TagFollowButton';

export const TagPage = () => {
  const { tag } = useParams();
  const { t } = useTranslation();
  return (
    <Content>
      <Container maxWidth="lg">
        <ContentHeader
          title={
            tag
              ? t('tagPage.taggedWithTitle', { tag })
              : t('tagPage.defaultTitle')
          }
        >
          {tag && <TagFollowButton tag={tag} />}
          <BackToQuestionsButton />
          <AskQuestionButton tags={tag ? [tag] : undefined} />
        </ContentHeader>
        {tag ? <QuestionsContainer tags={[tag ?? '']} /> : <TagsContainer />}
      </Container>
    </Content>
  );
};
