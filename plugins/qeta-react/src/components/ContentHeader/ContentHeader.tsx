import { ReactNode } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { ButtonContainer } from '../Buttons';

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  title: {
    fontWeight: 700,
    marginBottom: 0,
  },
  titleIcon: {
    marginRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
  description: {
    color: theme.palette.text.secondary,
  },
}));

export interface ContentHeaderProps {
  title?: ReactNode;
  titleIcon?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  titleComponent?: ReactNode;
}

export const ContentHeader = (props: ContentHeaderProps) => {
  const { title, titleIcon, description, children, titleComponent } = props;
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box flex="1 1 auto" mr={2}>
        <Box display="flex" alignItems="center" mb={1}>
          {titleComponent ? (
            <>{titleComponent}</>
          ) : (
            <>
              {titleIcon && (
                <Box className={classes.titleIcon}>{titleIcon}</Box>
              )}
              {title && (
                <Typography
                  variant="h4"
                  component="h1"
                  className={classes.title}
                >
                  {title}
                </Typography>
              )}
            </>
          )}
        </Box>
        <Typography
          variant="body2"
          className={classes.description}
          component="div"
        >
          {description}
        </Typography>
      </Box>
      <Box flex="0 0 auto">
        <ButtonContainer>{children}</ButtonContainer>
      </Box>
    </Box>
  );
};
