import { AnswerResponse, QuestionResponse } from '../../api';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Link,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { MarkdownContent } from '@backstage/core-components';
import 'style-loader!css-loader!sass-loader!../../style/_QuestionCard.scss';
import { VoteButtons } from './VoteButtons';

export const AnswerCard = (props: {
  answer: AnswerResponse;
  question: QuestionResponse;
}) => {
  const { answer, question } = props;

  return (
    <Card>
      <CardContent>
        <Grid container spacing={0}>
          <Grid item className="qeta-questionpage-vote">
            <VoteButtons entity={answer} question={question} />
          </Grid>
          <Grid item>
            <Typography variant="body1" gutterBottom>
              <MarkdownContent content={answer.content} dialect="gfm" />
            </Typography>
            <Box>
              By{' '}
              <Link href={`/qeta/user/${answer.author}`}>{answer.author}</Link>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
