import { Control, Controller } from 'react-hook-form';
import { Box, Checkbox, FormControlLabel, Tooltip } from '@material-ui/core';
import React from 'react';

export const AskAnonymouslyCheckbox = (props: {
  control: Control<any>;
  label: string;
}) => {
  const { control, label } = props;
  return (
    <Box style={{ marginLeft: '0.2rem' }}>
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <FormControlLabel
            control={
              <Tooltip title="By enabling this, other users won't be able to see you as an author">
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
