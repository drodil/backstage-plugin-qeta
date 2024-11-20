import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, questionRouteRef } from '../../routes';
import { PostsQuery, PostType } from '@drodil/backstage-plugin-qeta-common';
import { useQetaApi, useTranslation } from '../../hooks';
import ListItemButton from '@mui/material/ListItemButton';
import { useNavigate } from 'react-router-dom';
import { RightList, RightListContainer } from '../Styled/RightList';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);

  const posts = response?.posts ?? [];

  return (
    <RightListContainer>
      <RightList title={props.title} icon={props.icon}>
        {loading && (
          <ListItem className="qetaPostHighlightListListItem" dense>
            <Skeleton variant="rectangular" />
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
                <ListItemButton
                  dense
                  component="a"
                  onClick={() => navigate(route({ id: q.id.toString(10) }))}
                >
                  <ListItemText>{q.title}</ListItemText>
                </ListItemButton>
              </React.Fragment>
            );
          })}
      </RightList>
    </RightListContainer>
  );
};
