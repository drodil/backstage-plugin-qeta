import {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react';
import styles from './Chip.module.css';

export interface ChipProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'onClick' | 'className' | 'style' | 'children'
> {
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
 *
 * Forwards its ref and spreads any extra DOM props (e.g. `onFocus`, `onBlur`,
 * `onPointerEnter`/`onPointerLeave`, `tabIndex`, `aria-describedby`) onto its
 * root element so it can be used as the direct child of BUI's `<Focusable>`
 * (required for `TooltipTrigger` hover/focus interactions to work).
 */
export const Chip = forwardRef(
  (props: ChipProps, ref: ForwardedRef<HTMLElement>) => {
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
      onKeyDown,
      ...rest
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

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (isDisabled || href || event.defaultPrevented) {
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
          {...rest}
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          className={classNames}
          style={style}
          href={href}
          target={target}
          aria-disabled={isDisabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          {content}
        </a>
      );
    }

    if (onPress || onClick) {
      return (
        <button
          {...rest}
          ref={ref as ForwardedRef<HTMLButtonElement>}
          className={classNames}
          style={style}
          tabIndex={isDisabled ? -1 : 0}
          aria-disabled={isDisabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          {content}
        </button>
      );
    }

    return (
      <span
        {...rest}
        ref={ref as ForwardedRef<HTMLSpanElement>}
        className={classNames}
        style={style}
      >
        {content}
      </span>
    );
  },
);

Chip.displayName = 'Chip';
