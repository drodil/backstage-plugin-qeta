import React from 'react';
import { Box, Button, Divider, Typography } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import {
  Content,
  ContentHeader,
  WarningPanel,
} from '@backstage/core-components';
import { useQetaApi } from '../../utils/hooks';
import { QuestionCard } from './QuestionCard';
import { AnswerResponse, QuestionResponse } from '../../api';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { AnswerForm } from './AnswerForm';
import { AnswerCard } from './AnswerCard';
import { Skeleton } from '@material-ui/lab';

export const QuestionPage = () => {
  const { id } = useParams();
  const [newAnswers, setNewAnswers] = React.useState<AnswerResponse[]>([]);

  const {
    value: question,
    loading,
    error,
  } = useQetaApi(api => api.getQuestion(id), [id]);

  const onAnswerPost = (answer: AnswerResponse) => {
    setNewAnswers(newAnswers.concat([answer]));
  };

  const getDescription = (q: QuestionResponse) => {
    return (
      <span>
        Asked{' '}
        <Box fontWeight="fontWeightMedium" display="inline" sx={{ mr: 2 }}>
          <RelativeTime value={q.created} />
        </Box>
        {q.updated && (
          <React.Fragment>
            Updated{' '}
            <Box fontWeight="fontWeightMedium" display="inline">
              <RelativeTime value={q.created} />
            </Box>
          </React.Fragment>
        )}
        Viewed{' '}
        <Box fontWeight="fontWeightMedium" display="inline">
          {q.views} times
        </Box>
      </span>
    );
  };

  if (loading) {
    return <Skeleton variant="rect" height={200} />;
  }

  if (error || question === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load question.">
        {error?.message}
      </WarningPanel>
    );
  }

  return (
    <Content>
      <ContentHeader
        title={question.title}
        // @ts-ignore
        description={getDescription(question)}
      >
        <Button href="/qeta">Back to questions</Button>
        <Button variant="contained" href="/qeta/ask">
          Ask question
        </Button>
      </ContentHeader>
      <QuestionCard question={question} />
      <Typography variant="h6">
        {question.answersCount + newAnswers.length} answers
      </Typography>
      {(question.answers ?? []).concat(newAnswers).map(a => {
        return (
          <Box key={a.id} sx={{ mb: 1 }}>
            <AnswerCard answer={a} question={question} />
            <Divider />
          </Box>
        );
      })}
      <Divider />
      <AnswerForm question={question} onPost={onAnswerPost} />
    </Content>
  );
};
