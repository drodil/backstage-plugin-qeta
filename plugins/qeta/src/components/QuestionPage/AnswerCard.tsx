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
import { formatUsername } from '../../utils/utils';
import { DeleteModal } from '../DeleteModal/DeleteModal';

export const AnswerCard = (props: {
  answer: AnswerResponse;
  question: QuestionResponse;
}) => {
  const { answer, question } = props;
  const styles = useStyles();

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);

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
              <Link href={`/qeta/users/${answer.author}`}>
                {formatUsername(answer.author)}
              </Link>
            </Box>
            {answer.own && (
              <Box className={styles.questionCardActions}>
                <Link underline="none" onClick={handleDeleteModalOpen}>
                  Delete
                </Link>
                <DeleteModal
                  open={deleteModalOpen}
                  onClose={handleDeleteModalClose}
                  entity={answer}
                  question={question}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
