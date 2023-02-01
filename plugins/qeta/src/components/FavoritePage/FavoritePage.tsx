import React from 'react';
import { Button } from '@material-ui/core';
import { Content, ContentHeader } from '@backstage/core-components';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import HelpOutline from '@material-ui/icons/HelpOutline';
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import { useStyles } from '../../utils/hooks';

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
        <Button
          variant="contained"
          href="/qeta/ask"
          startIcon={<HelpOutline />}
        >
          Ask question
        </Button>
      </ContentHeader>
      <QuestionsContainer favorite />
    </Content>
  );
};
