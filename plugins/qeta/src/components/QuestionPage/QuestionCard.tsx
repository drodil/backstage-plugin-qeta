import { QuestionResponse } from '../../api';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Link,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { MarkdownContent } from '@backstage/core-components';
import 'style-loader!css-loader!sass-loader!../../style/_QuestionCard.scss';
import { VoteButtons } from './VoteButtons';

export const QuestionCard = (props: { question: QuestionResponse }) => {
  const { question } = props;

  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container spacing={0}>
          <Grid item className="qeta-questionpage-vote">
            <VoteButtons entity={question} />
          </Grid>
          <Grid item>
            <Typography variant="body1" gutterBottom>
              <MarkdownContent content={question.content} dialect="gfm" />
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
            <Box>
              By{' '}
              <Link href={`/qeta/user/${question.author}`}>
                {question.author}
              </Link>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
