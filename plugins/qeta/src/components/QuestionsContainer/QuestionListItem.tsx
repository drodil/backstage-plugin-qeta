import { QuestionResponse } from '../../api';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from '@material-ui/core';
import { Link } from '@backstage/core-components';
import React from 'react';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { formatEntityName } from '../../utils/utils';
import { TagsAndEntities } from '../QuestionPage/TagsAndEntities';

export const QuestionListItem = (props: { question: QuestionResponse }) => {
  const { question } = props;
  const theme = useTheme();
  return (
    <Card>
      <CardContent>
        <Grid container justifyContent="space-between">
          <Grid item xs={12}>
            <Typography gutterBottom variant="h5" component="div">
              <Link href={`/qeta/questions/${question.id}`}>
                {question.title}
              </Link>
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" display="block">
              By{' '}
              <Link href={`/qeta/users/${question.author}`}>
                {formatEntityName(question.author)}
              </Link>{' '}
              <RelativeTime
                value={question.created}
                titleFormat="YYYY/MM/DD HH:mm"
              />
            </Typography>
            <Typography variant="caption" display="inline" gutterBottom>
              Score: {question.score} {' | '}
            </Typography>
            <Typography
              variant="caption"
              style={{
                color: question.correctAnswer
                  ? theme.palette.success.main
                  : undefined,
              }}
              display="inline"
              gutterBottom
            >
              Answers: {question.answersCount}
            </Typography>
            <Typography variant="caption" display="inline" gutterBottom>
              {' | '} Views: {question.views}
            </Typography>
          </Grid>
          <Grid item>
            <TagsAndEntities question={question} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
