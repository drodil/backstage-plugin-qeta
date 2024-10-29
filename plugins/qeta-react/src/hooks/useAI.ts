import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import React, { useCallback, useEffect } from 'react';

let aiEnabled: boolean | undefined = undefined;

export const useAI = () => {
  const qetaApi = useApi(qetaApiRef);
  const [isAIEnabled, setIsAIEnabled] = React.useState<boolean | undefined>(
    aiEnabled,
  );

  useEffect(() => {
    if (aiEnabled !== undefined) {
      return;
    }
    qetaApi.isAIEnabled().then(resp => {
      setIsAIEnabled(resp);
      aiEnabled = resp;
    });
  }, [qetaApi]);

  const answerExistingQuestion = useCallback(
    async (questionId: number) => {
      return qetaApi.getAIAnswerForQuestion(questionId);
    },
    [qetaApi],
  );

  const answerDraftQuestion = useCallback(
    async (draft: { title: string; content: string }) => {
      return qetaApi.getAIAnswerForDraft(draft.title, draft.content);
    },
    [qetaApi],
  );

  return { isAIEnabled, answerExistingQuestion, answerDraftQuestion };
};
