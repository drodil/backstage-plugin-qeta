import React, { useEffect, useState } from 'react';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import { useTranslation } from './useTranslation';
import { useSignal } from '@backstage/plugin-signals-react';
import {
  AnswerResponse,
  PostResponse,
  QetaSignal,
} from '@drodil/backstage-plugin-qeta-common';

export function useVoting(resp: PostResponse | AnswerResponse) {
  const [entity, setEntity] = React.useState<PostResponse | AnswerResponse>(
    resp,
  );
  const [ownVote, setOwnVote] = React.useState(entity.ownVote ?? 0);
  const [correctAnswer, setCorrectAnswer] = useState(
    'postId' in entity ? entity.correct : false,
  );
  const [score, setScore] = useState(entity.score);
  const analytics = useAnalytics();
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslation();

  const isQuestion = 'title' in entity;
  const own = entity.own ?? false;

  const { lastSignal } = useSignal<QetaSignal>(
    isQuestion ? `qeta:question_${entity.id}` : `qeta:answer_${entity.id}`,
  );

  useEffect(() => {
    if (entity) {
      setScore(entity.score);
    }
  }, [entity]);

  useEffect(() => {
    if (
      lastSignal?.type === 'post_stats' ||
      lastSignal?.type === 'answer_stats'
    ) {
      setCorrectAnswer(lastSignal.correctAnswer);
      setScore(lastSignal.score);
    }
  }, [lastSignal]);

  const voteUp = () => {
    if (isQuestion) {
      qetaApi.votePostUp(entity.id).then(response => {
        setOwnVote(1);
        analytics.captureEvent('vote', 'question', { value: 1 });
        setEntity(response);
      });
    } else if ('postId' in entity) {
      qetaApi.voteAnswerUp(entity.postId, entity.id).then(response => {
        setOwnVote(1);
        analytics.captureEvent('vote', 'answer', { value: 1 });
        setEntity(response);
      });
    }
  };

  const voteDown = () => {
    if (isQuestion) {
      qetaApi.votePostDown(entity.id).then(response => {
        setOwnVote(-1);
        analytics.captureEvent('vote', 'question', { value: -1 });
        setEntity(response);
      });
    } else if ('postId' in entity) {
      qetaApi.voteAnswerDown(entity.postId, entity.id).then(response => {
        setOwnVote(-1);
        analytics.captureEvent('vote', 'answer', { value: -1 });
        setEntity(response);
      });
    }
  };

  let correctTooltip: string = correctAnswer
    ? t('voteButtons.answer.markIncorrect')
    : t('voteButtons.answer.markCorrect');
  if (!entity?.own) {
    correctTooltip = correctAnswer ? t('voteButtons.answer.marked') : '';
  }

  let voteUpTooltip: string = isQuestion
    ? t('voteButtons.question.good')
    : t('voteButtons.answer.good');
  if (own) {
    voteUpTooltip = isQuestion
      ? t('voteButtons.question.own')
      : t('voteButtons.answer.own');
  }

  let voteDownTooltip: string = isQuestion
    ? t('voteButtons.question.bad')
    : t('voteButtons.answer.bad');
  if (own) {
    voteDownTooltip = voteUpTooltip;
  }

  const toggleCorrectAnswer = () => {
    if (!('postId' in entity)) {
      return;
    }
    if (correctAnswer) {
      qetaApi.markAnswerIncorrect(entity.postId, entity.id).then(response => {
        if (response) {
          setCorrectAnswer(false);
        }
      });
    } else {
      qetaApi.markAnswerCorrect(entity.postId, entity.id).then(response => {
        if (response) {
          setCorrectAnswer(true);
        }
      });
    }
  };

  return {
    entity,
    ownVote,
    correctAnswer,
    score,
    voteUp,
    voteDown,
    toggleCorrectAnswer,
    voteUpTooltip,
    voteDownTooltip,
    correctTooltip,
  };
}
