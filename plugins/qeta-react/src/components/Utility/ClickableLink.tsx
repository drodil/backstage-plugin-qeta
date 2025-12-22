import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ClickableLinkProps {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
}

export const ClickableLink = (props: ClickableLinkProps) => {
  const { href, children, ariaLabel } = props;
  const navigate = useNavigate();

  return (
    <a
      href={href}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        navigate(href);
      }}
      aria-label={ariaLabel}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        cursor: 'pointer',
      }}
    >
      {children}
    </a>
  );
};
