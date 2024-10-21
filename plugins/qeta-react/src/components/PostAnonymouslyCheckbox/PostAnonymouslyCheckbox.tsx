import { Control, Controller } from 'react-hook-form';
import { Box, Checkbox, FormControlLabel, Tooltip } from '@material-ui/core';
import React from 'react';
import { useTranslation } from '../../utils';

export const PostAnonymouslyCheckbox = (props: {
  control: Control<any>;
  label: string;
}) => {
  const { control, label } = props;
  const { t } = useTranslation();
  return (
    <Box style={{ marginLeft: '0.2rem' }}>
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
