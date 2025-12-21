import CreateIcon from '@material-ui/icons/Create';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { writeRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { ContentHeaderButton } from './ContentHeaderButton';

export const WriteArticleButton = (props: {
  entity?: string;
  tags?: string[];
  entityPage?: boolean;
}) => {
  const { entity, entityPage, tags } = props;
  const writeRoute = useRouteRef(writeRouteRef);
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
        to={
          entity || tags ? `${writeRoute()}?${params.toString()}` : writeRoute()
        }
        color="primary"
        icon={<CreateIcon />}
      >
        {t('writeArticleButton.title')}
      </ContentHeaderButton>
    </OptionalRequirePermission>
  );
};
