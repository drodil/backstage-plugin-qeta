import { Control, Controller } from 'react-hook-form';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Checkbox, Tooltip, TooltipTrigger } from '@backstage/ui';
import styles from './PostAnonymouslyCheckbox.module.css';

export const PostAnonymouslyCheckbox = (props: {
  control: Control<any>;
  disabled?: boolean;
  label: string;
}) => {
  const { control, disabled, label } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  return (
    <div className={styles.root}>
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => {
          return (
            <TooltipTrigger>
              <Checkbox
                onChange={onChange}
                isSelected={value === true}
                isDisabled={disabled}
                name="anonymous"
                data-testid="post-anonymously-checkbox"
              >
                {label}
              </Checkbox>
              <Tooltip>{t('anonymousCheckbox.tooltip')}</Tooltip>
            </TooltipTrigger>
          );
        }}
        name="anonymous"
      />
    </div>
  );
};
