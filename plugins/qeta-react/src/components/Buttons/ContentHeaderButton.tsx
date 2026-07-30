import { ReactElement, ReactNode } from 'react';
import { LinkButton } from '@backstage/core-components';
import { Button, useBreakpoint } from '@backstage/ui';

interface ContentHeaderButtonProps {
  to?: string;
  onClick?: () => void;
  icon: ReactElement;
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'default';
  disabled?: boolean;
}

const toButtonVariant = (
  color: 'primary' | 'secondary' | 'default',
): 'primary' | 'secondary' | 'tertiary' => {
  if (color === 'secondary') {
    return 'secondary';
  }
  if (color === 'default') {
    return 'tertiary';
  }
  return 'primary';
};

export const ContentHeaderButton = (props: ContentHeaderButtonProps) => {
  const { to, onClick, icon, children, color = 'primary', disabled } = props;
  const { down } = useBreakpoint();
  const isSmallScreen = down('md');

  const style = {
    minWidth: isSmallScreen ? '0' : undefined,
    padding: isSmallScreen ? '6px' : undefined,
  };

  if (to) {
    return (
      <LinkButton
        size="small"
        variant="contained"
        color={color}
        startIcon={isSmallScreen ? undefined : icon}
        style={style}
        disabled={disabled}
        to={to}
      >
        {isSmallScreen ? icon : children}
      </LinkButton>
    );
  }

  return (
    <Button
      size="small"
      variant={toButtonVariant(color)}
      iconStart={isSmallScreen ? undefined : icon}
      isDisabled={disabled}
      onClick={onClick}
      style={style}
    >
      {isSmallScreen ? icon : children}
    </Button>
  );
};
