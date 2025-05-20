import { SvgIconProps, Tooltip } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const ExpertIcon = (props: SvgIconProps) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  return (
    <Tooltip title={t('common.tagExpert')}>
      <StarIcon
        color="secondary"
        style={{ width: '0.5em', height: '0.5em' }}
        {...props}
      />
    </Tooltip>
  );
};
