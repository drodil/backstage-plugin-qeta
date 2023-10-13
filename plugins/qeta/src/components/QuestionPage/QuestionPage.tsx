import React from 'react';
import { Box, Container, Divider, Typography } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  Link,
  WarningPanel,
} from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { useQetaApi, useStyles } from '../../utils/hooks';
import { QuestionCard } from './QuestionCard';
import { AnswerResponse, QuestionResponse } from '../../api';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { AnswerForm } from './AnswerForm';
import { AnswerCard } from './AnswerCard';
import { Skeleton } from '@material-ui/lab';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';
import { formatEntityName } from '../../utils/utils';
import { useRouteRef } from '@backstage/core-plugin-api';
import { userRouteRef } from '../../routes';

export const QuestionPage = () => {
  const { id } = useParams();
  const styles = useStyles();
  const userRoute = useRouteRef(userRouteRef);
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
            <Box fontWeight="fontWeightMedium" display="inline" sx={{ mr: 2 }}>
              <RelativeTime value={q.updated} /> by{' '}
              <Link to={`${userRoute()}/${q.author}`}>
                {formatEntityName(q.updatedBy)}
              </Link>
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
      <Container maxWidth="lg">
        <ContentHeader
          title={question.title}
          // @ts-ignore
          description={getDescription(question)}
        >
          <AskQuestionButton />
          <BackToQuestionsButton />
        </ContentHeader>
        <QuestionCard question={question} />
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6">
            {question.answersCount + newAnswers.length} answers
          </Typography>
        </Box>
        {(question.answers ?? []).concat(newAnswers).map(a => {
          return (
            <>
              <Divider className={styles.questionDivider} />
              <Box key={a.id} sx={{ mb: 1 }}>
                <AnswerCard answer={a} question={question} />
              </Box>
            </>
          );
        })}
        <Divider className={styles.questionDivider} />
        <AnswerForm question={question} onPost={onAnswerPost} />
      </Container>
    </Content>
  );
};
