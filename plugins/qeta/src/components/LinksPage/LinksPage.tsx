import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ContentHeader,
  CreateLinkButton,
  PostsContainer,
  qetaTranslationRef,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { RiLinksLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const LinksPage = () => {
  const [searchParams] = useSearchParams();

  const [entityRef, setEntityRef] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[] | undefined>(undefined);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
    setTags(filterTags(searchParams.get('tags')));
  }, [searchParams, setEntityRef]);

  if (disabled.links) {
    return null;
  }

  return (
    <>
      <ContentHeader
        title={t('linksPage.title')}
        titleIcon={<RiLinksLine size={28} />}
      >
        <CreateLinkButton entity={entityRef} tags={tags} />
      </ContentHeader>
      <PostsContainer type="link" defaultView="list" />
    </>
  );
};
