import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import React, { useCallback, useEffect } from 'react';

let aiEnabled: boolean | undefined = undefined;
let aiForQuestionEnabled: boolean | undefined = undefined;
let aiForDraftEnabled: boolean | undefined = undefined;

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
      if (aiForQuestionEnabled === false) {
        return null;
      }
      const ret = await qetaApi.getAIAnswerForQuestion(questionId);
      if (ret === null) {
        aiForQuestionEnabled = false;
      }
      return ret;
    },
    [qetaApi],
  );

  const answerDraftQuestion = useCallback(
    async (draft: { title: string; content: string }) => {
      if (aiForDraftEnabled === false) {
        return null;
      }
      const ret = await qetaApi.getAIAnswerForDraft(draft.title, draft.content);
      if (ret === null) {
        aiForDraftEnabled = false;
      }
      return ret;
    },
    [qetaApi],
  );

  return { isAIEnabled, answerExistingQuestion, answerDraftQuestion };
};
