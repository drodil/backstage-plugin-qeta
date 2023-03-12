import { QuestionResponse } from '../../api';
import { Box, Card, CardContent, Grid, Typography } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import React from 'react';
import { MarkdownContent } from '@backstage/core-components';
import { VoteButtons } from './VoteButtons';
import { useStyles } from '../../utils/hooks';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import { FavoriteButton } from './FavoriteButton';
import { AuthorBox } from './AuthorBox';
import { TagsAndEntities } from './TagsAndEntities';

export const QuestionCard = (props: { question: QuestionResponse }) => {
  const { question } = props;
  const styles = useStyles();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);

  return (
    <Card variant="outlined">
      <CardContent className={styles.questionCard}>
        <div className={styles.questionCardVote}>
          <VoteButtons entity={question} />
          <FavoriteButton entity={question} />
        </div>
        <div className={styles.questionCardContent}>
          <Typography variant="body1" gutterBottom>
            <MarkdownContent
              content={question.content}
              dialect="gfm"
              className={styles.markdownContent}
            />
          </Typography>
          <Box className={styles.questionCardMetadata}>
            <Grid container spacing={0}>
              <Grid item>
                <TagsAndEntities question={question} />
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
                      to={`/qeta/questions/${question.id}/edit`}
                    >
                      Edit
                    </Link>
                    <DeleteModal
                      open={deleteModalOpen}
                      onClose={handleDeleteModalClose}
                      entity={question}
                    />
                  </Box>
                )}
              </Grid>
              <Grid item xs={3}>
                <AuthorBox entity={question} />
              </Grid>
            </Grid>
          </Box>
        </div>
      </CardContent>
    </Card>
  );
};
