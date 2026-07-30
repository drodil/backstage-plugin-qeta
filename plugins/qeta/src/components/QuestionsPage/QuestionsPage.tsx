import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  AskQuestionButton,
  ContentHeader,
  PostsContainer,
  qetaTranslationRef,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';

import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { RiQuestionLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const QuestionsPage = () => {
  const [searchParams] = useSearchParams();

  const [entityRef, setEntityRef] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[] | undefined>(undefined);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
    setTags(filterTags(searchParams.get('tags')));
  }, [searchParams, setEntityRef]);

  if (disabled.questions) {
    return null;
  }

  return (
    <>
      <ContentHeader
        title={t('questionsPage.title')}
        titleIcon={<RiQuestionLine size={28} />}
      >
        <AskQuestionButton entity={entityRef} tags={tags} />
      </ContentHeader>
      <PostsContainer type="question" defaultView="list" />
    </>
  );
};
