import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  PostResponse,
  PostType,
  QetaSignal,
  removeMarkdownFormatting,
  selectByPostType,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, linkRouteRef, questionRouteRef } from '../../routes';
import { useSignal } from '@backstage/plugin-signals-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, Flex, Tag, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import numeral from 'numeral';
import {
  RiAlertLine,
  RiCheckboxCircleLine,
  RiCursorLine,
  RiEyeLine,
  RiFileTextLine,
  RiLinkM,
  RiQuestionAnswerLine,
  RiStarFill,
  RiThumbUpLine,
} from '@remixicon/react';
import { StatusChip } from '../Utility/StatusChip';
import { OpenLinkButton, RankingButtons } from '../Buttons';
import { FaviconItem } from '../FaviconItem';
import { getPostDisplayDate } from '../../utils/utils';
import { Link as RouterLink } from 'react-router-dom';
import styles from './PostListItem.module.css';

export interface PostListItemProps {
  post: PostResponse;
  entity?: string;
  type?: PostType;
  showTypeLabel?: boolean;
  allowRanking?: boolean;
  onRankUpdate?: () => void;
  collectionId?: number;
}

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export const PostListItem = (props: PostListItemProps) => {
  const {
    post,
    entity,
    showTypeLabel,
    allowRanking,
    onRankUpdate,
    collectionId,
  } = props;
  const [correctAnswer, setCorrectAnswer] = useState(post.correctAnswer);
  const [answersCount, setAnswersCount] = useState(post.answersCount);
  const [views, setViews] = useState(post.views);
  const [score, setScore] = useState(post.score);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${post.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setCorrectAnswer(lastSignal.correctAnswer);
      setAnswersCount(lastSignal.answersCount);
      setViews(lastSignal.views);
      setScore(lastSignal.score);
    }
  }, [lastSignal]);

  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);

  const route = selectByPostType(
    post.type,
    questionRoute,
    articleRoute,
    linkRoute,
  );

  const href = entity
    ? `${route({ id: post.id.toString(10) })}?entity=${entity}`
    : route({ id: post.id.toString(10) });

  /* eslint-disable no-nested-ternary */
  const answerClassName = correctAnswer
    ? styles.metaItemActive
    : answersCount === 0
      ? styles.metaItemWarning
      : '';
  /* eslint-enable no-nested-ternary */

  return (
    <Box className={styles.root}>
      <RouterLink
        to={href}
        className={styles.overlayLink}
        aria-label={post.title}
      />
      <Box className={styles.metaCol} aria-label={t('common.postStats')}>
        <TooltipTrigger>
          <Box className={styles.metaItem}>
            {post.type === 'link' ? (
              <RiCursorLine size={16} className={styles.metaIcon} />
            ) : (
              <RiThumbUpLine size={16} className={styles.metaIcon} />
            )}
            <Text as="span" variant="body-small" className={styles.metaValue}>
              {formatShortNumber(score)}
            </Text>
          </Box>
          <Tooltip>
            {post.type === 'link'
              ? t('common.clicksCount', { count: score })
              : t('common.votesCount', { count: score })}
          </Tooltip>
        </TooltipTrigger>

        {post.type === 'question' && (
          <TooltipTrigger>
            <Box className={`${styles.metaItem} ${answerClassName}`}>
              {correctAnswer ? (
                <RiCheckboxCircleLine size={16} className={styles.metaIcon} />
              ) : (
                <RiQuestionAnswerLine size={16} className={styles.metaIcon} />
              )}
              <Text as="span" variant="body-small" className={styles.metaValue}>
                {formatShortNumber(answersCount)}
              </Text>
            </Box>
            <Tooltip>
              {t('common.answersCount', { count: answersCount })}
            </Tooltip>
          </TooltipTrigger>
        )}

        <TooltipTrigger>
          <Box className={styles.metaItem}>
            <RiEyeLine size={16} className={styles.metaIcon} />
            <Text as="span" variant="body-small" className={styles.metaValue}>
              {formatShortNumber(views)}
            </Text>
          </Box>
          <Tooltip>{t('common.viewsCount', { count: views })}</Tooltip>
        </TooltipTrigger>
      </Box>

      <Box className={`${styles.contentContainer} ${styles.contentWrapper}`}>
        <Box className={styles.titleContainer}>
          <Box className={styles.titleWrapper}>
            {post.type === 'link' && <FaviconItem entity={post} />}
            <Text as="div" className={styles.title}>
              {post.title}
            </Text>
          </Box>

          <Flex align="center" gap="2" className={styles.contentClickable}>
            {post.favorite && (
              <TooltipTrigger>
                <Box className={styles.starContainer}>
                  <RiStarFill size={20} />
                </Box>
                <Tooltip>{t('common.favorite')}</Tooltip>
              </TooltipTrigger>
            )}
            {post.status === 'obsolete' && (
              <TooltipTrigger>
                <Box className={styles.starContainer}>
                  <RiAlertLine size={20} />
                </Box>
                <Tooltip>{t('common.obsolete')}</Tooltip>
              </TooltipTrigger>
            )}
            <StatusChip status={post.status} />
            {showTypeLabel && post.type && (
              <Tag
                size="small"
                icon={selectByPostType(
                  post.type,
                  <RiQuestionAnswerLine size={16} />,
                  <RiFileTextLine size={16} />,
                  <RiLinkM size={16} />,
                )}
              >
                {capitalizeFirstLetter(t(`common.${post.type}`))}
              </Tag>
            )}
            {post.type === 'link' && (
              <OpenLinkButton entity={post} className={styles.openLinkButton} />
            )}
          </Flex>
        </Box>

        <Text as="div" variant="body-small" className={styles.content}>
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(post.content), 200),
              ),
            }}
          />
        </Text>

        <Box className={styles.tagsRow}>
          <Box className={`${styles.tags} ${styles.contentClickable}`}>
            <TagsAndEntities entity={post} />
          </Box>
          <Box
            className={`${styles.authorBoxContainer} ${styles.contentClickable}`}
          >
            {allowRanking && (
              <Box className={styles.rankingWrapper}>
                <RankingButtons
                  postId={post.id}
                  collectionId={collectionId}
                  onRankUpdate={onRankUpdate}
                />
              </Box>
            )}
            <AuthorBox
              userEntityRef={post.author}
              time={getPostDisplayDate(post)}
              label={t('authorBox.postedAtTime')}
              expert={Boolean(post.experts && post.experts.length > 0)}
              anonymous={post.anonymous}
              compact
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
