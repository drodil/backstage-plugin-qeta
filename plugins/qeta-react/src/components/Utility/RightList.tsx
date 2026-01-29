import { ReactNode, useState, Children, useMemo } from 'react';
import {
  Box,
  Button,
  List,
  ListSubheader,
  makeStyles,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    marginBottom: '1em',
  },
  subheader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.hint,
    padding: '0px 0px 0.5rem 0.5rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.5,
  },
  list: {
    '& li': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  showMoreButton: {
    marginLeft: theme.spacing(1),
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    fontSize: '0.8rem',
  },
}));

export const RightListContainer = (props: {
  children: ReactNode;
  className?: string;
}) => {
  const styles = useStyles();
  return (
    <Box
      display={{ md: 'none', lg: 'block' }}
      className={`${styles.container} ${props.className ?? ''}`}
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
  const styles = useStyles();
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
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      className={styles.list}
      subheader={
        <ListSubheader
          disableSticky
          component="div"
          id="nested-list-subheader"
          color="primary"
          className={`${styles.subheader} ${props.titleClassName ?? ''}`}
        >
          {props.icon}
          {props.title}
        </ListSubheader>
      }
    >
      {displayChildren}
      {showButton && (
        <Button
          onClick={() => setExpanded(!expanded)}
          color="primary"
          size="small"
          className={styles.showMoreButton}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
        >
          {expanded ? t('common.showLess') : t('common.showMore')}
        </Button>
      )}
    </List>
  );
};
