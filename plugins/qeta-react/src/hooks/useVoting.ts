import { useEffect, useState } from 'react';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import { useSignal } from '@backstage/plugin-signals-react';
import {
  AnswerResponse,
  PostResponse,
  QetaSignal,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../translation.ts';

function isPostResponse(
  resp: PostResponse | AnswerResponse,
): resp is PostResponse {
  return 'title' in resp;
}

export function useVoting(resp: PostResponse | AnswerResponse) {
  const [entity, setEntity] = useState<PostResponse | AnswerResponse>(resp);
  const [ownVote, setOwnVote] = useState(entity.ownVote ?? 0);
  const [correctAnswer, setCorrectAnswer] = useState(
    'postId' in entity ? entity.correct : false,
  );
  const [score, setScore] = useState(entity.score);
  const analytics = useAnalytics();
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);

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
    const prev = ownVote;
    const prevScore = score;
    setOwnVote(0);
    setScore(prevScore - prev);
    qetaApi
      .deletePostVote(id)
      .then(response => {
        analytics.captureEvent('vote', 'question', { value: 0 });
        setEntity(response);
      })
      .catch(() => {
        setOwnVote(prev);
        setScore(prevScore);
      });
  };

  const deleteAnswerVote = (postId: number, id: number) => {
    const prev = ownVote;
    const prevScore = score;
    setOwnVote(0);
    setScore(prevScore - prev);
    qetaApi
      .deleteAnswerVote(postId, id)
      .then(response => {
        analytics.captureEvent('vote', 'answer', { value: 0 });
        setEntity(response);
      })
      .catch(() => {
        setOwnVote(prev);
        setScore(prevScore);
      });
  };

  const voteUp = () => {
    if (ownVote > 0) {
      if (isPost) {
        deletePostVote(entity.id);
      } else if ('postId' in entity) {
        deleteAnswerVote(entity.postId, entity.id);
      }
      return;
    }
    const prev = ownVote;
    const prevScore = score;
    setOwnVote(1);
    setScore(prevScore + -prev + 1);
    if (isPost) {
      qetaApi
        .votePostUp(entity.id)
        .then(response => {
          analytics.captureEvent('vote', 'question', { value: 1 });
          setEntity(response);
        })
        .catch(() => {
          setOwnVote(prev);
          setScore(prevScore);
        });
    } else if ('postId' in entity) {
      if (ownVote > 0) {
        deleteAnswerVote(entity.postId, entity.id);
        return;
      }
      qetaApi
        .voteAnswerUp(entity.postId, entity.id)
        .then(response => {
          analytics.captureEvent('vote', 'answer', { value: 1 });
          setEntity(response);
        })
        .catch(() => {
          setOwnVote(prev);
          setScore(prevScore);
        });
    }
  };

  const voteDown = () => {
    if (ownVote < 0) {
      if (isPost) {
        deletePostVote(entity.id);
      } else if ('postId' in entity) {
        deleteAnswerVote(entity.postId, entity.id);
      }
      return;
    }
    const prev = ownVote;
    const prevScore = score;

    setOwnVote(-1);
    setScore(prevScore - prev - 1);
    if (isPost) {
      qetaApi
        .votePostDown(entity.id)
        .then(response => {
          analytics.captureEvent('vote', 'question', { value: -1 });
          setEntity(response);
        })
        .catch(() => {
          setOwnVote(prev);
          setScore(prevScore);
        });
    } else if ('postId' in entity) {
      qetaApi
        .voteAnswerDown(entity.postId, entity.id)
        .then(response => {
          analytics.captureEvent('vote', 'answer', { value: -1 });
          setEntity(response);
        })
        .catch(() => {
          setOwnVote(prev);
          setScore(prevScore);
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
      setCorrectAnswer(false);
      qetaApi
        .markAnswerIncorrect(entity.postId, entity.id)
        .then(response => {
          if (!response) {
            setCorrectAnswer(true);
          }
          analytics.captureEvent('answer', 'correct', {
            value: 0,
          });
        })
        .catch(() => {
          setCorrectAnswer(true);
        });
    } else {
      setCorrectAnswer(true);
      qetaApi
        .markAnswerCorrect(entity.postId, entity.id)
        .then(response => {
          if (!response) {
            setCorrectAnswer(false);
          }
          analytics.captureEvent('answer', 'correct', {
            value: 1,
          });
        })
        .catch(() => {
          setCorrectAnswer(false);
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
