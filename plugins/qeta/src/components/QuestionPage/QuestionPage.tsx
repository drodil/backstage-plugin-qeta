import React from 'react';
import {
  Box,
  Container,
  Divider,
  FormControl,
  Grid,
  Select,
  Typography,
} from '@material-ui/core';
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
import { AnswerForm } from './AnswerForm';
import { AnswerCard } from './AnswerCard';
import { Skeleton } from '@material-ui/lab';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';
import { formatEntityName } from '../../utils/utils';
import { useRouteRef } from '@backstage/core-plugin-api';
import { userRouteRef } from '../../routes';
import { Answer } from '@drodil/backstage-plugin-qeta-common';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip/RelativeTimeWithTooltip';

export const QuestionPage = () => {
  const { id } = useParams();
  const styles = useStyles();
  const userRoute = useRouteRef(userRouteRef);
  const [newAnswers, setNewAnswers] = React.useState<AnswerResponse[]>([]);
  const [answerSort, setAnswerSort] = React.useState<string>('default');

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
          <RelativeTimeWithTooltip value={q.created} />
        </Box>
        {q.updated && (
          <React.Fragment>
            Updated{' '}
            <Box fontWeight="fontWeightMedium" display="inline" sx={{ mr: 2 }}>
              <RelativeTimeWithTooltip value={q.updated} /> by{' '}
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

  const sortAnswers = (a: Answer, b: Answer) => {
    if (answerSort === 'default') {
      return 1;
    }

    const parts = answerSort.split('_');
    const field = parts[0];
    const order = parts[1];

    let ret = -1;
    switch (field) {
      case 'created':
        ret = a.created > b.created ? -1 : 1;
        break;
      case 'score':
        ret = a.score > b.score ? -1 : 1;
        break;
      case 'author':
        ret = a.author > b.author ? -1 : 1;
        break;
      case 'comments':
        ret = (a.comments?.length ?? 0) > (b.comments?.length ?? 0) ? -1 : 1;
        break;
      case 'updated':
        ret = (a.updated ?? a.created) > (b.updated ?? b.created) ? -1 : 1;
        break;
      default:
        return 1;
    }

    if (order === 'desc') {
      ret *= -1;
    }
    return ret;
  };

  const allQuestions = (question.answers ?? []).concat(newAnswers);
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
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6">
                {question.answersCount + newAnswers.length} answers
              </Typography>
            </Grid>
            {allQuestions.length > 1 && (
              <Grid item>
                <FormControl>
                  <Select
                    native
                    label="Sort answers"
                    value={answerSort}
                    onChange={val => setAnswerSort(val.target.value as string)}
                    inputProps={{
                      name: 'sortAnswers',
                      id: 'sort-answers',
                    }}
                  >
                    <option value="default">Default</option>
                    <option value="created_desc">Created (desc)</option>
                    <option value="created_asc">Created (asc)</option>
                    <option value="score_desc">Score (desc)</option>
                    <option value="score_asc">Score (asc)</option>
                    <option value="comments_desc">Comments (desc)</option>
                    <option value="comments_asc">Comments (asc)</option>
                    <option value="author_desc">Author (desc)</option>
                    <option value="author_asc">Author (asc)</option>
                    <option value="updated_desc">Updated (desc)</option>
                    <option value="updated_asc">Updated (asc)</option>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Box>
        {allQuestions.sort(sortAnswers).map(a => {
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
