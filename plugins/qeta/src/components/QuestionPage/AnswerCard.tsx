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
import { formatEntityName } from '../../utils/utils';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import { AnswerForm } from './AnswerForm';
// @ts-ignore
import RelativeTime from 'react-relative-time';

export const AnswerCard = (props: {
  answer: AnswerResponse;
  question: QuestionResponse;
}) => {
  const { answer, question } = props;
  const styles = useStyles();

  const [editMode, setEditMode] = React.useState(false);
  const [answerEntity, setAnswerEntity] = React.useState(answer);

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);

  const onAnswerEdit = (a: AnswerResponse) => {
    setEditMode(false);
    setAnswerEntity(a);
  };

  return (
    <Card id={`a${answer.id}`}>
      <CardContent>
        <Grid container spacing={0}>
          <Grid item className={styles.questionCardVote}>
            <VoteButtons entity={answerEntity} question={question} />
          </Grid>
          <Grid item>
            {editMode ? (
              <AnswerForm
                question={question}
                onPost={onAnswerEdit}
                id={answerEntity.id}
              />
            ) : (
              <>
                <Typography variant="body1" gutterBottom>
                  <MarkdownContent
                    content={answerEntity.content}
                    dialect="gfm"
                  />
                </Typography>
                <Box>
                  <Typography variant="caption" gutterBottom>
                    By{' '}
                    <Link href={`/qeta/users/${answerEntity.author}`}>
                      {formatEntityName(answerEntity.author)}
                    </Link>{' '}
                    <RelativeTime value={answerEntity.created} />
                    {answerEntity.updated && (
                      <>
                        {' '}
                        (updated <RelativeTime value={answerEntity.updated} />)
                      </>
                    )}
                  </Typography>
                </Box>
                {answerEntity.own && (
                  <Box className={styles.questionCardActions}>
                    <Link
                      underline="none"
                      href="#"
                      onClick={handleDeleteModalOpen}
                    >
                      Delete
                    </Link>
                    <Link
                      underline="none"
                      href="#"
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </Link>
                    <DeleteModal
                      open={deleteModalOpen}
                      onClose={handleDeleteModalClose}
                      entity={answerEntity}
                      question={question}
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
