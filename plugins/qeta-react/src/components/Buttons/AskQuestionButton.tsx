import HelpOutline from '@material-ui/icons/HelpOutline';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { askRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { ContentHeaderButton } from './ContentHeaderButton';

export const AskQuestionButton = (props: {
  entity?: string;
  tags?: string[];
  entityPage?: boolean;
}) => {
  const { entity, entityPage, tags } = props;
  const askRoute = useRouteRef(askRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);

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

  return (
    <OptionalRequirePermission
      permission={qetaCreatePostPermission}
      errorPage={<></>}
    >
      <ContentHeaderButton
        to={entity || tags ? `${askRoute()}?${params.toString()}` : askRoute()}
        color="primary"
        icon={<HelpOutline />}
      >
        {t('askQuestionButton.title')}
      </ContentHeaderButton>
    </OptionalRequirePermission>
  );
};
