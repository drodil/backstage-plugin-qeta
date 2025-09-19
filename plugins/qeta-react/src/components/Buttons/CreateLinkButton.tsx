import LinkIcon from '@material-ui/icons/Link';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { createLinkRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box } from '@material-ui/core';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';

export const CreateLinkButton = (props: {
  entity?: string;
  tags?: string[];
  entityPage?: boolean;
}) => {
  const { entity, entityPage, tags } = props;
  const linkRoute = useRouteRef(createLinkRouteRef);
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
      <Box sx={{ marginLeft: 2 }}>
        <LinkButton
          size="small"
          variant="contained"
          to={
            entity || tags ? `${linkRoute()}?${params.toString()}` : linkRoute()
          }
          color="primary"
          startIcon={<LinkIcon />}
        >
          {t('createLinkButton.title')}
        </LinkButton>
      </Box>
    </OptionalRequirePermission>
  );
};
