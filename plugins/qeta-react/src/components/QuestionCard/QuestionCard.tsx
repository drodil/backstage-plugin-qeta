import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useEffect, useState } from 'react';
import { VoteButtons } from '../Buttons/VoteButtons';
import { DeleteModal } from '../Modals';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import RestoreIcon from '@material-ui/icons/Restore';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { LinkButton } from '../Buttons/LinkButton';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { editQuestionRouteRef } from '../../routes';
import { useNavigate } from 'react-router-dom';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { VoteButtonContainer } from '../Utility/VoteButtonContainer';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  makeStyles,
} from '@material-ui/core';
import { useIsModerator } from '../../hooks';
import { qetaApiRef } from '../../api.ts';
import { AuthorBoxes } from '../AuthorBox/AuthorBoxes.tsx';

export type QuestionCardClassKeys =
  | 'root'
  | 'contentContainer'
  | 'markdownContainer'
  | 'buttons'
  | 'metadata';

const useStyles = makeStyles(
  theme => ({
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
      marginTop: theme.spacing(3),
    },
  }),
  { name: 'QetaQuestionCard' },
);

export const QuestionCard = (props: { question: PostResponse }) => {
  const { question } = props;
  const navigate = useNavigate();
  const editQuestionRoute = useRouteRef(editQuestionRouteRef);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionEntity, setQuestionEntity] = useState(question);
  const qetaApi = useApi(qetaApiRef);
  const { isModerator } = useIsModerator();
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const { t } = useTranslationRef(qetaTranslationRef);
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

  const restoreQuestion = async () => {
    qetaApi.restorePost(question.id).then(q => {
      setQuestionEntity(q);
    });
  };

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
              <Box
                display="flex"
                alignItems="flex-start"
                justifyContent="space-between"
                className={styles.metadata}
                style={{ width: '100%' }}
              >
                <Box flex="1 1 0%" minWidth={0}>
                  <TagsAndEntities entity={questionEntity} />
                  <Box className={styles.buttons}>
                    {question.canEdit && question.status !== 'obsolete' && (
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
                    {isModerator && questionEntity.status === 'deleted' && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<RestoreIcon />}
                        onClick={() => restoreQuestion()}
                        className="qetaQuestionCardRestoreBtn"
                      >
                        {t('questionPage.restoreButton')}
                      </Button>
                    )}
                  </Box>
                </Box>
                <AuthorBoxes entity={questionEntity} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <CommentSection post={questionEntity} onCommentAction={onCommentAction} />
    </>
  );
};
