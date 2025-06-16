import { Avatar, AvatarProps, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    display: 'inline-flex !important',
    marginRight: '0.25rem',
    maxWidth: '1rem',
    maxHeight: '1rem',
  },
}));

export const SmallAvatar = (props: AvatarProps) => {
  const styles = useStyles();
  return (
    <Avatar className={styles.root} {...props}>
      {props.children}
    </Avatar>
  );
};
