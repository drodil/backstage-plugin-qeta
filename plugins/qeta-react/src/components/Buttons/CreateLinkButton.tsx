import { RiLinkM } from '@remixicon/react';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { createLinkRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { ContentHeaderButton } from './ContentHeaderButton';
import { useQetaConfig } from '../../hooks';
import { Tooltip, TooltipTrigger } from '@backstage/ui';

export const CreateLinkButton = (props: {
  entity?: string;
  tags?: string[];
  entityPage?: boolean;
  compact?: boolean;
}) => {
  const { entity, entityPage, tags, compact } = props;
  const linkRoute = useRouteRef(createLinkRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  if (disabled.links) {
    return null;
  }

  const params = new URLSearchParams();
  if (entity) {
    params.set('entity', entity);
  }
  if (entityPage) {
    params.set('entityPage', 'true');
  }
  if (tags && tags.length > 0) {
    params.set('tags', tags.join(','));
  }

  if (!compact) {
    return (
      <OptionalRequirePermission
        permission={qetaCreatePostPermission}
        errorPage={<></>}
      >
        <ContentHeaderButton
          to={
            entity || tags ? `${linkRoute()}?${params.toString()}` : linkRoute()
          }
          color="primary"
          icon={<RiLinkM />}
        >
          {t('createLinkButton.title')}
        </ContentHeaderButton>
      </OptionalRequirePermission>
    );
  }

  return (
    <OptionalRequirePermission
      permission={qetaCreatePostPermission}
      errorPage={<></>}
    >
      <TooltipTrigger>
        <ContentHeaderButton
          to={
            entity || tags ? `${linkRoute()}?${params.toString()}` : linkRoute()
          }
          color="primary"
          icon={<RiLinkM />}
        />
        <Tooltip>{t('createLinkButton.title')}</Tooltip>
      </TooltipTrigger>
    </OptionalRequirePermission>
  );
};
