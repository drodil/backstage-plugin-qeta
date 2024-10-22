import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { VoteButtons } from '../Buttons/VoteButtons';
import { useStyles, useTranslation } from '../../utils';
import { AnswerForm } from '../AnswerForm';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import { CommentSection } from '../CommentSection/CommentSection';
import { LinkButton } from '../Buttons/LinkButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { DeleteModal } from '../DeleteModal';

export const AnswerCard = (props: {
  answer: AnswerResponse;
  question: PostResponse;
}) => {
  const { answer, question } = props;
  const styles = useStyles();

  const [editMode, setEditMode] = React.useState(false);
  const [answerEntity, setAnswerEntity] = React.useState(answer);
  const { t } = useTranslation();

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const highlightedAnswer =
    window.location.hash.slice(1) === `answer_${answer.id}`;

  const onAnswerEdit = (a: AnswerResponse) => {
    setEditMode(false);
    setAnswerEntity(a);
  };

  const onCommentAction = (_: PostResponse, a?: AnswerResponse) => {
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
          <Grid container spacing={0} justifyContent="flex-start">
            <Grid container item xs={1} justifyContent="center">
              <div className={styles.questionCardVote}>
                <VoteButtons entity={answerEntity} post={question} />
                <LinkButton entity={answerEntity} />
              </div>
            </Grid>
            <Grid item xs={11} className={styles.answerCardContent}>
              {editMode ? (
                <AnswerForm
                  post={question}
                  onPost={onAnswerEdit}
                  id={answerEntity.id}
                />
              ) : (
                <>
                  <Typography variant="body1" gutterBottom>
                    <MarkdownRenderer
                      className="qetaAndwerCardAnswerContent"
                      content={answerEntity.content}
                    />
                  </Typography>
                  <Grid
                    container
                    item
                    spacing={1}
                    justifyContent="space-between"
                    alignItems="flex-end"
                    className={styles.questionCardMetadata}
                  >
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
                                  className={`${styles.marginLeft} qetaAnswerCardDeleteBtn`}
                                  startIcon={<DeleteIcon />}
                                >
                                  {t('deleteModal.deleteButton')}
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
                              {t('questionPage.editButton')}
                            </Button>
                          )}
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={3} className={styles.noPadding}>
                      <AuthorBox entity={answerEntity} />
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <CommentSection
        post={question}
        answer={answerEntity}
        onCommentPost={onCommentAction}
        onCommentDelete={onCommentAction}
      />
    </>
  );
};
