import { ReactNode, useState, Children, useMemo } from 'react';
import { Box, Button, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/react';
import styles from './RightList.module.css';

export const RightListContainer = (props: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <Box
      className={`${styles.container} ${styles.desktopOnly} ${props.className ?? ''}`}
    >
      {props.children}
    </Box>
  );
};

export const RightList = (props: {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  limit?: number;
  randomize?: boolean;
  titleClassName?: string;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const [expanded, setExpanded] = useState(false);
  const arrayChildren = useMemo(() => {
    const children = Children.toArray(props.children);
    if (props.randomize && props.limit && children.length > props.limit) {
      return children.sort(() => 0.5 - Math.random());
    }
    return children;
  }, [props.children, props.randomize, props.limit]);
  const showButton = props.limit && arrayChildren.length > props.limit;
  const displayChildren =
    showButton && !expanded
      ? arrayChildren.slice(0, props.limit)
      : arrayChildren;

  return (
    <Box className={styles.list}>
      <nav aria-labelledby="nested-list-subheader">
        <div
          id="nested-list-subheader"
          className={`${styles.subheader} ${props.titleClassName ?? ''}`}
        >
          {props.icon}
          <Text variant="body-small" color="secondary">
            {props.title}
          </Text>
        </div>
        <div className={styles.items}>{displayChildren}</div>
        {showButton && (
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="tertiary"
            className={styles.showMoreButton}
          >
            {expanded ? t('common.showLess') : t('common.showMore')}
            <span className={styles.showMoreIcon} aria-hidden="true">
              {expanded ? (
                <RiArrowUpSLine size={16} />
              ) : (
                <RiArrowDownSLine size={16} />
              )}
            </span>
          </Button>
        )}
      </nav>
    </Box>
  );
};
