import { ReactNode } from 'react';
import { LinkButton } from '@backstage/core-components';
import { useTheme, useMediaQuery, Button } from '@material-ui/core';

interface ContentHeaderButtonProps {
  to?: string;
  onClick?: () => void;
  icon: ReactNode;
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'default';
  disabled?: boolean;
}

export const ContentHeaderButton = (props: ContentHeaderButtonProps) => {
  const { to, onClick, icon, children, color = 'primary', disabled } = props;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const commonProps = {
    size: 'small' as const,
    variant: 'contained' as const,
    color,
    startIcon: isSmallScreen ? undefined : icon,
    style: {
      minWidth: isSmallScreen ? '0' : undefined,
      padding: isSmallScreen ? '6px' : undefined,
    },
    disabled,
  };

  if (to) {
    return (
      <LinkButton {...commonProps} to={to}>
        {isSmallScreen ? icon : children}
      </LinkButton>
    );
  }

  return (
    <Button {...commonProps} onClick={onClick}>
      {isSmallScreen ? icon : children}
    </Button>
  );
};
