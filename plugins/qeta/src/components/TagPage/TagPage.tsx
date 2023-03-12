import React from 'react';
import { LinkButton } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { Content, ContentHeader } from '@backstage/core-components';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { TagsContainer } from './TagsContainer';
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import { useStyles } from '../../utils/hooks';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';

export const TagPage = () => {
  const { tag } = useParams();
  const styles = useStyles();
  return (
    <Content>
      <ContentHeader title={tag ? `Questions tagged [${tag}]` : 'Tags'}>
        <LinkButton
          to="/qeta"
          className={styles.marginRight}
          startIcon={<HomeOutlined />}
        >
          Back to questions
        </LinkButton>
        <AskQuestionButton />
      </ContentHeader>
      {tag ? <QuestionsContainer tags={[tag ?? '']} /> : <TagsContainer />}
    </Content>
  );
};
