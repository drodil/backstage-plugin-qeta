import { useSearchParams } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useTranslation } from '../../utils/hooks';
import { ContentHeader } from '@backstage/core-components';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { QuestionsContainer } from '../QuestionsContainer';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';

export const QuestionsPage = () => {
  const [searchParams] = useSearchParams();

  const [entityRef, setEntityRef] = React.useState<string | undefined>(
    undefined,
  );
  const [tags, setTags] = React.useState<string[] | undefined>(undefined);
  const { t } = useTranslation();
  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
    setTags(filterTags(searchParams.get('tags')));
  }, [searchParams, setEntityRef]);

  return (
    <>
      <ContentHeader title={t('questionsPage.title')}>
        <AskQuestionButton entity={entityRef} tags={tags} />
      </ContentHeader>
      <QuestionsContainer entity={entityRef} tags={tags} />
    </>
  );
};
