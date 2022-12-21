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
import { VoteButtons } from './VoteButtons';
import { useStyles } from '../../utils/hooks';

export const AnswerCard = (props: {
  answer: AnswerResponse;
  question: QuestionResponse;
}) => {
  const { answer, question } = props;
  const styles = useStyles();

  return (
    <Card id={`a${answer.id}`}>
      <CardContent>
        <Grid container spacing={0}>
          <Grid item className={styles.questionCardVote}>
            <VoteButtons entity={answer} question={question} />
          </Grid>
          <Grid item>
            <Typography variant="body1" gutterBottom>
              <MarkdownContent content={answer.content} dialect="gfm" />
            </Typography>
            <Box>
              By{' '}
              <Link href={`/qeta/users/${answer.author}`}>{answer.author}</Link>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
