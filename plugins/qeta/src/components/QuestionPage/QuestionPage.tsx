import React, { useEffect, useState } from 'react';
import {
  Box,
  Divider,
  FormControl,
  Grid,
  Select,
  Typography,
} from '@material-ui/core';
import { ContentHeader, WarningPanel } from '@backstage/core-components';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  AnswerCard,
  AnswerForm,
  AskQuestionButton,
  BackToQuestionsButton,
  QuestionCard,
  RelativeTimeWithTooltip,
  UpdatedByLink,
  useQetaApi,
  useStyles,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import {
  Answer,
  AnswerResponse,
  PostResponse,
  QetaSignal,
} from '@drodil/backstage-plugin-qeta-common';
import { Skeleton } from '@material-ui/lab';
import { useSignal } from '@backstage/plugin-signals-react';

export const QuestionPage = () => {
  const { id } = useParams();
  const styles = useStyles();
  const { t } = useTranslation();
  const [newAnswers, setNewAnswers] = React.useState<AnswerResponse[]>([]);
  const [answerSort, setAnswerSort] = React.useState<string>('default');
  const [searchParams] = useSearchParams();

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
    }
  }, [question]);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setAnswersCount(lastSignal.answersCount);
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  const onAnswerPost = (answer: AnswerResponse) => {
    setNewAnswers(newAnswers.concat([answer]));
  };

  const getDescription = (q: PostResponse) => {
    return (
      <span>
        {t('authorBox.postedAtTime')}{' '}
        <Box fontWeight="fontWeightMedium" display="inline" sx={{ mr: 2 }}>
          <RelativeTimeWithTooltip value={q.created} />
        </Box>
        {q.updated && (
          <React.Fragment>
            {t('authorBox.updatedAtTime')}{' '}
            <Box fontWeight="fontWeightMedium" display="inline" sx={{ mr: 2 }}>
              <RelativeTimeWithTooltip value={q.updated} />{' '}
              {t('authorBox.updatedBy')} <UpdatedByLink entity={q} />
            </Box>
          </React.Fragment>
        )}
        <Box fontWeight="fontWeightMedium" display="inline">
          {t('common.views', { count: views })}
        </Box>
      </span>
    );
  };

  if (loading) {
    return <Skeleton variant="rect" height={200} />;
  }

  if (error || question === undefined) {
    return (
      <WarningPanel severity="error" title={t('questionPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  const sortAnswers = (a: Answer, b: Answer) => {
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
  };

  const allAnswers = (question.answers ?? []).concat(newAnswers);
  return (
    <>
      <ContentHeader
        title={question.title}
        // @ts-ignore
        description={getDescription(question)}
      >
        <BackToQuestionsButton
          entityPage={searchParams.get('entityPage') === 'true'}
        />
        <AskQuestionButton />
      </ContentHeader>
      <QuestionCard question={question} />
      <Box sx={{ mt: 3, mb: 2 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h6">
              {t('common.answers', {
                count: answersCount + newAnswers.length,
              })}
            </Typography>
          </Grid>
          {allAnswers.length > 1 && (
            <Grid item>
              <FormControl>
                <Select
                  native
                  label={t('questionPage.sortAnswers.label')}
                  value={answerSort}
                  onChange={val => setAnswerSort(val.target.value as string)}
                  inputProps={{
                    name: 'sortAnswers',
                    id: 'sort-answers',
                  }}
                >
                  <option value="default">
                    {t('questionPage.sortAnswers.default')}
                  </option>
                  <option value="created_desc">
                    {t('questionPage.sortAnswers.createdDesc')}
                  </option>
                  <option value="created_asc">
                    {t('questionPage.sortAnswers.createdAsc')}
                  </option>
                  <option value="score_desc">
                    {t('questionPage.sortAnswers.scoreDesc')}
                  </option>
                  <option value="score_asc">
                    {t('questionPage.sortAnswers.scoreAsc')}
                  </option>
                  <option value="comments_desc">
                    {t('questionPage.sortAnswers.commentsDesc')}
                  </option>
                  <option value="comments_asc">
                    {t('questionPage.sortAnswers.commentsAsc')}
                  </option>
                  <option value="author_desc">
                    {t('questionPage.sortAnswers.authorDesc')}
                  </option>
                  <option value="author_asc">
                    {t('questionPage.sortAnswers.authorAsc')}
                  </option>
                  <option value="updated_desc">
                    {t('questionPage.sortAnswers.updatedDesc')}
                  </option>
                  <option value="updated_asc">
                    {t('questionPage.sortAnswers.updatedAsc')}
                  </option>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Box>
      {allAnswers.sort(sortAnswers).map(a => {
        return (
          <React.Fragment key={a.id}>
            <Divider className={styles.questionDivider} />
            <Box key={a.id} sx={{ mb: 1 }}>
              <AnswerCard answer={a} question={question} />
            </Box>
          </React.Fragment>
        );
      })}
      <Divider className={styles.questionDivider} />
      <AnswerForm post={question} onPost={onAnswerPost} />
    </>
  );
};
