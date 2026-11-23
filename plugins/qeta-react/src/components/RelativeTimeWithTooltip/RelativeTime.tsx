import { useEffect, useState } from 'react';
import { formatRelativeTime } from './formatRelativeTime';

/** How long ago `value` was, in the browser's languages, updated every 30 seconds. */
export const RelativeTime = (props: { value: Date | string }) => {
  const { value } = props;
  const date = typeof value === 'string' ? new Date(value) : value;
  const valid = !Number.isNaN(date.getTime());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <time dateTime={valid ? date.toISOString() : undefined}>
      {formatRelativeTime(date, now, [...navigator.languages])}
    </time>
  );
};
