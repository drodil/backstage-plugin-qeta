import { ReactNode, forwardRef } from 'react';
import styles from './ModalContent.module.css';

export const ModalContent = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>((props: { children: ReactNode }, ref) => {
  return (
    <div tabIndex={-1} className={styles.content} ref={ref}>
      {props.children}
    </div>
  );
});
