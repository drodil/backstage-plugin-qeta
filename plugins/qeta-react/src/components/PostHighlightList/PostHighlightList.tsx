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
import { articleRouteRef, questionRouteRef } from '../../routes';
import { PostsQuery, PostType } from '@drodil/backstage-plugin-qeta-common';

export const PostHighlightList = (props: {
  type: string;
  title: string;
  noQuestionsLabel: string;
  icon?: React.ReactNode;
  options?: PostsQuery;
  postType?: PostType;
}) => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api =>
      api.getPostsList(props.type, {
        limit: 5,
        type: props.postType,
        ...props.options,
      }),
    [],
  );
  const classes = useStyles();
  const { t } = useTranslation();
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);

  const posts = response?.posts ?? [];

  return (
    <Box
      className={`qetaPostHighlightList ${classes.postHighlightListContainer}`}
      display={{ md: 'none', lg: 'block' }}
    >
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        className={`qetaPostHighlightListList ${classes.postHighlightList}`}
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
          <ListItem className="qetaPostHighlightListListItem" dense>
            <Skeleton variant="rect" />
          </ListItem>
        )}
        {error && (
          <ListItem className="qetaPostHighlightListListItem" dense>
            <ListItemText>{t('highlights.loadError')}</ListItemText>
          </ListItem>
        )}
        {!error && posts.length === 0 && (
          <ListItem className="qetaPostHighlightListListItem" dense>
            <ListItemText>{props.noQuestionsLabel}</ListItemText>
          </ListItem>
        )}
        {!error &&
          posts.map(q => {
            const route = q.type === 'question' ? questionRoute : articleRoute;
            return (
              <React.Fragment key={q.id}>
                <Divider />
                <ListItem
                  className="qetaPostHighlightListListItem"
                  button
                  dense
                  component="a"
                  href={route({ id: q.id.toString(10) })}
                >
                  <ListItemText>{q.title}</ListItemText>
                </ListItem>
              </React.Fragment>
            );
          })}
      </List>
    </Box>
  );
};
