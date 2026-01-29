import {
  PostHighlightListContent,
  qetaTranslationRef,
  useQetaApi,
  useQetaContext,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Post } from '@drodil/backstage-plugin-qeta-common';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  similarQuestionsContainer: {
    borderLeft: `3px solid ${theme.palette.warning.main}`,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255, 167, 38, 0.08)'
        : 'rgba(255, 167, 38, 0.05)',
    borderRadius: theme.shape.borderRadius,
    padding: `${theme.spacing(1)}px 2px ${theme.spacing(1)}px`,
  },
  similarQuestionsTitle: {
    color: theme.palette.warning.main,
    fontWeight: 600,
  },
}));

export const SimilarQuestions = () => {
  const classes = useStyles();
  const { draftQuestion } = useQetaContext();
  const { t } = useTranslationRef(qetaTranslationRef);
  const [debouncedDraftQuestion, setDebouncedDraftQuestion] =
    useState(draftQuestion);

  useEffect(() => {
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

  const [displayQuestions, setDisplayQuestions] = useState<Post[]>([]);

  useEffect(() => {
    if (questions) {
      setDisplayQuestions(questions.posts);
    }
  }, [questions]);

  useEffect(() => {
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
      containerClassName={classes.similarQuestionsContainer}
      titleClassName={classes.similarQuestionsTitle}
    />
  );
};
