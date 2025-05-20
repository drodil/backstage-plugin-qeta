import { SvgIconProps, Tooltip } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import { useTranslation } from '../../hooks';

export const ExpertIcon = (props: SvgIconProps) => {
  const { t } = useTranslation();
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
