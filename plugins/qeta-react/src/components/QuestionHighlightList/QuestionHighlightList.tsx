import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
} from '@material-ui/core';
import React from 'react';
import { useQetaApi, useStyles, useTranslation } from '../../utils/hooks';
import { Skeleton } from '@material-ui/lab';
import { useRouteRef } from '@backstage/core-plugin-api';
import { questionRouteRef } from '../../routes';
import { GetQuestionsOptions } from '@drodil/backstage-plugin-qeta-common';

export const QuestionHighlightList = (props: {
  type: string;
  title: string;
  noQuestionsLabel: string;
  icon?: React.ReactNode;
  options?: GetQuestionsOptions;
}) => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api => api.getPostsList(props.type, { limit: 5, ...props.options }),
    [],
  );
  const classes = useStyles();
  const { t } = useTranslation();
  const questionRoute = useRouteRef(questionRouteRef);

  const posts = response?.posts ?? [];

  return (
    <Box
      className={`qetaQuestionHighlightList ${classes.questionHighlightListContainer}`}
      display={{ md: 'none', lg: 'block' }}
    >
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        className={`qetaQuestionHighlightListList ${classes.questionHighlightList}`}
        subheader={
          <ListSubheader
            disableSticky
            component="p"
            id="nested-list-subheader"
            color="primary"
          >
            {props.title}
            {props.icon}
          </ListSubheader>
        }
      >
        {loading && (
          <ListItem className="qetaQuestionHighlightListListItem" dense>
            <Skeleton variant="rect" />
          </ListItem>
        )}
        {error && (
          <ListItem className="qetaQuestionHighlightListListItem" dense>
            <ListItemText>{t('highlights.loadError')}</ListItemText>
          </ListItem>
        )}
        {!error && posts.length === 0 && (
          <ListItem className="qetaQuestionHighlightListListItem" dense>
            <ListItemText>{props.noQuestionsLabel}</ListItemText>
          </ListItem>
        )}
        {!error &&
          posts.map(q => (
            <React.Fragment key={q.id}>
              <Divider />
              <ListItem
                className="qetaQuestionHighlightListListItem"
                button
                dense
                component="a"
                href={questionRoute({ id: q.id.toString(10) })}
              >
                <ListItemText>{q.title}</ListItemText>
              </ListItem>
            </React.Fragment>
          ))}
      </List>
    </Box>
  );
};
