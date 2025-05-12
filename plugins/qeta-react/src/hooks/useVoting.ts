import { useEffect, useState } from 'react';
import * as React from 'react';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import { useTranslation } from './useTranslation';
import { useSignal } from '@backstage/plugin-signals-react';
import {
  AnswerResponse,
  PostResponse,
  QetaSignal,
} from '@drodil/backstage-plugin-qeta-common';

function isPostResponse(
  resp: PostResponse | AnswerResponse,
): resp is PostResponse {
  return 'title' in resp;
}

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

  const isPost = isPostResponse(resp);
  const own = entity.own ?? false;

  const { lastSignal } = useSignal<QetaSignal>(
    isPost ? `qeta:post_${entity.id}` : `qeta:answer_${entity.id}`,
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

  const deletePostVote = (id: number) => {
    qetaApi.deletePostVote(id).then(response => {
      setOwnVote(0);
      analytics.captureEvent('vote', 'question', { value: 0 });
      setEntity(response);
    });
  };

  const deleteAnswerVote = (postId: number, id: number) => {
    qetaApi.deleteAnswerVote(postId, id).then(response => {
      setOwnVote(0);
      analytics.captureEvent('vote', 'answer', { value: 0 });
      setEntity(response);
    });
  };

  const voteUp = () => {
    if (isPost) {
      if (ownVote > 0) {
        deletePostVote(entity.id);
        return;
      }
      qetaApi.votePostUp(entity.id).then(response => {
        setOwnVote(1);
        analytics.captureEvent('vote', 'question', { value: 1 });
        setEntity(response);
      });
    } else if ('postId' in entity) {
      if (ownVote > 0) {
        deleteAnswerVote(entity.postId, entity.id);
        return;
      }
      qetaApi.voteAnswerUp(entity.postId, entity.id).then(response => {
        setOwnVote(1);
        analytics.captureEvent('vote', 'answer', { value: 1 });
        setEntity(response);
      });
    }
  };

  const voteDown = () => {
    if (isPost) {
      if (ownVote < 0) {
        deletePostVote(entity.id);
        return;
      }
      qetaApi.votePostDown(entity.id).then(response => {
        setOwnVote(-1);
        analytics.captureEvent('vote', 'question', { value: -1 });
        setEntity(response);
      });
    } else if ('postId' in entity) {
      if (ownVote < 0) {
        deleteAnswerVote(entity.postId, entity.id);
        return;
      }
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
  if (own) {
    correctTooltip = correctAnswer ? t('voteButtons.answer.marked') : '';
  }

  let voteUpTooltip: string = isPost
    ? t('voteButtons.post.good', { type: resp.type })
    : t('voteButtons.answer.good');
  if (own) {
    voteUpTooltip = isPost
      ? t('voteButtons.post.own', { type: resp.type })
      : t('voteButtons.answer.own');
  }

  let voteDownTooltip: string = isPost
    ? t('voteButtons.post.bad', { type: resp.type })
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
