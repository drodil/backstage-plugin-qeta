import {
  AnswerResponse,
  QuestionResponse,
} from '@drodil/backstage-plugin-qeta-common';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@material-ui/core';
import { MarkdownContent } from '@backstage/core-components';
import React from 'react';
import { VoteButtons } from './VoteButtons';
import { useStyles } from '../../utils/hooks';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import { AnswerForm } from './AnswerForm';
import { AuthorBox } from './AuthorBox';
import { CommentSection } from '../CommentSection/CommentSection';
import { LinkButton } from './LinkButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

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
  const highlightedAnswer =
    window.location.hash.slice(1) === `answer_${answer.id}`;

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
      <Card
        id={`answer_${answer.id}`}
        className={`qetaAnswerCard ${styles.questionCard} ${
          highlightedAnswer ? styles.highlight : ''
        }`}
      >
        <CardContent>
          <div className={styles.questionCardVote}>
            <VoteButtons entity={answerEntity} question={question} />
            <LinkButton entity={answerEntity} />
          </div>
          <div className={styles.answerCardContent}>
            {editMode ? (
              <AnswerForm
                question={question}
                onPost={onAnswerEdit}
                id={answerEntity.id}
              />
            ) : (
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="body1" gutterBottom>
                    <MarkdownContent
                      className={`qetaAndwerCardAnswerContent ${styles.markdownContent}`}
                      content={answerEntity.content}
                      dialect="gfm"
                    />
                  </Typography>
                </Grid>
                <Grid item container justifyContent="space-around">
                  <Grid item xs={9} style={{ alignSelf: 'flex-end' }}>
                    {(answerEntity.own ||
                      answerEntity.canDelete ||
                      answerEntity.canEdit) && (
                      <Box
                        className={`qetaAnswerCardActions ${styles.questionCardActions}`}
                      >
                        {!answerEntity.correct &&
                          (answerEntity.own || answerEntity.canDelete) && (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                color="secondary"
                                onClick={handleDeleteModalOpen}
                                className={`${styles.marginRight} qetaAnswerCardDeleteBtn`}
                                startIcon={<DeleteIcon />}
                              >
                                Delete
                              </Button>
                              <DeleteModal
                                open={deleteModalOpen}
                                onClose={handleDeleteModalClose}
                                entity={answerEntity}
                                question={question}
                              />
                            </>
                          )}
                        {(answerEntity.own || answerEntity.canEdit) && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => setEditMode(true)}
                            className="qetaAnswerCardEditBtn"
                          >
                            Edit
                          </Button>
                        )}
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={3} className={styles.noPadding}>
                    <AuthorBox entity={answerEntity} />
                  </Grid>
                </Grid>
              </Grid>
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
