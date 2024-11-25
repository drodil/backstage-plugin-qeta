import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
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
import { useTranslation } from '../../hooks';
import { VoteButtonContainer } from '../Styled/VoteButtonContainer';
import { CardActionContainer } from '../Styled/CardActionContainer';

export const QuestionCard = (props: { question: PostResponse }) => {
  const { question } = props;
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
      <Card variant="outlined" sx={{ marginBottom: 1, position: 'relative' }}>
        <CardContent>
          <Grid
            container
            spacing={2}
            justifyContent="flex-start"
            style={{ flexWrap: 'nowrap' }}
          >
            <Grid item justifyContent="center">
              <VoteButtonContainer>
                <VoteButtons entity={questionEntity} />
                <FavoriteButton entity={questionEntity} />
                <LinkButton entity={questionEntity} />
              </VoteButtonContainer>
            </Grid>
            <Grid item marginLeft={1} sx={{ flexGrow: 1 }}>
              <Grid item sx={{ minHeight: '5em', paddingTop: 1 }}>
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
                sx={{ marginTop: 3 }}
              >
                <Grid item style={{ alignSelf: 'flex-end' }}>
                  <TagsAndEntities entity={questionEntity} />
                  {(question.canEdit || question.canDelete) && (
                    <CardActionContainer>
                      {question.canDelete && (
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
                    </CardActionContainer>
                  )}
                </Grid>
                <Grid item xs={3}>
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
