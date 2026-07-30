import { useState } from 'react';
import DOMPurify from 'dompurify';
import {
  AnswerResponse,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { questionRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import numeral from 'numeral';
import { RiCheckboxCircleLine, RiThumbUpLine } from '@remixicon/react';
import { useNavigate } from 'react-router-dom';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import styles from './AnswerListItem.module.css';

export interface AnswerListItemProps {
  answer: AnswerResponse;
  entity?: string;
}

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

export const AnswerListItem = (props: AnswerListItemProps) => {
  const { answer, entity } = props;
  const [score] = useState(answer.score);
  const { t } = useTranslationRef(qetaTranslationRef);
  const navigate = useNavigate();

  const questionRoute = useRouteRef(questionRouteRef);

  const href = entity
    ? `${questionRoute({
        id: answer.postId.toString(10),
      })}?entity=${entity}#answer_${answer.id}`
    : `${questionRoute({
        id: answer.postId.toString(10),
      })}#answer_${answer.id}`;

  const handleClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('a') ||
      (e.target as HTMLElement).closest('button')
    ) {
      return;
    }
    navigate(href);
  };

  return (
    <Box className={styles.root} onClick={handleClick}>
      <Box className={styles.metaCol} aria-label={t('common.postStats')}>
        <TooltipTrigger>
          <Box className={styles.metaItem}>
            <RiThumbUpLine size={16} className={styles.metaIcon} />
            <Text as="span" variant="body-small" className={styles.metaValue}>
              {formatShortNumber(score)}
            </Text>
          </Box>
          <Tooltip>{t('common.votesCount', { count: score })}</Tooltip>
        </TooltipTrigger>
        {answer.correct && (
          <TooltipTrigger>
            <Box className={`${styles.metaItem} ${styles.metaItemActive}`}>
              <RiCheckboxCircleLine size={16} className={styles.metaIcon} />
            </Box>
            <Tooltip>{t('authorBox.correctAnswer')}</Tooltip>
          </TooltipTrigger>
        )}
      </Box>

      <Box className={styles.contentContainer}>
        <Box className={styles.titleContainer}>
          <Box className={styles.titleWrapper}>
            <Text as="div" className={styles.title}>
              {t('answer.questionTitle', {
                question: answer.post?.title ?? '',
              })}
            </Text>
          </Box>
        </Box>

        <Text as="div" variant="body-small" className={styles.content}>
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(answer.content), 200),
              ),
            }}
          />
        </Text>

        <Box className={styles.tagsRow}>
          <Box className={styles.tags}>
            {answer.post && <TagsAndEntities entity={answer.post} />}
          </Box>
          <Box className={styles.authorBoxContainer}>
            <AuthorBox
              userEntityRef={answer.author}
              time={answer.created}
              label={t('answer.answeredTime')}
              anonymous={answer.anonymous}
              compact
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
