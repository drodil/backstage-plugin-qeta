import {
  PostResponse,
  PostType,
  QetaSignal,
  removeMarkdownFormatting,
  selectByPostType,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, linkRouteRef, questionRouteRef } from '../../routes';
import { Box, Card, Flex, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  RiAlertLine,
  RiFileTextLine,
  RiLinkM,
  RiStarFill,
} from '@remixicon/react';
import { StatusChip } from '../Utility/StatusChip';
import numeral from 'numeral';
import { OpenLinkButton } from '../Buttons/OpenLinkButton.tsx';
import { getPostDisplayDate } from '../../utils/utils';
import { RankingButtons } from '../Buttons';
import { useFavicon } from '../../hooks';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';
import styles from './PostsGridItem.module.css';

export interface PostsGridItemProps {
  post: PostResponse;
  entity?: string;
  type?: PostType;
  allowRanking?: boolean;
  onRankUpdate?: () => void;
  collectionId?: number;
}

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

export const PostsGridItem = (props: PostsGridItemProps) => {
  const { post, entity, allowRanking, onRankUpdate, collectionId } = props;
  const [views, setViews] = useState(post.views);
  const [score, setScore] = useState(post.score);
  const [correctAnswer, setCorrectAnswer] = useState(post.correctAnswer);
  const [answersCount, setAnswersCount] = useState(post.answersCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const { t } = useTranslationRef(qetaTranslationRef);
  const gridStyles = useGridItemStyles();

  const favicon = useFavicon(
    post.type === 'link' && !post.headerImage ? post.url : undefined,
  );

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${post.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setViews(lastSignal.views);
      setScore(lastSignal.score);
      setCorrectAnswer(lastSignal.correctAnswer);
      setAnswersCount(lastSignal.answersCount);
      setCommentsCount(lastSignal.commentsCount);
    }
  }, [lastSignal]);

  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);
  const navigate = useNavigate();

  const route = selectByPostType(
    post.type,
    questionRoute,
    articleRoute,
    linkRoute,
  );

  const href = entity
    ? `${route({
        id: post.id.toString(10),
      })}?entity=${entity}`
    : route({ id: post.id.toString(10) });

  const renderHeaderMedia = () => {
    if (post.headerImage) {
      return (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          onError={e => (e.currentTarget.style.display = 'none')}
          height={140}
          src={post.headerImage}
          alt={post.title}
          style={{ objectFit: 'cover', width: '100%' }}
        />
      );
    }
    if (post.type === 'link') {
      return (
        <Box className={styles.placeholderImage}>
          {favicon ? (
            <img
              src={favicon}
              alt={post.title}
              style={{
                height: 64,
                width: 64,
                objectFit: 'contain',
              }}
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <RiLinkM size={60} />
          )}
        </Box>
      );
    }
    if (post.type === 'article') {
      return (
        <Box className={styles.placeholderImage}>
          <RiFileTextLine size={60} />
        </Box>
      );
    }
    return null;
  };

  return (
    <Card className={gridStyles.card}>
      <Box className={styles.iconsContainer}>
        {post.status === 'obsolete' && (
          <TooltipTrigger>
            <RiAlertLine size={20} className={styles.obsoleteIcon} />
            <Tooltip>{t('common.obsolete', {})}</Tooltip>
          </TooltipTrigger>
        )}
        {post.favorite && (
          <TooltipTrigger>
            <RiStarFill size={20} className={styles.starIcon} />
            <Tooltip>{t('common.favorite')}</Tooltip>
          </TooltipTrigger>
        )}
      </Box>
      <Box
        as="a"
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          navigate(href);
        }}
        aria-label={post.title}
        tabIndex={0}
        style={{
          outline: 'none',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          textDecoration: 'none',
          color: 'inherit',
        }}
        {...({ href } as Record<string, unknown>)}
      >
        {renderHeaderMedia()}
        <Box className={styles.cardContent}>
          <Flex align="center" justify="between" className={styles.titleRow}>
            <Flex align="center" className={styles.titleGroup}>
              <Text
                as="div"
                variant="title-small"
                weight="bold"
                className={styles.title}
              >
                {post.title}
              </Text>
              <StatusChip status={post.status} />
              {post.type === 'link' && <OpenLinkButton entity={post} />}
            </Flex>
          </Flex>
          <Text
            as="div"
            variant="body-small"
            color="secondary"
            className={styles.content}
          >
            {DOMPurify.sanitize(
              truncate(removeMarkdownFormatting(post.content), 400),
            )}
          </Text>
        </Box>
      </Box>
      <Box className={styles.cardContentFooter}>
        <TagsAndEntities entity={post} />
        <Box className={styles.footer}>
          <Box className={styles.statsContainer}>
            <Box className={styles.statsGroup}>
              <TooltipTrigger>
                <Box className={styles.statBox}>
                  <Text
                    as="div"
                    variant="body-small"
                    weight="bold"
                    className={styles.statValue}
                  >
                    {formatShortNumber(score)}
                  </Text>
                  <Text
                    as="div"
                    variant="body-x-small"
                    color="secondary"
                    className={styles.statLabel}
                  >
                    {post.type !== 'link'
                      ? t('common.votes')
                      : t('common.clicks')}
                  </Text>
                </Box>
                <Tooltip>{score >= 1000 ? score : ''}</Tooltip>
              </TooltipTrigger>
              {post.type === 'question' && (
                <TooltipTrigger>
                  <Box
                    className={`${styles.statBox} ${
                      correctAnswer
                        ? styles.answersBoxAnswered
                        : styles.answersBox
                    }`}
                  >
                    <Text
                      as="div"
                      variant="body-small"
                      weight="bold"
                      className={styles.statValue}
                    >
                      {formatShortNumber(answersCount)}
                    </Text>
                    <Text
                      as="div"
                      variant="body-x-small"
                      color="secondary"
                      className={styles.statLabel}
                    >
                      {t('common.answers')}
                    </Text>
                  </Box>
                  <Tooltip>{answersCount >= 1000 ? answersCount : ''}</Tooltip>
                </TooltipTrigger>
              )}
              <TooltipTrigger>
                <Box className={styles.statBox}>
                  <Text
                    as="div"
                    variant="body-small"
                    weight="bold"
                    className={styles.statValue}
                  >
                    {formatShortNumber(views)}
                  </Text>
                  <Text
                    as="div"
                    variant="body-x-small"
                    color="secondary"
                    className={styles.statLabel}
                  >
                    {t('common.views')}
                  </Text>
                </Box>
                <Tooltip>{views >= 1000 ? views : ''}</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger>
                <Box className={styles.statBox}>
                  <Text
                    as="div"
                    variant="body-small"
                    weight="bold"
                    className={styles.statValue}
                  >
                    {formatShortNumber(commentsCount)}
                  </Text>
                  <Text
                    as="div"
                    variant="body-x-small"
                    color="secondary"
                    className={styles.statLabel}
                  >
                    {t('common.comments').toLowerCase()}
                  </Text>
                </Box>
                <Tooltip>{commentsCount >= 1000 ? commentsCount : ''}</Tooltip>
              </TooltipTrigger>
            </Box>
          </Box>
          <Box className={styles.authorRanking}>
            <AuthorBox
              userEntityRef={post.author}
              time={getPostDisplayDate(post)}
              label=""
              anonymous={post.anonymous}
              compact
            />
            {allowRanking && (
              <RankingButtons
                postId={post.id}
                collectionId={collectionId}
                onRankUpdate={onRankUpdate}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};
