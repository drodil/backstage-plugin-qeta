import {
  Button,
  ClickAwayListener,
  Grow,
  makeStyles,
  Paper,
  Popper,
} from '@material-ui/core';
import React from 'react';
import { LeftMenu } from './LeftMenu';
import MenuIcon from '@material-ui/icons/Menu';
import { useTranslation } from '../../hooks';

const useStyles = makeStyles(
  () => ({
    button: {
      marginTop: '1em',
      marginBottom: '-1em',
    },
    popper: {
      zIndex: 1000,
    },
  }),
  { name: 'QetaLeftMenuButton' },
);

export const LeftMenuButton = () => {
  const [open, setOpen] = React.useState(false);
  const styles = useStyles();
  const { t } = useTranslation();
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current && !open) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <div>
      <Button
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        color="primary"
        size="large"
        variant="contained"
        onClick={handleToggle}
        startIcon={<MenuIcon />}
        className={styles.button}
      >
        {t('leftMenu.buttonLabel')}
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        disablePortal
        className={styles.popper}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'left top' : 'left bottom',
            }}
          >
            <ClickAwayListener onClickAway={handleClose}>
              <Paper>
                <LeftMenu
                  onKeyDown={handleListKeyDown}
                  autoFocusItem={open}
                  onClick={handleClose}
                  inPopup
                />
              </Paper>
            </ClickAwayListener>
          </Grow>
        )}
      </Popper>
    </div>
  );
};
