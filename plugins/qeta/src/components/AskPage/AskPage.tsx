import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React, { useState } from 'react';
import {
  PostForm,
  SelectTemplateList,
  useQetaApi,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { filterTags, Template } from '@drodil/backstage-plugin-qeta-common';

export const AskPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { value, loading } = useQetaApi(api => api.getTemplates());
  const [template, setTemplate] = useState<Template | null | undefined>(
    undefined,
  );

  const entity = searchParams.get('entity') ?? undefined;
  const entityPage = searchParams.get('entityPage') === 'true';
  const tags = filterTags(searchParams.get('tags'));
  const { t } = useTranslation();
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
    return <Progress />;
  }

  if (
    !id &&
    value &&
    value.templates &&
    value.total > 0 &&
    template === undefined
  ) {
    return (
      <SelectTemplateList
        templates={value}
        onTemplateSelect={temp => setTemplate(temp)}
      />
    );
  }

  return (
    <>
      <ContentHeader title={title} />
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard>
            <PostForm
              id={id}
              entity={entity}
              entityPage={entityPage}
              tags={tags}
              type="question"
              template={template}
            />
          </InfoCard>
        </Grid>
      </Grid>
    </>
  );
};
