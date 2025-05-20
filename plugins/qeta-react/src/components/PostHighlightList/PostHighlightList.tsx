import { Fragment, ReactNode } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, questionRouteRef } from '../../routes';
import { PostsQuery, PostType } from '@drodil/backstage-plugin-qeta-common';
import { useQetaApi } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { RightList, RightListContainer } from '../Utility/RightList';
import { Divider, ListItem, ListItemText } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const PostHighlightList = (props: {
  type: string;
  title: string;
  noQuestionsLabel: string;
  icon?: ReactNode;
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
        includeTags: false,
        includeAttachments: false,
        includeComments: false,
        includeAnswers: false,
        includeVotes: false,
        includeEntities: false,
        ...props.options,
      }),
    [],
  );
  const { t } = useTranslationRef(qetaTranslationRef);
  const navigate = useNavigate();
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);

  const posts = response?.posts ?? [];

  return (
    <RightListContainer>
      <RightList title={props.title} icon={props.icon}>
        {loading && (
          <ListItem className="qetaPostHighlightListListItem" dense>
            <Skeleton variant="rect" width="100%" />
          </ListItem>
        )}
        {error && (
          <ListItem className="qetaPostHighlightListListItem" dense>
            <ListItemText>{t('highlights.loadError')}</ListItemText>
          </ListItem>
        )}
        {!error && !loading && posts.length === 0 && (
          <ListItem className="qetaPostHighlightListListItem" dense>
            <ListItemText>{props.noQuestionsLabel}</ListItemText>
          </ListItem>
        )}
        {!error &&
          posts.map(q => {
            const route = q.type === 'question' ? questionRoute : articleRoute;
            return (
              <Fragment key={q.id}>
                <Divider />
                <ListItem
                  dense
                  button
                  component="a"
                  onClick={() => navigate(route({ id: q.id.toString(10) }))}
                >
                  <ListItemText>{q.title}</ListItemText>
                </ListItem>
              </Fragment>
            );
          })}
      </RightList>
    </RightListContainer>
  );
};
