import {
  AIQuery,
  AIResponse,
  Article,
  Post,
} from '@drodil/backstage-plugin-qeta-common';
import { CSSProperties, useCallback, useState } from 'react';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useAI } from '../../hooks';
import FlareIcon from '@material-ui/icons/Flare';
import useDebounce from 'react-use/lib/useDebounce';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import RefreshIcon from '@material-ui/icons/Refresh';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: '1em',
    backgroundColor: theme.palette.background.default,
    border: `3px solid ${theme.palette.status.ok}`,
  },
}));

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

const EXPANDED_LOCAL_STORAGE_KEY = 'qeta-ai-expanded';

export const AIAnswerCard = (props: AIAnswerCardProps) => {
  const { question, draft, article, style, debounceMs = 3000 } = props;
  const [answer, setAnswer] = useState<AIResponse | null | undefined>(null);
  const [expanded, setExpanded] = useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const { t } = useTranslationRef(qetaTranslationRef);
  const config = useApi(configApiRef);
  const botName = config.getOptionalString('qeta.aiBotName') ?? 'AI';
  const styles = useStyles();

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
      <CardHeader
        avatar={<FlareIcon />}
        style={!expanded ? { paddingBottom: '1em' } : {}}
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
            <Skeleton variant="rect" height={200} animation="wave" />
          )}
          {answer && <MarkdownRenderer content={answer.answer} />}
        </CardContent>
      </Collapse>
    </Card>
  );
};
