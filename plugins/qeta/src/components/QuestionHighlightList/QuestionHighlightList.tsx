import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
} from '@material-ui/core';
import React from 'react';
import { useQetaApi, useStyles } from '../../utils/hooks';
import { Skeleton } from '@material-ui/lab';

export const QuestionHighlightList = (props: {
  type: string;
  title: string;
  noQuestionsLabel: string;
  icon?: JSX.Element;
}) => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getQuestionsList(props.type), []);
  const classes = useStyles();

  const questions = response?.questions ?? [];

  return (
    <Box
      className={`qetaQuestionHighlightList ${classes.questionHighlightList}`}
      display={{ md: 'none', lg: 'block' }}
    >
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        className="qetaQuestionHighlightListList"
        subheader={
          <ListSubheader
            component="div"
            id="nested-list-subheader"
            color="primary"
          >
            {props.title}
            {props.icon}
          </ListSubheader>
        }
      >
        {loading && (
          <ListItem>
            <Skeleton variant="rect" />
          </ListItem>
        )}
        {error && (
          <ListItem>
            <ListItemText>Failed to load questions</ListItemText>
          </ListItem>
        )}
        {!error && questions.length === 0 && (
          <ListItem>
            <ListItemText>{props.noQuestionsLabel}</ListItemText>
          </ListItem>
        )}
        {!error &&
          questions.map(q => (
            <React.Fragment key={q.id}>
              <Divider />
              <ListItem
                className="qetaQuestionHighlightListListItem"
                button
                dense
                component="a"
                href={`/qeta/questions/${q.id}`}
              >
                <ListItemText>{q.title}</ListItemText>
              </ListItem>
            </React.Fragment>
          ))}
      </List>
    </Box>
  );
};
