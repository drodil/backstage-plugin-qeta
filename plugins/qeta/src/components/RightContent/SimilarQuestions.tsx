import React from 'react';

import {
  PostHighlightListContent,
  qetaTranslationRef,
  useQetaApi,
  useQetaContext,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Post } from '@drodil/backstage-plugin-qeta-common';

export const SimilarQuestions = () => {
  const { draftQuestion } = useQetaContext();
  const { t } = useTranslationRef(qetaTranslationRef);
  const [debouncedDraftQuestion, setDebouncedDraftQuestion] =
    React.useState(draftQuestion);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDraftQuestion(draftQuestion);
    }, 1500);

    return () => {
      clearTimeout(handler);
    };
  }, [draftQuestion]);

  const { value: questions, loading } = useQetaApi(
    api => {
      if (
        !debouncedDraftQuestion ||
        debouncedDraftQuestion.title.length === 0
      ) {
        return Promise.resolve({ posts: [], total: 0 });
      }
      return api.suggest({
        title: debouncedDraftQuestion.title,
        content: debouncedDraftQuestion.content,
        tags: debouncedDraftQuestion.tags,
        entities: debouncedDraftQuestion.entities,
      });
    },
    [debouncedDraftQuestion],
  );

  const [displayQuestions, setDisplayQuestions] = React.useState<Post[]>([]);

  React.useEffect(() => {
    if (questions) {
      setDisplayQuestions(questions.posts);
    }
  }, [questions]);

  React.useEffect(() => {
    if (
      (!draftQuestion || draftQuestion.title.length === 0) &&
      displayQuestions.length > 0
    ) {
      setDisplayQuestions([]);
    }
  }, [draftQuestion, displayQuestions]);

  if (displayQuestions.length === 0) {
    return null;
  }

  return (
    <PostHighlightListContent
      title={t('rightMenu.similarQuestions')}
      posts={displayQuestions}
      loading={loading}
      disableLoading
    />
  );
};
