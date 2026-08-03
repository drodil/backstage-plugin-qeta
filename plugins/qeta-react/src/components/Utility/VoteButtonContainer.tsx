import { ReactNode } from 'react';
import styles from './VoteButtonContainer.module.css';

export const VoteButtonContainer = (props: { children: ReactNode }) => {
  return <div className={styles.root}>{props.children}</div>;
};
