import React from 'react';
import { Button } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import { Content, ContentHeader } from '@backstage/core-components';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { QuestionList } from '../HomePage/QuestionList';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  return (
    <Content>
      <ContentHeader title={`Questions by [${identity}]`}>
        <Button href="/qeta">Back to questions</Button>
        <Button variant="contained" href="/qeta/ask">
          Ask question
        </Button>
      </ContentHeader>
      <QuestionList author={identity ?? ''} />
    </Content>
  );
};
