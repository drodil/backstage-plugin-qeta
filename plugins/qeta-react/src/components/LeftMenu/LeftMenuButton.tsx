import {
  Button,
  ClickAwayListener,
  Grow,
  makeStyles,
  Paper,
  Popper,
} from '@material-ui/core';
import { MouseEvent, KeyboardEvent, useState, useRef, useEffect } from 'react';
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
  const [open, setOpen] = useState(false);
  const styles = useStyles();
  const { t } = useTranslation();
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: MouseEvent<EventTarget>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
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
