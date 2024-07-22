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
import React, { useEffect } from 'react';
import { VoteButtons } from './VoteButtons';
import { useStyles } from '../../utils/hooks';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { FavoriteButton } from './FavoriteButton';
import { AuthorBox } from './AuthorBox';
import { TagsAndEntities } from './TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { useRouteRef } from '@backstage/core-plugin-api';
import { editQuestionRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { LinkButton } from './LinkButton';

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
          <div className={styles.questionCardVote}>
            <VoteButtons entity={questionEntity} />
            <FavoriteButton entity={questionEntity} />
            <LinkButton entity={questionEntity} />
          </div>
          <div className={styles.questionCardContent}>
            <Typography variant="body1" gutterBottom>
              <MarkdownContent
                content={questionEntity.content}
                dialect="gfm"
                className={styles.markdownContent}
              />
            </Typography>
            <Grid
              container
              item
              justifyContent="space-around"
              className={styles.questionCardMetadata}
            >
              <Grid item xs={9} style={{ alignSelf: 'flex-end' }}>
                <TagsAndEntities question={questionEntity} />
                {(question.own || question.canEdit || question.canDelete) && (
                  <Box className={styles.questionCardActions}>
                    {(question.own || question.canDelete) && (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          onClick={handleDeleteModalOpen}
                          className={`${styles.marginRight} qetaQuestionCardDeleteBtn`}
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                        <DeleteModal
                          open={deleteModalOpen}
                          onClose={handleDeleteModalClose}
                          entity={questionEntity}
                        />
                      </>
                    )}
                    {(question.own || question.canEdit) && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        href={editQuestionRoute({
                          id: question.id.toString(10),
                        })}
                        className="qetaQuestionCardEditBtn"
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                )}
              </Grid>
              <Grid item xs={3} className={styles.noPadding}>
                <AuthorBox entity={questionEntity} />
              </Grid>
            </Grid>
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
