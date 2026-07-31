import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { writeRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { ContentHeaderButton } from './ContentHeaderButton';
import { useQetaConfig } from '../../hooks';
import { RiBook2Line } from '@remixicon/react';
import { Tooltip, TooltipTrigger } from '@backstage/ui';

export const WriteArticleButton = (props: {
  entity?: string;
  tags?: string[];
  entityPage?: boolean;
  compact?: boolean;
}) => {
  const { entity, entityPage, tags, compact } = props;
  const writeRoute = useRouteRef(writeRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  if (disabled.articles) {
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
            entity || tags
              ? `${writeRoute()}?${params.toString()}`
              : writeRoute()
          }
          color="primary"
          icon={<RiBook2Line />}
        >
          {t('writeArticleButton.title')}
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
            entity || tags
              ? `${writeRoute()}?${params.toString()}`
              : writeRoute()
          }
          color="primary"
          icon={<RiBook2Line />}
        />
        <Tooltip>{t('writeArticleButton.title')}</Tooltip>
      </TooltipTrigger>
    </OptionalRequirePermission>
  );
};
