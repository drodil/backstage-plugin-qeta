import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';
import { VoteButtons } from '../Buttons/VoteButtons';
import { AnswerForm } from '../AnswerForm';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import { CommentSection } from '../CommentSection/CommentSection';
import { LinkButton } from '../Buttons/LinkButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { DeleteModal } from '../DeleteModal';
import { useStyles, useTranslation } from '../../hooks';

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
          <Grid
            container
            spacing={2}
            justifyContent="flex-start"
            style={{ flexWrap: 'nowrap' }}
          >
            <Grid item justifyContent="center">
              <div className={styles.questionCardVote}>
                <VoteButtons entity={answerEntity} post={question} />
                <LinkButton entity={answerEntity} />
              </div>
            </Grid>
            <Grid item className={styles.answerCardContent} marginLeft={1}>
              {editMode ? (
                <AnswerForm
                  post={question}
                  onPost={onAnswerEdit}
                  id={answerEntity.id}
                />
              ) : (
                <>
                  <Grid item>
                    <Typography variant="body1" gutterBottom>
                      <MarkdownRenderer
                        className="qetaAndwerCardAnswerContent"
                        content={answerEntity.content}
                      />
                    </Typography>
                  </Grid>
                  <Grid
                    container
                    item
                    spacing={1}
                    justifyContent="space-between"
                    alignItems="flex-end"
                    className={styles.questionCardMetadata}
                  >
                    <Grid item style={{ alignSelf: 'flex-end' }}>
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
