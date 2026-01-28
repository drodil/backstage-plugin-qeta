import { useRouteRef } from '@backstage/core-plugin-api';
import { userRouteRef } from '../../routes';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { UserTooltip } from '../Tooltips';

export const UserChip = (props: { entityRef: string }) => {
  const navigate = useNavigate();
  const { entityRef } = props;
  const userRoute = useRouteRef(userRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { primaryTitle: userName } = useEntityPresentation(
    entityRef.startsWith('user:') ? entityRef : `user:${entityRef}`,
  );
  if (entityRef === 'anonymous') {
    return <>{t('userLink.anonymous')}</>;
  }
  return (
    <UserTooltip entityRef={entityRef} enterDelay={400} interactive>
      <Chip
        label={userName}
        size="small"
        className="qetaTagChip"
        component="a"
        onClick={() => {
          navigate(`${userRoute()}/${entityRef}`);
        }}
        clickable
      />
    </UserTooltip>
  );
};
