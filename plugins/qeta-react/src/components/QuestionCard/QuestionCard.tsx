import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useEffect, useState } from 'react';
import { VoteButtons } from '../Buttons/VoteButtons';
import { RiRestartLine } from '@remixicon/react';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { useApi } from '@backstage/core-plugin-api';
import { LinkButton } from '../Buttons/LinkButton';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { VoteButtonContainer } from '../Utility/VoteButtonContainer';
import { Box, Button, Card, CardBody, Flex } from '@backstage/ui';
import { useIsModerator } from '../../hooks';
import { qetaApiRef } from '../../api.ts';
import styles from './QuestionCard.module.css';

export const QuestionCard = (props: { question: PostResponse }) => {
  const { question } = props;
  const [questionEntity, setQuestionEntity] = useState(question);
  const qetaApi = useApi(qetaApiRef);
  const { isModerator } = useIsModerator();
  const { t } = useTranslationRef(qetaTranslationRef);
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

  const restoreQuestion = async () => {
    qetaApi.restorePost(question.id).then(q => {
      setQuestionEntity(q);
    });
  };

  return (
    <>
      <Card data-testid="question-card">
        <CardBody>
          <Flex align="start" gap="4" style={{ flexWrap: 'nowrap' }}>
            <VoteButtonContainer>
              <VoteButtons entity={questionEntity} />
              <FavoriteButton entity={questionEntity} />
              <LinkButton entity={questionEntity} />
            </VoteButtonContainer>
            <Box className={styles.contentContainer}>
              <Box className={styles.markdownContainer}>
                <MarkdownRenderer content={questionEntity.content} />
              </Box>
              <Flex align="start" justify="between" className={styles.metadata}>
                <Box style={{ flex: '1 1 0%', minWidth: 0 }}>
                  <TagsAndEntities entity={questionEntity} />
                  <Box className={styles.buttons}>
                    {isModerator && questionEntity.status === 'deleted' && (
                      <Button
                        variant="primary"
                        size="small"
                        iconStart={<RiRestartLine size={16} />}
                        onClick={() => restoreQuestion()}
                        className="qetaQuestionCardRestoreBtn"
                      >
                        {t('questionPage.restoreButton')}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </CardBody>
      </Card>
      <CommentSection post={questionEntity} onCommentAction={onCommentAction} />
    </>
  );
};
