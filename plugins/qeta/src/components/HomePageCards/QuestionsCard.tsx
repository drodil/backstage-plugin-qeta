import { Card, CardHeader, Divider, Grid } from '@material-ui/core';
import React from 'react';
import { useQetaApi } from '../../utils/hooks';
import { QuestionListItem } from '../QuestionsContainer/QuestionListItem';
import { GetQuestionsOptions } from '../../api/QetaApi';

export const QuestionsCard = (props: {
  type: string;
  title: string;
  options?: GetQuestionsOptions;
  icon?: React.ReactNode;
}) => {
  const { value: response } = useQetaApi(
    api => api.getQuestions({ limit: 3, ...props.options }),
    [],
  );

  const questions = response?.questions ?? [];
  if (questions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader style={{ paddingBottom: '8px' }} title={props.title} />
      <Grid container spacing={2}>
        {questions.map(question => {
          return (
            <Grid item xs={12} key={question.id}>
              <QuestionListItem question={question} />
              <Divider />
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
};
