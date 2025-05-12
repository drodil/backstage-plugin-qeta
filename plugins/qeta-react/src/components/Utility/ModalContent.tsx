import { makeStyles } from '@material-ui/core';
import { ReactNode, forwardRef } from 'react';

const useStyles = makeStyles(theme => ({
  content: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.action.selected}`,
    borderRadius: theme.shape.borderRadius,
    padding: '2em',
    '& button': {
      marginTop: '2em',
      float: 'right',
    },
  },
}));

export const ModalContent = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>((props: { children: ReactNode }, ref) => {
  const styles = useStyles();
  return (
    <div tabIndex={-1} className={styles.content} ref={ref}>
      {props.children}
    </div>
  );
});
