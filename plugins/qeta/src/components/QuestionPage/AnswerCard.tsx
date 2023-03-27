import { AnswerResponse, QuestionResponse } from '../../api';
import { Box, Card, CardContent, Grid, Typography } from '@material-ui/core';
import { Link, MarkdownContent } from '@backstage/core-components';
import React from 'react';
import { VoteButtons } from './VoteButtons';
import { useStyles } from '../../utils/hooks';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import { AnswerForm } from './AnswerForm';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { AuthorBox } from './AuthorBox';
import { CommentSection } from '../CommentSection/CommentSection';

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

  const onCommentAction = (_: QuestionResponse, a?: AnswerResponse) => {
    if (a) {
      setAnswerEntity(a);
    }
  };

  return (
    <>
      <Card id={`a${answer.id}`} className={styles.questionCard}>
        <CardContent>
          <div className={styles.questionCardVote}>
            <VoteButtons entity={answerEntity} question={question} />
          </div>
          <div className={styles.questionCardContent}>
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
                    className={styles.markdownContent}
                    content={answerEntity.content}
                    dialect="gfm"
                  />
                </Typography>
                <Grid container justifyContent="space-around">
                  <Grid item xs={9}>
                    {answerEntity.own && (
                      <Box className={styles.questionCardActions}>
                        <Link
                          underline="none"
                          to="#"
                          onClick={handleDeleteModalOpen}
                        >
                          Delete
                        </Link>
                        <Link
                          underline="none"
                          to="#"
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
                  </Grid>
                  <Grid item xs={3}>
                    <AuthorBox entity={answerEntity} />
                  </Grid>
                </Grid>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <CommentSection
        question={question}
        answer={answerEntity}
        onCommentPost={onCommentAction}
        onCommentDelete={onCommentAction}
      />
    </>
  );
};
