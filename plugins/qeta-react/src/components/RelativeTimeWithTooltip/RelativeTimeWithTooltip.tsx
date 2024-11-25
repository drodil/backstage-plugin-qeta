import React, { useEffect } from 'react';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { Tooltip } from '@material-ui/core';

export const RelativeTimeWithTooltip = (props: { value: Date | string }) => {
  const { value } = props;
  let date = value;
  const [updates, setUpdates] = React.useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates(updates === 1 ? 0 : 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [updates, setUpdates]);

  if (typeof date === 'string' || date instanceof String) {
    date = new Date(date);
  }

  return (
    <Tooltip title={date.toLocaleString(navigator.languages)}>
      <div style={{ display: 'inline' }}>
        <RelativeTime value={date} />
      </div>
    </Tooltip>
  );
};
