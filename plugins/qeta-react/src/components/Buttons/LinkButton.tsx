import {
  AnswerResponse,
  PostResponse,
  isPost,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiLinkM } from '@remixicon/react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';

export const LinkButton = (props: {
  entity: PostResponse | AnswerResponse;
  className?: string;
}) => {
  const isPostEntity = isPost(props.entity);
  const { t } = useTranslationRef(qetaTranslationRef);
  const alertApi = useApi(alertApiRef);
  const copyToClipboard = () => {
    const url = new URL(window.location.href);
    if (!isPostEntity) {
      url.hash = `#answer_${props.entity.id}`;
    }
    window.navigator.clipboard.writeText(url.toString());
    alertApi.post({
      message: t('link.copied'),
      severity: 'info',
      display: 'transient',
    });
  };

  return (
    <TooltipTrigger>
      <ButtonIcon
        aria-label={t('link.aria')}
        size="small"
        variant="tertiary"
        onPress={copyToClipboard}
        className={props.className}
        icon={<RiLinkM size={16} />}
      />
      <Tooltip>{isPostEntity ? t('link.post') : t('link.answer')}</Tooltip>
    </TooltipTrigger>
  );
};
