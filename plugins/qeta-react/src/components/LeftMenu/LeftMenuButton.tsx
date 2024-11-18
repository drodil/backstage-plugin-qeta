import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import Grow from '@mui/material/Grow';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import React from 'react';
import { LeftMenu } from './LeftMenu';
import MenuIcon from '@mui/icons-material/Menu';

export const LeftMenuButton = () => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (
    event: MouseEvent | TouchEvent | React.MouseEvent<EventTarget>,
  ) => {
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
        variant="contained"
        onClick={handleToggle}
        startIcon={<MenuIcon />}
        style={{ marginBottom: '0.5rem' }}
      >
        Menu
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        disablePortal
        style={{ zIndex: 1000 }}
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
