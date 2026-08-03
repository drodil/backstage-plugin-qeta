import { useEffect, useState } from 'react';
// @ts-ignore
import RelativeTime from 'react-relative-time';
import { Focusable, Tooltip, TooltipTrigger } from '@backstage/ui';

export const RelativeTimeWithTooltip = (props: { value: Date | string }) => {
  const { value } = props;
  let date = value;
  const [updates, setUpdates] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates(updates === 1 ? 0 : 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [updates, setUpdates]);

  if (typeof date === 'string') {
    date = new Date(date);
  }

  return (
    <TooltipTrigger>
      <Focusable>
        <span>
          <RelativeTime value={date} />
        </span>
      </Focusable>
      <Tooltip>{date.toLocaleString(navigator.languages)}</Tooltip>
    </TooltipTrigger>
  );
};
