import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContentHeader, WarningPanel } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import {
  AddToCollectionButton,
  AIAnswerCard,
  AnswerCard,
  AnswerForm,
  AskQuestionButton,
  ButtonContainer,
  DeletedBanner,
  DraftBanner,
  qetaTranslationRef,
  QuestionCard,
  RelativeTimeWithTooltip,
  UpdatedByLink,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import {
  Answer,
  AnswerResponse,
  PostResponse,
  QetaSignal,
} from '@drodil/backstage-plugin-qeta-common';
import { useSignal } from '@backstage/plugin-signals-react';
import {
  Box,
  Divider,
  FormControl,
  Grid,
  makeStyles,
  MenuItem,
  TextField,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

const useDescriptionStyles = makeStyles(
  () => ({
    root: {},
    box: {
      display: 'inline',
    },
  }),
  { name: 'QetaDescription' },
);

export const QuestionPage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [newAnswers, setNewAnswers] = React.useState<AnswerResponse[]>([]);
  const [answerSort, setAnswerSort] = React.useState<string>('default');
  const dStyles = useDescriptionStyles();

  const [answersCount, setAnswersCount] = useState(0);
  const [views, setViews] = useState(0);

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${id}`);

  const {
    value: question,
    loading,
    error,
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
      <span className={dStyles.root}>
        <Box fontWeight="fontWeightMedium" className={dStyles.box}>
          {t('authorBox.postedAtTime')}{' '}
          <RelativeTimeWithTooltip value={q.created} />
          {' · '}
        </Box>
        {q.updated && (
          <React.Fragment>
            <Box fontWeight="fontWeightMedium" className={dStyles.box}>
              {t('authorBox.updatedAtTime')}{' '}
              <RelativeTimeWithTooltip value={q.updated} />{' '}
              {t('authorBox.updatedBy')} <UpdatedByLink entity={q} />
              {' · '}
            </Box>
          </React.Fragment>
        )}
        <Box fontWeight="fontWeightMedium" className={dStyles.box}>
          {t('common.viewsCount', { count: views })}
        </Box>
      </span>
    );
  };

  if (loading) {
    return (
      <Box role="status" aria-label={t('common.loading')}>
        <Skeleton variant="rect" height={200} animation="wave" />
        <Box mt={2}>
          <Skeleton variant="text" height={40} width="60%" animation="wave" />
          <Skeleton variant="text" height={20} width="40%" animation="wave" />
          <Skeleton variant="text" height={20} width="80%" animation="wave" />
        </Box>
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
        // @ts-ignore
        description={getDescription(question)}
      >
        <ButtonContainer>
          <AskQuestionButton />
          <AddToCollectionButton post={question} />
        </ButtonContainer>
      </ContentHeader>
      {question.status === 'draft' && <DraftBanner />}
      {question.status === 'deleted' && <DeletedBanner />}
      <QuestionCard question={question} />
      <AIAnswerCard question={question} debounceMs={0} />
      {question.status === 'active' && (
        <>
          <Box sx={{ mt: 3, mb: 2 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h6">
                  {t('common.answersCount', {
                    count: answersCount,
                  })}
                </Typography>
              </Grid>
              {sortedAnswers.length > 1 && (
                <Grid item>
                  <FormControl>
                    <TextField
                      select
                      size="small"
                      label={t('questionPage.sortAnswers.label')}
                      value={answerSort}
                      onChange={val =>
                        setAnswerSort(val.target.value as string)
                      }
                      inputProps={{
                        name: 'sortAnswers',
                        id: 'sort-answers',
                        'aria-label': t('questionPage.sortAnswers.label'),
                        'aria-describedby': 'sort-answers-helper',
                      }}
                      variant="outlined"
                      SelectProps={{
                        MenuProps: {
                          'aria-label': t('questionPage.sortAnswers.menuLabel'),
                        },
                      }}
                    >
                      <MenuItem value="default">
                        {t('questionPage.sortAnswers.default')}
                      </MenuItem>
                      <MenuItem value="created_desc">
                        {t('questionPage.sortAnswers.createdDesc')}
                      </MenuItem>
                      <MenuItem value="created_asc">
                        {t('questionPage.sortAnswers.createdAsc')}
                      </MenuItem>
                      <MenuItem value="score_desc">
                        {t('questionPage.sortAnswers.scoreDesc')}
                      </MenuItem>
                      <MenuItem value="score_asc">
                        {t('questionPage.sortAnswers.scoreAsc')}
                      </MenuItem>
                      <MenuItem value="comments_desc">
                        {t('questionPage.sortAnswers.commentsDesc')}
                      </MenuItem>
                      <MenuItem value="comments_asc">
                        {t('questionPage.sortAnswers.commentsAsc')}
                      </MenuItem>
                      <MenuItem value="author_desc">
                        {t('questionPage.sortAnswers.authorDesc')}
                      </MenuItem>
                      <MenuItem value="author_asc">
                        {t('questionPage.sortAnswers.authorAsc')}
                      </MenuItem>
                      <MenuItem value="updated_desc">
                        {t('questionPage.sortAnswers.updatedDesc')}
                      </MenuItem>
                      <MenuItem value="updated_asc">
                        {t('questionPage.sortAnswers.updatedAsc')}
                      </MenuItem>
                    </TextField>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>
          <Divider />
          {sortedAnswers.map(a => {
            return (
              <React.Fragment key={a.id}>
                <Box key={a.id} sx={{ mb: 1 }}>
                  <AnswerCard
                    answer={a}
                    question={question}
                    onAnswerDelete={onAnswerDelete}
                  />
                </Box>
              </React.Fragment>
            );
          })}
          <Divider />
          <AnswerForm post={question} onPost={onAnswerPost} />
        </>
      )}
    </>
  );
};
