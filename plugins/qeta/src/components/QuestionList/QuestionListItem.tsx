import { QuestionResponse } from '../../api';
import {
  Card,
  CardContent,
  Chip,
  Link,
  Typography,
  useTheme,
} from '@material-ui/core';
import React from 'react';
// @ts-ignore
import RelativeTime from 'react-relative-time';

export const QuestionListItem = (props: { question: QuestionResponse }) => {
  const { question } = props;
  const theme = useTheme();
  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          <Link href={`/qeta/questions/${question.id}`}>{question.title}</Link>
        </Typography>
        {question.tags &&
          question.tags.map(tag => (
            <Chip
              label={tag}
              size="small"
              component="a"
              href={`/qeta/tags/${tag}`}
              clickable
            />
          ))}
        <Typography variant="body2" display="block">
          By{' '}
          <Link href={`/qeta/users/${question.author}`}>{question.author}</Link>{' '}
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
      </CardContent>
    </Card>
  );
};
