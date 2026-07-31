import {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react';
import styles from './Chip.module.css';

export interface ChipProps {
  children: ReactNode;
  icon?: ReactElement;
  size?: 'small' | 'medium';
  href?: string;
  target?: string;
  onPress?: () => void;
  onClick?: (event: MouseEvent) => void;
  className?: string;
  style?: CSSProperties;
  isDisabled?: boolean;
}

/**
 * Standalone pill/tag-styled component matching BUI `Tag`'s visuals, safe to
 * render without a `TagGroup`/`TagList` collection ancestor.
 */
export const Chip = (props: ChipProps) => {
  const {
    children,
    icon,
    size = 'small',
    href,
    target,
    onPress,
    onClick,
    className,
    style,
    isDisabled,
  } = props;

  const isInteractive = !isDisabled && Boolean(href || onPress || onClick);
  const classNames = [
    styles.chip,
    size === 'medium' ? styles.medium : styles.small,
    isInteractive && styles.interactive,
    isDisabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </>
  );

  const handleClick = (event: MouseEvent) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    onPress?.();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isDisabled || href) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPress?.();
    }
  };

  if (href) {
    return (
      <a
        className={classNames}
        style={style}
        href={href}
        target={target}
        aria-disabled={isDisabled}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  if (onPress || onClick) {
    return (
      <div
        className={classNames}
        style={style}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {content}
      </div>
    );
  }

  return (
    <span className={classNames} style={style}>
      {content}
    </span>
  );
};
