import { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';
import { Tag, Tooltip, TooltipTrigger } from '@backstage/ui';
import { TagTooltip } from '../Tooltips';

export const TagChip = (props: {
  tag: string;
  style?: CSSProperties;
  useHref?: boolean;
  tooltip?: React.ReactElement;
}) => {
  const tagRoute = useRouteRef(tagRouteRef);
  const { tag, tooltip, useHref } = props;
  const navigate = useNavigate();
  const href = tagRoute({ tag });

  const content = (
    <Tag
      size="small"
      className="qetaTagChip"
      style={props.style}
      href={useHref ? href : undefined}
      target={useHref ? '_blank' : undefined}
      onPress={useHref ? undefined : () => navigate(href)}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
    >
      {tag}
    </Tag>
  );

  if (tooltip) {
    return (
      <TooltipTrigger delay={400}>
        {content}
        <Tooltip>{tooltip}</Tooltip>
      </TooltipTrigger>
    );
  }

  return (
    <TagTooltip tag={tag} interactive enterDelay={400}>
      {content}
    </TagTooltip>
  );
};
