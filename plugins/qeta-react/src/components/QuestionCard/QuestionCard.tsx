import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import React, { useEffect } from 'react';
import { VoteButtons } from '../Buttons/VoteButtons';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { useRouteRef } from '@backstage/core-plugin-api';
import { LinkButton } from '../Buttons/LinkButton';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { editQuestionRouteRef } from '../../routes';
import { useNavigate } from 'react-router-dom';
import { useStyles, useTranslation } from '../../hooks';

export const QuestionCard = (props: { question: PostResponse }) => {
  const { question } = props;
  const styles = useStyles();
  const navigate = useNavigate();
  const editQuestionRoute = useRouteRef(editQuestionRouteRef);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [questionEntity, setQuestionEntity] = React.useState(question);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const { t } = useTranslation();
  const onCommentAction = (q: PostResponse, _?: AnswerResponse) => {
    setQuestionEntity(q);
  };

  const highlightedAnswer = window.location.hash.slice(1) ?? undefined;
  useEffect(() => {
    if (highlightedAnswer) {
      try {
        const element = document.querySelector(`#${highlightedAnswer}`);
        if (element) {
          element.scrollIntoView();
        }
      } catch (e) {
        // NOOP
      }
    }
  }, [highlightedAnswer]);

  return (
    <>
      <Card
        variant="outlined"
        className={`qetaQuestionCard ${styles.questionCard}`}
      >
        <CardContent>
          <Grid
            container
            spacing={0}
            justifyContent="flex-start"
            style={{ flexWrap: 'nowrap' }}
          >
            <Grid item justifyContent="center">
              <div className={styles.questionCardVote}>
                <VoteButtons entity={questionEntity} />
                <FavoriteButton entity={questionEntity} />
                <LinkButton entity={questionEntity} />
              </div>
            </Grid>
            <Grid item className={styles.questionCardContent}>
              <Grid item>
                <Typography variant="body1" gutterBottom>
                  <MarkdownRenderer content={questionEntity.content} />
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
                  <TagsAndEntities entity={questionEntity} />
                  {(question.canEdit || question.canDelete) && (
                    <Box className={styles.questionCardActions}>
                      {question.canDelete && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            color="secondary"
                            onClick={handleDeleteModalOpen}
                            className={`${styles.marginRight} qetaQuestionCardDeleteBtn`}
                            startIcon={<DeleteIcon />}
                          >
                            {t('deleteModal.deleteButton')}
                          </Button>
                          <DeleteModal
                            open={deleteModalOpen}
                            onClose={handleDeleteModalClose}
                            entity={questionEntity}
                          />
                        </>
                      )}
                      {question.canEdit && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            navigate(
                              editQuestionRoute({
                                id: question.id.toString(10),
                              }),
                            )
                          }
                          className="qetaQuestionCardEditBtn"
                        >
                          {t('questionPage.editButton')}
                        </Button>
                      )}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={3} className={styles.noPadding}>
                  <AuthorBox entity={questionEntity} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <CommentSection
        post={questionEntity}
        onCommentDelete={onCommentAction}
        onCommentPost={onCommentAction}
      />
    </>
  );
};
