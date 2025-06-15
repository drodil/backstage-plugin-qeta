import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import { useState } from 'react';
import {
  AIAnswerCard,
  PostForm,
  qetaTranslationRef,
  SelectTemplateList,
  useAI,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { filterTags, Template } from '@drodil/backstage-plugin-qeta-common';
import { Grid, Box } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const AskPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isNewQuestionsEnabled } = useAI();
  const { value, loading } = useQetaApi(api => api.getTemplates());
  const [draft, setDraft] = useState<
    { title: string; content: string } | undefined
  >(undefined);
  const [template, setTemplate] = useState<Template | null | undefined>(
    undefined,
  );

  const entity = searchParams.get('entity') ?? undefined;
  const entityPage = searchParams.get('entityPage') === 'true';
  const tags = filterTags(searchParams.get('tags'));
  const { t } = useTranslationRef(qetaTranslationRef);
  let title;
  if (id) {
    title = t('askPage.title.existingQuestion');
  } else if (entity) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const representation = useEntityPresentation(entity);
    title = t('askPage.title.entityQuestion', {
      entity: representation.primaryTitle,
    });
  } else {
    title = t('askPage.title.newQuestion');
  }

  if (loading) {
    return (
      <Box role="status" aria-label={t('common.loading')}>
        <Progress />
      </Box>
    );
  }

  if (
    !id &&
    value &&
    value.templates &&
    value.total > 0 &&
    template === undefined
  ) {
    return (
      <Box role="region" aria-label={t('askPage.templateSelection')}>
        <SelectTemplateList
          templates={value}
          onTemplateSelect={temp => setTemplate(temp)}
          aria-label={t('askPage.selectTemplate')}
        />
      </Box>
    );
  }

  const handleFormChange = (data: { title: string; content: string }) => {
    if (!isNewQuestionsEnabled) {
      return;
    }
    setDraft({
      title: data.title,
      content: data.content,
    });
  };

  return (
    <>
      <ContentHeader title={title} />
      <Grid container spacing={3} direction="column">
        <Grid item style={{ width: '100%' }}>
          <InfoCard>
            <PostForm
              id={id}
              entity={entity}
              entityPage={entityPage}
              tags={tags}
              type="question"
              template={template}
              onFormChange={handleFormChange}
              aria-label={t('askPage.questionForm')}
            />
            <AIAnswerCard draft={draft} />
          </InfoCard>
        </Grid>
      </Grid>
    </>
  );
};
