import { useState } from 'react';
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
import { VoteButtonContainer } from '../Utility/VoteButtonContainer';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  makeStyles,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export type AnswerCardClassKeys =
  | 'root'
  | 'highlight'
  | 'buttons'
  | 'metadata'
  | 'markdownContainer'
  | 'contentContainer';

const useStyles = makeStyles(
  theme => ({
    root: {
      marginTop: '1em',
    },
    contentContainer: {
      marginLeft: '0.5em',
      display: 'inline-block',
      width: 'calc(100% - 70px)',
    },
    markdownContainer: {
      minHeight: '6em',
      paddingBottom: '0.5em',
    },
    metadata: {
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
    buttons: {
      marginTop: '1em',
      '& *:not(:last-child)': {
        marginRight: '0.3em',
      },
    },
  }),
  { name: 'QetaAnswerCard' },
);

export const AnswerCard = (props: {
  answer: AnswerResponse;
  question: PostResponse;
}) => {
  const { answer, question } = props;

  const [editMode, setEditMode] = useState(false);
  const [answerEntity, setAnswerEntity] = useState(answer);
  const { t } = useTranslationRef(qetaTranslationRef);
  const styles = useStyles();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
        className={`qetaAnswerCard ${styles.root} ${
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
            <Grid item>
              <VoteButtonContainer>
                <VoteButtons entity={answerEntity} post={question} />
                <LinkButton entity={answerEntity} />
              </VoteButtonContainer>
            </Grid>
            <Grid item className={styles.contentContainer}>
              {editMode ? (
                <AnswerForm
                  post={question}
                  onPost={onAnswerEdit}
                  id={answerEntity.id}
                />
              ) : (
                <>
                  <Grid item className={styles.markdownContainer}>
                    <MarkdownRenderer content={answerEntity.content} />
                  </Grid>
                  <Box
                    display="flex"
                    alignItems="flex-end"
                    justifyContent="space-between"
                    className={styles.metadata}
                    style={{ width: '100%' }}
                  >
                    <Box flex="1 1 0%" minWidth={0}>
                      {(answerEntity.canDelete || answerEntity.canEdit) && (
                        <Box
                          className={styles.buttons}
                          style={{ alignSelf: 'flex-end' }}
                        >
                          {answerEntity.canEdit && (
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
                          {!answerEntity.correct && answerEntity.canDelete && (
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
                        </Box>
                      )}
                    </Box>
                    <Box
                      display="flex"
                      minWidth={220}
                      style={{ gap: '8px' }}
                      ml={1}
                    >
                      {answerEntity.updated && answerEntity.updatedBy && (
                        <AuthorBox
                          userEntityRef={answerEntity.updatedBy}
                          time={answerEntity.updated}
                          label={t('authorBox.updatedAtTime')}
                          expert={answerEntity.expert}
                          anonymous={answerEntity.anonymous}
                        />
                      )}
                      <AuthorBox
                        userEntityRef={answerEntity.author}
                        time={answerEntity.created}
                        label={t('authorBox.answeredAtTime')}
                        expert={answerEntity.expert}
                        anonymous={answerEntity.anonymous}
                      />
                    </Box>
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <CommentSection
        post={question}
        answer={answerEntity}
        onCommentAction={onCommentAction}
      />
    </>
  );
};
