import { useState } from 'react';
import DOMPurify from 'dompurify';
import {
  AnswerResponse,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { questionRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import {
  Box,
  Card,
  CardBody,
  Flex,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import numeral from 'numeral';
import { RiCheckboxCircleLine, RiThumbUpLine } from '@remixicon/react';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { ClickableLink } from '../Utility/ClickableLink';
import styles from './AnswersGridItem.module.css';

export interface AnswersGridItemProps {
  answer: AnswerResponse;
  entity?: string;
}

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

export const AnswersGridItem = (props: AnswersGridItemProps) => {
  const { answer, entity } = props;
  const [score] = useState(answer.score);
  const { t } = useTranslationRef(qetaTranslationRef);

  const questionRoute = useRouteRef(questionRouteRef);

  const href = entity
    ? `${questionRoute({
        id: answer.postId.toString(10),
      })}?entity=${entity}#answer_${answer.id}`
    : `${questionRoute({
        id: answer.postId.toString(10),
      })}#answer_${answer.id}`;

  return (
    <Card className={styles.card}>
      <ClickableLink href={href} ariaLabel={answer.post?.title ?? ''}>
        <CardBody className={styles.contentContainer}>
          <Text as="div" className={styles.title}>
            {t('answer.questionTitle', {
              question: answer.post?.title ?? '',
            })}
          </Text>

          <Text as="div" variant="body-small" className={styles.content}>
            <span
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  truncate(removeMarkdownFormatting(answer.content), 200),
                ),
              }}
            />
          </Text>

          <Box className={styles.footer}>
            <Flex align="center" justify="between">
              <Flex align="center" gap="4">
                <TooltipTrigger>
                  <Box className={styles.metaItem}>
                    <RiThumbUpLine size={18} />
                    <span>{formatShortNumber(score)}</span>
                  </Box>
                  <Tooltip>{t('common.votesCount', { count: score })}</Tooltip>
                </TooltipTrigger>
                {answer.correct && (
                  <TooltipTrigger>
                    <Box
                      className={`${styles.metaItem} ${styles.metaItemActive}`}
                    >
                      <RiCheckboxCircleLine size={18} />
                    </Box>
                    <Tooltip>{t('authorBox.correctAnswer')}</Tooltip>
                  </TooltipTrigger>
                )}
              </Flex>
              <AuthorBox
                userEntityRef={answer.author}
                time={answer.created}
                label={t('answer.answeredTime')}
                anonymous={answer.anonymous}
                compact
              />
            </Flex>
            {answer.post && (
              <Box className={styles.tagsRow}>
                <TagsAndEntities entity={answer.post} />
              </Box>
            )}
          </Box>
        </CardBody>
      </ClickableLink>
    </Card>
  );
};
