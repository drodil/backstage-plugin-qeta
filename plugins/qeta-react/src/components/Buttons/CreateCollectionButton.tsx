import PlayListAddIcon from '@material-ui/icons/PlaylistAdd';
import { qetaCreateCollectionPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionCreateRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';

export const CreateCollectionButton = () => {
  const createRoute = useRouteRef(collectionCreateRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <OptionalRequirePermission
      permission={qetaCreateCollectionPermission}
      errorPage={<></>}
    >
      <LinkButton
        size="small"
        variant="contained"
        to={createRoute()}
        color="primary"
        startIcon={<PlayListAddIcon />}
      >
        {t('createCollectionButton.title')}
      </LinkButton>
    </OptionalRequirePermission>
  );
};
