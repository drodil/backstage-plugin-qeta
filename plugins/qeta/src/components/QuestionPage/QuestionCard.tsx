import { AnswerResponse, QuestionResponse } from '../../api';
import { Box, Card, CardContent, Grid, Typography } from '@material-ui/core';
import { Link, MarkdownContent } from '@backstage/core-components';
import React from 'react';
import { VoteButtons } from './VoteButtons';
import { useStyles } from '../../utils/hooks';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import { FavoriteButton } from './FavoriteButton';
import { AuthorBox } from './AuthorBox';
import { TagsAndEntities } from './TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { useRouteRef } from '@backstage/core-plugin-api';
import { editQuestionRouteRef } from '../../routes';

export const QuestionCard = (props: { question: QuestionResponse }) => {
  const { question } = props;
  const styles = useStyles();
  const editQuestionRoute = useRouteRef(editQuestionRouteRef);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [questionEntity, setQuestionEntity] = React.useState(question);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const onCommentAction = (q: QuestionResponse, _?: AnswerResponse) => {
    setQuestionEntity(q);
  };

  return (
    <>
      <Card
        variant="outlined"
        className={`qetaQuestionCard ${styles.questionCard}`}
      >
        <CardContent>
          <div className={styles.questionCardVote}>
            <VoteButtons entity={questionEntity} />
            <FavoriteButton entity={questionEntity} />
          </div>
          <div className={styles.questionCardContent}>
            <Typography variant="body1" gutterBottom>
              <MarkdownContent
                content={questionEntity.content}
                dialect="gfm"
                className={styles.markdownContent}
              />
            </Typography>
            <Box className={styles.questionCardMetadata}>
              <Grid container spacing={0}>
                <Grid item>
                  <TagsAndEntities question={questionEntity} />
                </Grid>
              </Grid>
              <Grid container justifyContent="space-around">
                <Grid item xs={9}>
                  {(question.own || question.canEdit || question.canDelete) && (
                    <Box className={styles.questionCardActions}>
                      {(question.own || question.canDelete) && (
                        <>
                          <Link
                            underline="none"
                            to="#"
                            onClick={handleDeleteModalOpen}
                            className="qetaQuestionCardDeleteBtn"
                          >
                            Delete
                          </Link>
                          <DeleteModal
                            open={deleteModalOpen}
                            onClose={handleDeleteModalClose}
                            entity={questionEntity}
                          />
                        </>
                      )}
                      {(question.own || question.canEdit) && (
                        <Link
                          underline="none"
                          to={editQuestionRoute({
                            id: question.id.toString(10),
                          })}
                          className="qetaQuestionCardEditBtn"
                        >
                          Edit
                        </Link>
                      )}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={3}>
                  <AuthorBox entity={questionEntity} />
                </Grid>
              </Grid>
            </Box>
          </div>
        </CardContent>
      </Card>
      <CommentSection
        question={questionEntity}
        onCommentDelete={onCommentAction}
        onCommentPost={onCommentAction}
      />
    </>
  );
};
