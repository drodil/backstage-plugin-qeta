import { ButtonIcon, Flex, Tooltip, TooltipTrigger } from '@backstage/ui';
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiSkipDownLine,
  RiSkipUpLine,
} from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';

export interface RankingButtonsProps {
  postId: number;
  collectionId: number | undefined;
  onRankUpdate?: () => void;
}

export const RankingButtons = (props: RankingButtonsProps) => {
  const { postId, collectionId, onRankUpdate } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const qetaApi = useApi(qetaApiRef);

  if (!collectionId) {
    return null;
  }

  const rank = (direction: 'top' | 'bottom' | 'up' | 'down') => {
    qetaApi.rankPostInCollection(collectionId, postId, direction).then(res => {
      if (res) {
        onRankUpdate?.();
      }
    });
  };

  return (
    <Flex justify="end" gap="1">
      <TooltipTrigger>
        <ButtonIcon
          aria-label={t('ranking.top', {})}
          size="small"
          variant="tertiary"
          onPress={() => rank('top')}
          icon={<RiSkipUpLine size={16} />}
        />
        <Tooltip>{t('ranking.top', {})}</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <ButtonIcon
          aria-label={t('ranking.up', {})}
          size="small"
          variant="tertiary"
          onPress={() => rank('up')}
          icon={<RiArrowUpSLine size={16} />}
        />
        <Tooltip>{t('ranking.up', {})}</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <ButtonIcon
          aria-label={t('ranking.down', {})}
          size="small"
          variant="tertiary"
          onPress={() => rank('down')}
          icon={<RiArrowDownSLine size={16} />}
        />
        <Tooltip>{t('ranking.down', {})}</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <ButtonIcon
          aria-label={t('ranking.bottom', {})}
          size="small"
          variant="tertiary"
          onPress={() => rank('bottom')}
          icon={<RiSkipDownLine size={16} />}
        />
        <Tooltip>{t('ranking.bottom', {})}</Tooltip>
      </TooltipTrigger>
    </Flex>
  );
};
