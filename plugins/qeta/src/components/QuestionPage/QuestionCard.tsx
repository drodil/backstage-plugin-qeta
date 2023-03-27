import { AnswerResponse, QuestionResponse } from '../../api';
import { Box, Card, CardContent, Grid, Typography } from '@material-ui/core';
import { Link, MarkdownContent } from '@backstage/core-components';
import React from 'react';
import { VoteButtons } from './VoteButtons';
import { useStyles } from '../../utils/hooks';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import { FavoriteButton } from './FavoriteButton';
import { AuthorBox } from './AuthorBox';
import { TagsAndEntities } from './TagsAndEntities';
import 'react-mde/lib/styles/css/react-mde-preview.css';
import { CommentSection } from '../CommentSection/CommentSection';

export const QuestionCard = (props: { question: QuestionResponse }) => {
  const { question } = props;
  const styles = useStyles();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [questionEntity, setQuestionEntity] = React.useState(question);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const onCommentAction = (q: QuestionResponse, _?: AnswerResponse) => {
    setQuestionEntity(q);
  };

  return (
    <>
      <Card variant="outlined" className={styles.questionCard}>
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
                  {question.own && (
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
                        to={`/qeta/questions/${questionEntity.id}/edit`}
                      >
                        Edit
                      </Link>
                      <DeleteModal
                        open={deleteModalOpen}
                        onClose={handleDeleteModalClose}
                        entity={questionEntity}
                      />
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
