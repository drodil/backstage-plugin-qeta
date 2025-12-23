import { Control, Controller } from 'react-hook-form';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, Checkbox, FormControlLabel, Tooltip } from '@material-ui/core';

export const PostAnonymouslyCheckbox = (props: {
  control: Control<any>;
  disabled?: boolean;
  label: string;
}) => {
  const { control, disabled, label } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  return (
    <Box style={{ marginLeft: '0.2em' }}>
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <FormControlLabel
            control={
              <Tooltip title={t('anonymousCheckbox.tooltip')}>
                <Checkbox
                  onChange={onChange}
                  value={value}
                  size="small"
                  disabled={disabled}
                  name="anonymous"
                />
              </Tooltip>
            }
            label={label}
          />
        )}
        name="anonymous"
      />
    </Box>
  );
};
