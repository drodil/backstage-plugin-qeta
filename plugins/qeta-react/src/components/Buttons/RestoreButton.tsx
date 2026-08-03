import { RiArrowGoBackLine } from '@remixicon/react';
import { Button, ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Post } from '@drodil/backstage-plugin-qeta-common';
import { useIsModerator } from '../../hooks';
import { qetaApiRef } from '../../api.ts';
import { useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';

export const RestoreButton = (props: { entity: Post; compact?: boolean }) => {
  const { entity, compact } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const { isModerator } = useIsModerator();
  const qetaApi = useApi(qetaApiRef);
  const toastApi = useApi(toastApiRef);

  const restore = async () => {
    qetaApi
      .restorePost(entity.id)
      .catch(e =>
        toastApi.post({
          title: e.message,
          status: 'warning',
        }),
      )
      .then(() => {
        window.location.reload();
      });
  };
  if (!isModerator || entity.status !== 'deleted') {
    return null;
  }

  if (compact) {
    return (
      <TooltipTrigger>
        <ButtonIcon
          aria-label={t('common.restore')}
          size="small"
          variant="tertiary"
          onPress={() => restore()}
          icon={<RiArrowGoBackLine size={16} />}
        />
        <Tooltip>{t('common.restore')}</Tooltip>
      </TooltipTrigger>
    );
  }

  return (
    <Button
      variant="secondary"
      size="small"
      iconStart={<RiArrowGoBackLine size={16} />}
      onClick={restore}
    >
      {t('common.restore')}
    </Button>
  );
};
