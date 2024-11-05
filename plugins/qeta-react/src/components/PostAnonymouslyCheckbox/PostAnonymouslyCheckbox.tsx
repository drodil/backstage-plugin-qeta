import { Control, Controller } from 'react-hook-form';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import React from 'react';
import { useTranslation } from '../../hooks';

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
