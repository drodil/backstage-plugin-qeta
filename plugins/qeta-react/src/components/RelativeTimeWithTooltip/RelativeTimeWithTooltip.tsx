import { Focusable, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RelativeTime } from './RelativeTime';

export const RelativeTimeWithTooltip = (props: { value: Date | string }) => {
  const { value } = props;
  const date = typeof value === 'string' ? new Date(value) : value;

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
