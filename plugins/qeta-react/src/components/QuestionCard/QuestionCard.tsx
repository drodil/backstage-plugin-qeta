import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import React, { useEffect } from 'react';
import { VoteButtons } from '../Buttons/VoteButtons';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
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
import { VoteButtonContainer } from '../Utility/VoteButtonContainer';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  makeStyles,
} from '@material-ui/core';

export type QuestionCardClassKeys =
  | 'root'
  | 'contentContainer'
  | 'markdownContainer'
  | 'buttons'
  | 'metadata';

const useStyles = makeStyles(
  () => ({
    root: {},
    contentContainer: {
      marginLeft: '0.5em',
      width: 'calc(100% - 70px)',
    },
    markdownContainer: {
      minHeight: '6em',
      paddingBottom: '0.5em',
    },
    buttons: {
      marginTop: '1em',
      '& *:not(:last-child)': {
        marginRight: '0.3em',
      },
    },
    metadata: {
      marginTop: '1em',
    },
  }),
  { name: 'QetaQuestionCard' },
);

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
  const styles = useStyles();

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
      <Card variant="outlined" className={styles.root}>
        <CardContent>
          <Grid
            container
            spacing={2}
            justifyContent="flex-start"
            style={{ flexWrap: 'nowrap' }}
          >
            <Grid item>
              <VoteButtonContainer>
                <VoteButtons entity={questionEntity} />
                <FavoriteButton entity={questionEntity} />
                <LinkButton entity={questionEntity} />
              </VoteButtonContainer>
            </Grid>
            <Grid
              item
              className={styles.contentContainer}
              style={{ flexGrow: '1' }}
            >
              <Grid item className={styles.markdownContainer}>
                <MarkdownRenderer content={questionEntity.content} />
              </Grid>
              <Grid
                container
                item
                spacing={1}
                justifyContent="space-between"
                alignItems="flex-end"
                className={styles.metadata}
              >
                <Grid item style={{ alignSelf: 'flex-end' }}>
                  <TagsAndEntities entity={questionEntity} />
                  {(question.canEdit || question.canDelete) && (
                    <Box className={styles.buttons}>
                      {question.canDelete && (
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
