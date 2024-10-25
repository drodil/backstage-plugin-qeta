import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(
  theme => {
    return {
      questionDivider: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
      },
      questionCard: {
        marginBottom: theme.spacing(1),
        position: 'relative',
      },
      questionCardVote: {
        textAlign: 'center',
        width: '32px',
        marginRight: '20px',
        marginLeft: '5px',
        display: 'inline-block',
        verticalAlign: 'top',
      },
      questionCardContent: {
        minHeight: '160px',
      },
      questionListItem: {
        padding: '0.7rem',
        paddingBottom: '1.4rem',
      },
      questionListItemStats: {
        width: '70px',
        textAlign: 'right',
        marginRight: '5px',
        display: 'inline-block',
        verticalAlign: 'top',
      },
      questionListItemContent: {
        display: 'inline-block',
        width: 'calc(100% - 80px)',
      },
      questionListItemAuthor: {
        display: 'inline',
        float: 'right',
      },
      questionListItemAvatar: {
        display: 'inline-flex !important',
        marginRight: '0.25rem',
        fontSize: '1rem',
        maxWidth: '1rem',
        maxHeight: '1rem',
      },
      answerCardContent: {
        display: 'inline-block',
        width: 'calc(100% - 70px)',
      },
      questionListPagination: {
        marginTop: theme.spacing(2),
      },
      questionsPerPageInput: {
        paddingTop: '10px',
      },
      questionsPerPage: {
        marginRight: theme.spacing(3),
      },
      postHighlightListContainer: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.action.selected}`,
        borderRadius: theme.shape.borderRadius,
        '&:not(:first-child)': {
          marginTop: theme.spacing(2),
        },
      },
      postHighlightList: {
        paddingBottom: '0px',
        '& p': {
          marginTop: '0',
          marginBottom: '0',
        },
      },
      filterPanel: {
        border: `1px solid ${theme.palette.action.selected}`,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(3),
      },
      questionCardMetadata: {
        marginTop: theme.spacing(3),
      },
      marginRight: {
        marginRight: theme.spacing(1),
      },
      marginLeft: {
        marginLeft: theme.spacing(1),
      },
      questionCardActions: {
        marginTop: theme.spacing(2),
        '& a': {
          marginRight: theme.spacing(1),
        },
      },
      noPadding: {
        padding: `0 !important`,
      },
      deleteModal: {
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        backgroundColor: theme.palette.background.default,
        border: `1px solid ${theme.palette.action.selected}`,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
        '& button': {
          marginTop: theme.spacing(2),
          float: 'right',
        },
      },
      highlight: {
        animation: '$highlight 2s',
      },
      '@keyframes highlight': {
        '0%': {
          boxShadow: `0px 0px 0px 3px ${theme.palette.secondary.light}`,
        },
        '100%': {
          boxShadow: 'none',
        },
      },
      dateFilter: {
        minWidth: '200px',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
      },
    };
  },
  { name: 'Qeta' },
);
