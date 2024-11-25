import {
  AIQuery,
  AIResponse,
  Article,
  Post,
} from '@drodil/backstage-plugin-qeta-common';
import React, { useCallback } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useAI, useTranslation } from '../../hooks';
import FlareIcon from '@mui/icons-material/Flare';
import useDebounce from 'react-use/lib/useDebounce';
import Skeleton from '@mui/material/Skeleton';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export type AIAnswerCardProps = {
  question?: Post;
  draft?: {
    title: string;
    content: string;
  };
  article?: Article;
  debounceMs?: number;
  style?: React.CSSProperties;
};

const EXPANDED_LOCAL_STORAGE_KEY = 'qeta-ai-expanded';

export const AIAnswerCard = (props: AIAnswerCardProps) => {
  const { question, draft, article, style, debounceMs = 3000 } = props;
  const [answer, setAnswer] = React.useState<AIResponse | null | undefined>(
    undefined,
  );
  const [expanded, setExpanded] = React.useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const { t } = useTranslation();
  const config = useApi(configApiRef);
  const botName = config.getOptionalString('qeta.aiBotName') ?? 'AI';

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
        return;
      }

      if (question) {
        answerExistingQuestion(question.id, options).then(res => {
          setAnswer(res);
        });
      } else if (article) {
        summarizeArticle(article.id, options).then(res => {
          setAnswer(res);
        });
      } else if (
        draft &&
        draft.title &&
        draft.content &&
        draft.title.length + draft.content.length > 30
      ) {
        answerDraftQuestion(draft).then(res => {
          setAnswer(res);
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
    <Card
      sx={theme => ({
        marginTop: '1rem',
        backgroundColor: theme.palette.background.default,
        border: `3px solid ${theme.palette.status.ok}`,
      })}
      style={style}
    >
      <CardHeader
        avatar={<FlareIcon />}
        style={!expanded ? { paddingBottom: '1rem' } : {}}
        title={
          <Typography variant="h5">
            {article
              ? t('aiAnswerCard.summary', { name: botName })
              : t('aiAnswerCard.answer', { name: botName })}
          </Typography>
        }
        action={
          <>
            {canEdit && isEnabled() && (
              <Tooltip title={t('aiAnswerCard.regenerate')}>
                <IconButton
                  onClick={() => {
                    setAnswer(undefined);
                    fetchAnswer({ regenerate: true });
                  }}
                  size="large"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip
              title={expanded ? t('aiAnswerCard.hide') : t('aiAnswerCard.show')}
            >
              <IconButton
                onClick={() => {
                  setExpanded(!expanded);
                  localStorage.setItem(
                    EXPANDED_LOCAL_STORAGE_KEY,
                    expanded ? 'false' : 'true',
                  );
                }}
                aria-expanded={expanded}
                size="large"
              >
                {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          </>
        }
        subheader={
          answer ? (
            <RelativeTimeWithTooltip value={answer.created ?? new Date()} />
          ) : (
            <>{t('aiAnswerCard.loading')}</>
          )
        }
      />
      <Collapse in={expanded} timeout={0} unmountOnExit mountOnEnter>
        <CardContent>
          {answer === undefined && (
            <Skeleton variant="rectangular" height={200} animation="wave" />
          )}
          {answer && <MarkdownRenderer content={answer.answer} />}
        </CardContent>
      </Collapse>
    </Card>
  );
};
