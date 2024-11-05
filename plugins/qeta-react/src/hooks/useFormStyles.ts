import makeStyles from '@mui/styles/makeStyles';

export type QetaFormClassKey = 'headerImage' | 'postButton' | 'postForm';

export const useFormStyles = makeStyles(
  theme => {
    return {
      headerImage: {
        marginBottom: '1rem',
        marginTop: '1rem',
        height: '250px',
        objectFit: 'cover',
        width: '100%',
        border: `1px solid ${theme.palette.background.paper}`,
        boxShadow: theme.shadows[1],
      },
      postButton: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
      form: {},
    };
  },
  { name: 'QetaForm' },
);
