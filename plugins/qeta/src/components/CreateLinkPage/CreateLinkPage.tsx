import { useParams, useSearchParams } from 'react-router-dom';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import {
  PostForm,
  qetaTranslationRef,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { Box, Header } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const CreateLinkPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const entity = searchParams.get('entity') ?? undefined;
  const entityPage = searchParams.get('entityPage') === 'true';
  const tags = filterTags(searchParams.get('tags'));
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  if (disabled.links) {
    return null;
  }

  let title;
  if (id) {
    title = t('createLinkPage.title.existingLink');
  } else if (entity) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const representation = useEntityPresentation(entity);
    title = t('createLinkPage.title.entityLink', {
      entity: representation.primaryTitle,
    });
  } else {
    title = t('createLinkPage.title.newLink');
  }

  return (
    <>
      <Header title={title} />
      <Box>
        <PostForm
          id={id}
          entity={entity}
          entityPage={entityPage}
          tags={tags}
          type="link"
        />
      </Box>
    </>
  );
};
