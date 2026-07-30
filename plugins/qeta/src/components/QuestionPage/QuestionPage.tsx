import { useCallback, useEffect, useMemo, useState } from 'react';
import { WarningPanel } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import {
  AddToCollectionButton,
  AIAnswerCard,
  AnswerCard,
  AnswerForm,
  AskQuestionButton,
  ContentHeader,
  ContentHeaderButton,
  DeletedBanner,
  DraftBanner,
  ObsoleteBanner,
  PostHistoryButton,
  qetaTranslationRef,
  QuestionCard,
  RelativeTimeWithTooltip,
  useQetaConfig,
  UpdatedByLink,
  useQetaApi,
  FollowPostButton,
} from '@drodil/backstage-plugin-qeta-react';
import {
  Answer,
  AnswerResponse,
  PostResponse,
  QetaSignal,
} from '@drodil/backstage-plugin-qeta-common';
import { useSignal } from '@backstage/plugin-signals-react';
import { Box, Flex, Select, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RiChat3Line, RiQuestionLine } from '@remixicon/react';

export const QuestionPage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [newAnswers, setNewAnswers] = useState<AnswerResponse[]>([]);
  const [answerSort, setAnswerSort] = useState<string>('default');

  const [answersCount, setAnswersCount] = useState(0);
  const [views, setViews] = useState(0);

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${id}`);

  const {
    value: question,
    loading,
    error,
    retry,
  } = useQetaApi(api => api.getPost(id), [id]);

  useEffect(() => {
    if (question) {
      setAnswersCount(question.answersCount);
      setViews(question.views);
      setAnswers(question.answers ?? []);
    }
  }, [question]);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setAnswersCount(lastSignal.answersCount);
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  const sortAnswers = useCallback(
    (a: Answer, b: Answer) => {
      if (answerSort === 'default') {
        return 1;
      }

      const parts = answerSort.split('_');
      const field = parts[0];
      const order = parts[1];

      let ret = -1;
      switch (field) {
        case 'created':
          ret = a.created > b.created ? -1 : 1;
          break;
        case 'score':
          ret = a.score > b.score ? -1 : 1;
          break;
        case 'author':
          ret = a.author > b.author ? -1 : 1;
          break;
        case 'comments':
          ret = (a.comments?.length ?? 0) > (b.comments?.length ?? 0) ? -1 : 1;
          break;
        case 'updated':
          ret = (a.updated ?? a.created) > (b.updated ?? b.created) ? -1 : 1;
          break;
        default:
          return 1;
      }

      if (order === 'desc') {
        ret *= -1;
      }
      return ret;
    },
    [answerSort],
  );

  const sortedAnswers = useMemo(() => {
    const allAnswers = [...answers, ...newAnswers];
    return allAnswers.sort(sortAnswers);
  }, [answers, newAnswers, sortAnswers]);

  const onAnswerPost = (answer: AnswerResponse) => {
    setNewAnswers(newAnswers.concat([answer]));
    setAnswersCount(prev => prev + 1);
  };

  const onAnswerDelete = (answer: AnswerResponse) => {
    setNewAnswers(newAnswers.filter(a => a.id !== answer.id));
    setAnswers(answers.filter(a => a.id !== answer.id));
    setAnswersCount(prev => prev - 1);
  };

  const getDescription = (q: PostResponse) => {
    return (
      <>
        <Text as="span" weight="bold">
          {t('authorBox.postedAtTime')}{' '}
          <RelativeTimeWithTooltip value={q.created} />
          {' · '}
        </Text>
        {q.updated && (
          <Text as="span" weight="bold">
            {t('authorBox.updatedAtTime')}{' '}
            <RelativeTimeWithTooltip value={q.updated} />{' '}
            {t('authorBox.updatedBy')} <UpdatedByLink entity={q} />
            {' · '}
          </Text>
        )}
        <Text as="span" weight="bold">
          {t('common.viewsCount', { count: views })}
        </Text>
      </>
    );
  };

  if (disabled.questions) {
    return null;
  }

  if (loading) {
    return (
      <Box role="status" aria-label={t('common.loading')}>
        <Skeleton height={200} />
        <Flex direction="column" gap="2" mt="4">
          <Skeleton height={40} width="60%" />
          <Skeleton height={20} width="40%" />
          <Skeleton height={20} width="80%" />
        </Flex>
      </Box>
    );
  }

  if (error || question === undefined) {
    return (
      <WarningPanel
        severity="error"
        title={t('questionPage.errorLoading')}
        aria-live="assertive"
      >
        {error?.message}
      </WarningPanel>
    );
  }

  if (question.type !== 'question') {
    return (
      <WarningPanel title="Not found" message={t('questionPage.notFound')} />
    );
  }

  return (
    <>
      <ContentHeader
        title={question.title}
        description={getDescription(question)}
        titleIcon={<RiQuestionLine size={28} />}
      >
        <PostHistoryButton post={question} onRestore={retry} />
        <FollowPostButton post={question} />
        <AskQuestionButton />
        <ContentHeaderButton
          onClick={() => {
            const element = document.getElementById('qeta-answer-form');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              const input = element.querySelector('textarea');
              if (input) {
                input.focus();
              }
            }
          }}
          icon={<RiChat3Line />}
          disabled={question.status === 'obsolete'}
        >
          {t('questionPage.answerButton')}
        </ContentHeaderButton>
        <AddToCollectionButton post={question} />
      </ContentHeader>
      {question.status === 'draft' && <DraftBanner />}
      {question.status === 'deleted' && <DeletedBanner />}
      {question.status === 'obsolete' && <ObsoleteBanner />}
      <QuestionCard question={question} />
      <AIAnswerCard question={question} debounceMs={0} />
      {(question.status === 'active' || question.status === 'obsolete') && (
        <>
          <Flex justify="between" align="center" mt="6" mb="4">
            <Text variant="title-small">
              {t('common.answersCount', {
                count: answersCount,
              })}
            </Text>
            {sortedAnswers.length > 1 && (
              <Select
                size="small"
                label={t('questionPage.sortAnswers.label')}
                value={answerSort}
                onChange={key => setAnswerSort(String(key))}
                options={[
                  {
                    id: 'default',
                    label: t('questionPage.sortAnswers.default'),
                  },
                  {
                    id: 'created_desc',
                    label: t('questionPage.sortAnswers.createdDesc'),
                  },
                  {
                    id: 'created_asc',
                    label: t('questionPage.sortAnswers.createdAsc'),
                  },
                  {
                    id: 'score_desc',
                    label: t('questionPage.sortAnswers.scoreDesc'),
                  },
                  {
                    id: 'score_asc',
                    label: t('questionPage.sortAnswers.scoreAsc'),
                  },
                  {
                    id: 'comments_desc',
                    label: t('questionPage.sortAnswers.commentsDesc'),
                  },
                  {
                    id: 'comments_asc',
                    label: t('questionPage.sortAnswers.commentsAsc'),
                  },
                  {
                    id: 'author_desc',
                    label: t('questionPage.sortAnswers.authorDesc'),
                  },
                  {
                    id: 'author_asc',
                    label: t('questionPage.sortAnswers.authorAsc'),
                  },
                  {
                    id: 'updated_desc',
                    label: t('questionPage.sortAnswers.updatedDesc'),
                  },
                  {
                    id: 'updated_asc',
                    label: t('questionPage.sortAnswers.updatedAsc'),
                  },
                ]}
              />
            )}
          </Flex>
          {sortedAnswers.map(a => (
            <Box key={a.id} mb="2">
              <AnswerCard
                answer={a}
                question={question}
                onAnswerDelete={onAnswerDelete}
              />
            </Box>
          ))}

          {question.status === 'active' && (
            <div id="qeta-answer-form">
              <AnswerForm post={question} onPost={onAnswerPost} />
            </div>
          )}
        </>
      )}
    </>
  );
};
