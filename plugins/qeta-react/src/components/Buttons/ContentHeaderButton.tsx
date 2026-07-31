import { ReactElement, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const style = {
    minWidth: isSmallScreen ? '0' : undefined,
    padding: isSmallScreen ? '6px' : undefined,
  };

  if (to) {
    return (
      <Button
        size="small"
        variant={toButtonVariant(color)}
        iconStart={isSmallScreen ? undefined : icon}
        style={style}
        isDisabled={disabled}
        onClick={() => navigate(to)}
      >
        {isSmallScreen ? icon : children}
      </Button>
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
