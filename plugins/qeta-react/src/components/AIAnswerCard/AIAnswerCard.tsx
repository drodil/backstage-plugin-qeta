import {
  AIQuery,
  AIResponse,
  Article,
  Post,
} from '@drodil/backstage-plugin-qeta-common';
import { CSSProperties, useCallback, useState } from 'react';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useAI } from '../../hooks';
import { useUserSettings } from '../../hooks/useUserSettings';
import useDebounce from 'react-use/lib/useDebounce';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Box,
  ButtonIcon,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Skeleton,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiRefreshLine,
  RiSparklingLine,
} from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import styles from './AIAnswerCard.module.css';

export type AIAnswerCardProps = {
  question?: Post;
  draft?: {
    title: string;
    content: string;
  };
  article?: Article;
  debounceMs?: number;
  style?: CSSProperties;
};

export const AIAnswerCard = (props: AIAnswerCardProps) => {
  const { question, draft, article, style, debounceMs = 3000 } = props;
  const [answer, setAnswer] = useState<AIResponse | null | undefined>(null);
  const { t } = useTranslationRef(qetaTranslationRef);
  const config = useApi(configApiRef);
  const botName = config.getOptionalString('qeta.aiBotName') ?? 'AI';
  const { settings, setSetting } = useUserSettings();
  const [expanded, setExpanded] = useState(settings.aiAnswerExpanded);

  const {
    isAIEnabled,
    isNewQuestionsEnabled,
    isExistingQuestionsEnabled,
    isArticleSummaryEnabled,
    answerExistingQuestion,
    answerDraftQuestion,
    summarizeArticle,
  } = useAI();

  const fetchAnswer = useCallback(
    (options?: AIQuery) => {
      if (!isAIEnabled) {
        setAnswer(null);
        return;
      }

      if (question) {
        answerExistingQuestion(question.id, options)
          .catch(_ => setAnswer(null))
          .then(res => {
            setAnswer(res ?? null);
          });
      } else if (article) {
        summarizeArticle(article.id, options)
          .catch(_ => setAnswer(null))
          .then(res => {
            setAnswer(res ?? null);
          });
      } else if (
        draft &&
        draft.title &&
        draft.content &&
        draft.title.length + draft.content.length > 30
      ) {
        answerDraftQuestion(draft)
          .catch(_ => setAnswer(null))
          .then(res => {
            setAnswer(res ?? null);
          });
      } else {
        setAnswer(null);
      }
    },
    [
      isAIEnabled,
      question,
      article,
      draft,
      answerExistingQuestion,
      summarizeArticle,
      answerDraftQuestion,
    ],
  );

  useDebounce(
    () => {
      fetchAnswer();
    },
    debounceMs,
    [answerExistingQuestion, answerDraftQuestion, isAIEnabled, question, draft],
  );

  const isEnabled = (): boolean => {
    if (!isAIEnabled) {
      return false;
    }
    if (question) {
      return Boolean(isExistingQuestionsEnabled);
    }
    if (article) {
      return Boolean(isArticleSummaryEnabled);
    }
    if (draft) {
      return Boolean(isNewQuestionsEnabled);
    }
    return false;
  };
  const canEdit = question?.canEdit || article?.canEdit || false;

  if (!isEnabled() || answer === null) {
    return null;
  }

  return (
    <Card style={style} className={styles.root}>
      <CardHeader className={!expanded ? styles.headerCollapsed : undefined}>
        <Flex align="center" justify="between" gap="2">
          <Flex align="center" gap="2">
            <RiSparklingLine size={20} />
            <Box>
              <Text as="div" variant="title-small">
                {article
                  ? t('aiAnswerCard.summary', { name: botName })
                  : t('aiAnswerCard.answer', { name: botName })}
              </Text>
              <Text as="div" variant="body-small" color="secondary">
                {answer ? (
                  <RelativeTimeWithTooltip
                    value={answer.created ?? new Date()}
                  />
                ) : (
                  t('aiAnswerCard.loading')
                )}
              </Text>
            </Box>
          </Flex>
          <Flex align="center" gap="1">
            {canEdit && isEnabled() && (
              <TooltipTrigger>
                <ButtonIcon
                  aria-label={t('aiAnswerCard.regenerate')}
                  variant="tertiary"
                  size="small"
                  onPress={() => {
                    setAnswer(undefined);
                    fetchAnswer({ regenerate: true });
                  }}
                  icon={<RiRefreshLine size={16} />}
                />
                <Tooltip>{t('aiAnswerCard.regenerate')}</Tooltip>
              </TooltipTrigger>
            )}
            <TooltipTrigger>
              <ButtonIcon
                aria-label={
                  expanded ? t('aiAnswerCard.hide') : t('aiAnswerCard.show')
                }
                variant="tertiary"
                size="small"
                onPress={() => {
                  setExpanded(!expanded);
                  setSetting('aiAnswerExpanded', !expanded);
                }}
                icon={
                  expanded ? (
                    <RiArrowUpSLine size={16} />
                  ) : (
                    <RiArrowDownSLine size={16} />
                  )
                }
              />
              <Tooltip>
                {expanded ? t('aiAnswerCard.hide') : t('aiAnswerCard.show')}
              </Tooltip>
            </TooltipTrigger>
          </Flex>
        </Flex>
      </CardHeader>
      {expanded && (
        <CardBody>
          {answer === undefined && <Skeleton width="100%" height={200} />}
          {answer && <MarkdownRenderer content={answer.answer} />}
        </CardBody>
      )}
    </Card>
  );
};
