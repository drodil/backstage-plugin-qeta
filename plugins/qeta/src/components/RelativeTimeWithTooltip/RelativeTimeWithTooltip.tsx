import { Tooltip } from '@material-ui/core';
import React from 'react';
// @ts-ignore
import RelativeTime from 'react-relative-time';

export const RelativeTimeWithTooltip = (props: { value: Date | string }) => {
  const { value } = props;
  let date = value;
  if (typeof date === 'string' || date instanceof String) {
    date = new Date(date);
  }
  return (
    <Tooltip title={date.toLocaleString(navigator.languages)}>
      <RelativeTime value={date} />
    </Tooltip>
  );
};
