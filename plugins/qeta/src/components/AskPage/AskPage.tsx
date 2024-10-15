import { ContentHeader, InfoCard } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';

import { AskForm } from '../AskForm/AskForm';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { useTranslation } from '../../utils/hooks';

export const AskPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
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

  return (
    <>
      <ContentHeader title={title} />
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard>
            <AskForm
              id={id}
              entity={entity}
              entityPage={entityPage}
              tags={tags}
            />
          </InfoCard>
        </Grid>
      </Grid>
    </>
  );
};
