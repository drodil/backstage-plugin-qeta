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
import { useTranslation } from '../../hooks';
import { VoteButtonContainer } from '../Styled/VoteButtonContainer';
import { CardActionContainer } from '../Styled/CardActionContainer';

export const AnswerCard = (props: {
  answer: AnswerResponse;
  question: PostResponse;
}) => {
  const { answer, question } = props;

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
        sx={theme => ({
          marginTop: 3,
          '@keyframes highlight': {
            '0%': {
              boxShadow: `0px 0px 0px 3px ${theme.palette.secondary.light}`,
            },
            '100%': {
              boxShadow: 'none',
            },
          },
          animation: highlightedAnswer ? 'highlight 5s' : 'none',
        })}
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
              marginLeft={1}
              sx={{ display: 'inline-block', width: 'calc(100% - 70px)' }}
            >
              {editMode ? (
                <AnswerForm
                  post={question}
                  onPost={onAnswerEdit}
                  id={answerEntity.id}
                />
              ) : (
                <>
                  <Grid item sx={{ minHeight: '3rem', paddingTop: 1 }}>
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
                    sx={{ marginTop: 3 }}
                  >
                    <Grid item style={{ alignSelf: 'flex-end' }}>
                      {(answerEntity.own ||
                        answerEntity.canDelete ||
                        answerEntity.canEdit) && (
                        <CardActionContainer>
                          {!answerEntity.correct &&
                            (answerEntity.own || answerEntity.canDelete) && (
                              <>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="secondary"
                                  onClick={handleDeleteModalOpen}
                                  startIcon={<DeleteIcon />}
                                  sx={{ marginRight: 1 }}
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
                        </CardActionContainer>
                      )}
                    </Grid>
                    <Grid item xs={3} sx={{ padding: 0 }}>
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
