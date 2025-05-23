import {
  Answer,
  Post,
  QetaIdEntity,
  QetaSignal,
} from '@drodil/backstage-plugin-qeta-common';
import { SignalsService } from '@backstage/plugin-signals-node';

export const wrapAsync = async (fn: Function) => {
  fn();
};

export const signalPostStats = (
  signalService?: SignalsService,
  question?: Post | null,
) => {
  if (!signalService || !question) {
    return;
  }
  signalService.publish<QetaSignal>({
    recipients: { type: 'broadcast' },
    channel: `qeta:post_${question.id}`,
    message: {
      type: 'post_stats',
      views: question.views,
      score: question.score,
      answersCount: question.answersCount,
      correctAnswer: question.correctAnswer,
    },
  });
};

export const signalAnswerStats = (
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

export const validateDateRange = (
  fromDate: string,
  toDate: string,
): { isValid: boolean; error?: string; field?: string } => {
  if (fromDate && toDate) {
    const fromDateNewDate = new Date(fromDate);
    const toDateNewDate = new Date(toDate);
    if (fromDateNewDate <= toDateNewDate) {
      return { isValid: true };
    }
    return { isValid: false, error: 'From Date should be less than To Date' };
  } else if (!fromDate && toDate) {
    return {
      isValid: false,
      field: 'fromDate',
      error: 'Please enter from date in format YYYY-MM-DD',
    };
  } else if (fromDate && !toDate) {
    return {
      isValid: false,
      field: 'toDate',
      error: 'Please enter to date in format YYYY-MM-DD',
    };
  }

  return { isValid: true };
};

export const entityToJsonObject = (entity: QetaIdEntity) => {
  try {
    return JSON.parse(JSON.stringify(entity));
  } catch {
    return { id: entity.id };
  }
};
