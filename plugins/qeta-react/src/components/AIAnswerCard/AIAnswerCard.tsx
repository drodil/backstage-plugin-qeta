import {
  AIQuery,
  AIResponse,
  Article,
  Post,
} from '@drodil/backstage-plugin-qeta-common';
import React, { useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  createStyles,
  IconButton,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useAI, useTranslation } from '../../hooks';
import FlareIcon from '@material-ui/icons/Flare';
import useDebounce from 'react-use/lib/useDebounce';
import { Skeleton } from '@material-ui/lab';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import RefreshIcon from '@material-ui/icons/Refresh';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

export type QetaAIAnswerCardClassKey = 'card';

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      card: {
        marginTop: theme.spacing(3),
        backgroundColor: theme.palette.background.default,
        border: `3px solid ${theme.palette.status.ok}`,
      },
      markdown: {},
    }),
  { name: 'QetaAIAnswerCard' },
);

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
  const styles = useStyles();
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
        setAnswer(undefined);
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
    <Card className={styles.card} style={style}>
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
          {answer && (
            <MarkdownRenderer
              content={answer.answer}
              className={styles.markdown}
            />
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};
