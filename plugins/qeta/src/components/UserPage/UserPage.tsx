import React from 'react';
import { Button } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import { Content, ContentHeader } from '@backstage/core-components';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { formatUsername } from '../../utils/utils';
import { useStyles } from '../../utils/hooks';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  const styles = useStyles();
  return (
    <Content>
      <ContentHeader title={`Questions by ${formatUsername(identity)}`}>
        <Button href="/qeta" className={styles.marginRight}>
          Back to questions
        </Button>
        <Button variant="contained" href="/qeta/ask">
          Ask question
        </Button>
      </ContentHeader>
      <QuestionsContainer author={identity ?? ''} />
    </Content>
  );
};
