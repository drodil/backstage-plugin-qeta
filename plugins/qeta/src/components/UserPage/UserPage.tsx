import React from 'react';
import { LinkButton } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { Content, ContentHeader } from '@backstage/core-components';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { formatEntityName } from '../../utils/utils';
import { useStyles } from '../../utils/hooks';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  const styles = useStyles();
  return (
    <Content>
      <ContentHeader title={`Questions by ${formatEntityName(identity)}`}>
        <LinkButton to="/qeta" className={styles.marginRight}>
          Back to questions
        </LinkButton>
        <AskQuestionButton />
      </ContentHeader>
      <QuestionsContainer author={identity ?? ''} />
    </Content>
  );
};
