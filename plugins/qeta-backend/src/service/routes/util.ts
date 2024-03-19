import {
  Answer,
  QetaSignal,
  Question,
} from '@drodil/backstage-plugin-qeta-common';
import { SignalsService } from '@backstage/plugin-signals-node';

export const signalQuestionStats = (
  signalService?: SignalsService,
  question?: Question | null,
) => {
  if (!signalService || !question) {
    return;
  }
  signalService.publish<QetaSignal>({
    recipients: { type: 'broadcast' },
    channel: `qeta:question_${question.id}`,
    message: {
      type: 'question_stats',
      views: question.views,
      score: question.score,
      answersCount: question.answersCount,
      correctAnswer: question.correctAnswer,
    },
  });
};

export const signalAnswerStats = async (
  signalService?: SignalsService,
  answer?: Answer | null,
) => {
  if (!signalService || !answer) {
    return;
  }
  signalService.publish<QetaSignal>({
    recipients: { type: 'broadcast' },
    channel: `qeta:answer_${answer.id}`,
    message: {
      type: 'answer_stats',
      score: answer.score,
      correctAnswer: answer.correct,
    },
  });
};
