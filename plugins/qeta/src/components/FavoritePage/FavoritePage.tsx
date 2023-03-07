import React from 'react';
import { Button } from '@backstage/core-components';
import { Content, ContentHeader } from '@backstage/core-components';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import { useStyles } from '../../utils/hooks';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';

export const FavoritePage = () => {
  const styles = useStyles();
  return (
    <Content>
      <ContentHeader title="Your favorite questions">
        <Button
          href="/qeta"
          className={styles.marginRight}
          startIcon={<HomeOutlined />}
        >
          Back to questions
        </Button>
        <AskQuestionButton />
      </ContentHeader>
      <QuestionsContainer favorite />
    </Content>
  );
};
