import { CSSProperties } from 'react';
import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { ButtonLink, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';
import { qetaApiRef } from '../../api.ts';
import { useApi } from '@backstage/core-plugin-api';

export const OpenLinkButton = (props: {
  entity: PostResponse;
  className?: string;
  style?: CSSProperties;
}) => {
  const { entity, className, style } = props;
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);

  if (!entity.url) {
    return null;
  }

  return (
    <TooltipTrigger>
      <ButtonLink
        href={entity.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('link.open')}
        variant="secondary"
        onPress={() => qetaApi.clickLink(entity.id)}
        className={className}
        style={style}
        iconStart={<RiExternalLinkLine size={16} />}
      />
      <Tooltip>{`${t('link.open')}: ${entity.url}`}</Tooltip>
    </TooltipTrigger>
  );
};
