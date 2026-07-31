import { useState } from 'react';
import { VoteButtons } from '../Buttons/VoteButtons';
import { AnswerForm } from '../AnswerForm';
import { CommentSection } from '../CommentSection/CommentSection';
import { LinkButton } from '../Buttons/LinkButton';
import { RiDeleteBinLine, RiEditLine } from '@remixicon/react';
import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { DeleteModal } from '../Modals';
import { VoteButtonContainer } from '../Utility/VoteButtonContainer';
import { Box, Button, Card, CardBody, Flex } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { AuthorBoxes } from '../AuthorBox/AuthorBoxes.tsx';
import styles from './AnswerCard.module.css';

export const AnswerCard = (props: {
  answer: AnswerResponse;
  question: PostResponse;
  onAnswerDelete?: (answer: AnswerResponse) => void;
}) => {
  const { answer, question } = props;

  const [editMode, setEditMode] = useState(false);
  const [answerEntity, setAnswerEntity] = useState(answer);
  const { t } = useTranslationRef(qetaTranslationRef);

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
        <CardBody>
          <Flex align="start" gap="4" style={{ flexWrap: 'nowrap' }}>
            <VoteButtonContainer>
              <VoteButtons entity={answerEntity} post={question} />
              <LinkButton entity={answerEntity} />
            </VoteButtonContainer>
            <Flex
              className={styles.contentContainer}
              gap="2"
              direction="column"
            >
              {editMode ? (
                <AnswerForm
                  post={question}
                  onPost={onAnswerEdit}
                  id={answerEntity.id}
                />
              ) : (
                <>
                  <Box className={styles.markdownContainer}>
                    <MarkdownRenderer content={answerEntity.content} />
                  </Box>
                  <Flex
                    align="end"
                    justify="between"
                    className={styles.metadata}
                  >
                    <Box style={{ flex: '1 1 0%', minWidth: 0 }}>
                      {(answerEntity.canDelete || answerEntity.canEdit) &&
                        question.status !== 'obsolete' && (
                          <Box className={styles.buttons}>
                            {answerEntity.canEdit && (
                              <Button
                                variant="secondary"
                                size="small"
                                iconStart={<RiEditLine size={16} />}
                                onClick={() => setEditMode(true)}
                                className="qetaAnswerCardEditBtn"
                              >
                                {t('questionPage.editButton')}
                              </Button>
                            )}
                            {!answerEntity.correct &&
                              answerEntity.canDelete && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="small"
                                    destructive
                                    iconStart={<RiDeleteBinLine size={16} />}
                                    onClick={handleDeleteModalOpen}
                                  >
                                    {t('deleteModal.deleteButton')}
                                  </Button>
                                  <DeleteModal
                                    open={deleteModalOpen}
                                    onClose={handleDeleteModalClose}
                                    entity={answerEntity}
                                    question={question}
                                    onDelete={() =>
                                      props.onAnswerDelete?.(answerEntity)
                                    }
                                  />
                                </>
                              )}
                          </Box>
                        )}
                    </Box>
                    <AuthorBoxes entity={answerEntity} />
                  </Flex>
                </>
              )}
            </Flex>
          </Flex>
        </CardBody>
      </Card>
      <CommentSection
        post={question}
        answer={answerEntity}
        onCommentAction={onCommentAction}
      />
    </>
  );
};
