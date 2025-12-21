import PlayListAddIcon from '@material-ui/icons/PlaylistAdd';
import { qetaCreateCollectionPermission } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionCreateRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { ContentHeaderButton } from './ContentHeaderButton';

export const CreateCollectionButton = () => {
  const createRoute = useRouteRef(collectionCreateRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <OptionalRequirePermission
      permission={qetaCreateCollectionPermission}
      errorPage={<></>}
    >
      <ContentHeaderButton
        to={createRoute()}
        color="primary"
        icon={<PlayListAddIcon />}
      >
        {t('createCollectionButton.title')}
      </ContentHeaderButton>
    </OptionalRequirePermission>
  );
};
