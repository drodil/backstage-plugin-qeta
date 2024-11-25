import React from 'react';
import { VoteButtons } from '../Buttons/VoteButtons';
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
import { useTranslation } from '../../hooks';
import { VoteButtonContainer } from '../Utility/VoteButtonContainer';
import {
  Button,
  Card,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { ButtonContainer } from '../Buttons';

const useStyles = makeStyles(theme => ({
  answerCard: {
    marginTop: '1em',
  },
  highlight: {
    animation: 'highlight 5s',
  },
  '@keyframes highlight': {
    '0%': {
      boxShadow: `0px 0px 0px 3px ${theme.palette.secondary.light}`,
    },
    '100%': {
      boxShadow: 'none',
    },
  },
}));

export const AnswerCard = (props: {
  answer: AnswerResponse;
  question: PostResponse;
}) => {
  const { answer, question } = props;

  const [editMode, setEditMode] = React.useState(false);
  const [answerEntity, setAnswerEntity] = React.useState(answer);
  const { t } = useTranslation();
  const styles = useStyles();

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
        className={`qetaAnswerCard ${styles.answerCard} ${
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
              <VoteButtonContainer>
                <VoteButtons entity={answerEntity} post={question} />
                <LinkButton entity={answerEntity} />
              </VoteButtonContainer>
            </Grid>
            <Grid
              item
              style={{ display: 'inline-block', width: 'calc(100% - 70px)' }}
            >
              {editMode ? (
                <AnswerForm
                  post={question}
                  onPost={onAnswerEdit}
                  id={answerEntity.id}
                />
              ) : (
                <>
                  <Grid item style={{ minHeight: '6em', paddingTop: '0.5em' }}>
                    <Typography variant="body1" gutterBottom>
                      <MarkdownRenderer content={answerEntity.content} />
                    </Typography>
                  </Grid>
                  <Grid
                    container
                    item
                    spacing={1}
                    justifyContent="space-between"
                    alignItems="flex-end"
                  >
                    <Grid item style={{ alignSelf: 'flex-end' }}>
                      {(answerEntity.own ||
                        answerEntity.canDelete ||
                        answerEntity.canEdit) && (
                        <ButtonContainer>
                          {!answerEntity.correct &&
                            (answerEntity.own || answerEntity.canDelete) && (
                              <>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="secondary"
                                  onClick={handleDeleteModalOpen}
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
                        </ButtonContainer>
                      )}
                    </Grid>
                    <Grid item xs={3}>
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
