import React from 'react';
import { Content, ContentHeader, LinkButton } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { formatEntityName } from '../../utils/utils';
import { useStyles } from '../../utils/hooks';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { Container } from '@material-ui/core';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  const styles = useStyles();
  return (
    <Content>
      <Container maxWidth="lg">
        <ContentHeader title={`Questions by ${formatEntityName(identity)}`}>
          <LinkButton to="/qeta" className={styles.marginRight}>
            Back to questions
          </LinkButton>
          <AskQuestionButton />
        </ContentHeader>
        <QuestionsContainer author={identity ?? ''} />
      </Container>
    </Content>
  );
};
