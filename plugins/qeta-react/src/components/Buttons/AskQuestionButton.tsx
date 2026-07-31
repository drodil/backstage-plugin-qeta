import { RiQuestionLine } from '@remixicon/react';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { askRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { ContentHeaderButton } from './ContentHeaderButton';
import { useQetaConfig } from '../../hooks';
import { Tooltip, TooltipTrigger } from '@backstage/ui';

export const AskQuestionButton = (props: {
  entity?: string;
  tags?: string[];
  entityPage?: boolean;
  compact?: boolean;
}) => {
  const { entity, entityPage, tags, compact } = props;
  const askRoute = useRouteRef(askRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  if (disabled.questions) {
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
            entity || tags ? `${askRoute()}?${params.toString()}` : askRoute()
          }
          color="primary"
          icon={<RiQuestionLine />}
        >
          {t('askQuestionButton.title')}
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
            entity || tags ? `${askRoute()}?${params.toString()}` : askRoute()
          }
          color="primary"
          icon={<RiQuestionLine />}
        />
        <Tooltip>{t('askQuestionButton.title')}</Tooltip>
      </TooltipTrigger>
    </OptionalRequirePermission>
  );
};
