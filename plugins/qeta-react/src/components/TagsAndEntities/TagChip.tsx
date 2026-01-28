import { CSSProperties } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';
import { Link } from 'react-router-dom';
import { Chip, Tooltip } from '@material-ui/core';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';
import { TagTooltip } from '../Tooltips';

export const TagChip = (props: {
  tag: string;
  style?: CSSProperties;
  useHref?: boolean;
  tooltip?: React.ReactElement;
}) => {
  const tagRoute = useRouteRef(tagRouteRef);
  const { tag, tooltip } = props;
  const classes = useTooltipStyles();
  const href = tagRoute({ tag });

  const content = (
    <Chip
      label={tag}
      size="small"
      className="qetaTagChip"
      component={props.useHref ? 'a' : Link}
      style={props.style}
      to={props.useHref ? undefined : href}
      href={props.useHref ? href : undefined}
      target={props.useHref ? '_blank' : undefined}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
      clickable
    />
  );

  if (tooltip) {
    return (
      <Tooltip
        arrow
        title={tooltip}
        enterDelay={400}
        interactive
        classes={{
          tooltip: classes.tooltip,
          arrow: classes.tooltipArrow,
        }}
      >
        {content}
      </Tooltip>
    );
  }

  return (
    <TagTooltip tag={tag} interactive enterDelay={400}>
      {content}
    </TagTooltip>
  );
};
