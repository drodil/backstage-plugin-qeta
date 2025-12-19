import { useEffect, useState } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  articlesRouteRef,
  collectionsRouteRef,
  entitiesRouteRef,
  entityRouteRef,
  favoriteQuestionsRouteRef,
  linksRouteRef,
  qetaRouteRef,
  questionsRouteRef,
  tagRouteRef,
  tagsRouteRef,
  userRouteRef,
  usersRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import { Grid } from '@material-ui/core';
import { matchPath, useLocation, useSearchParams } from 'react-router-dom';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { HomeRightContent } from './HomeRightContent';
import { QuestionsRightContent } from './QuestionsRightContent';
import { ArticlesRightContent } from './ArticlesRightContent';
import { LinksRightContent } from './LinksRightContent';
import { FavoriteRightContent } from './FavoriteRightContent';
import { UsersRightContent } from './UsersRightContent';
import { TagRightContent } from './TagRightContent';
import { TagsRightContent } from './TagsRightContent';
import { EntitiesRightContent } from './EntitiesRightContent';
import { EntityRightContent } from './EntityRightContent';
import { CollectionsRightContent } from './CollectionsRightContent';

export const RightContent = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Route Refs
  const questionsPath = useRouteRef(questionsRouteRef);
  const articlesPath = useRouteRef(articlesRouteRef);
  const usersPath = useRouteRef(usersRouteRef);
  const tagsPath = useRouteRef(tagsRouteRef);
  const linksPath = useRouteRef(linksRouteRef);
  const collectionsPath = useRouteRef(collectionsRouteRef);
  const entitiesPath = useRouteRef(entitiesRouteRef);
  const favoritePath = useRouteRef(favoriteQuestionsRouteRef);
  const homePath = useRouteRef(qetaRouteRef);
  // qetaRouteRef gives the base path of the plugin, e.g. /qeta
  const rootPath = homePath();

  // Matchers
  const isQuestions = matchPath(
    { path: questionsPath(), end: true },
    location.pathname,
  );
  const isArticles = matchPath(
    { path: articlesPath(), end: true },
    location.pathname,
  );
  const isUsers = matchPath(
    { path: usersPath(), end: true },
    location.pathname,
  );
  const userMatch = matchPath(
    { path: `${rootPath}${userRouteRef.path}` },
    location.pathname,
  );
  const isTags = matchPath({ path: tagsPath(), end: true }, location.pathname);
  const tagMatch = matchPath(
    { path: `${rootPath}${tagRouteRef.path}` },
    location.pathname,
  );
  const isCollections = matchPath(
    { path: collectionsPath(), end: true },
    location.pathname,
  );
  const isEntities = matchPath(
    { path: entitiesPath(), end: true },
    location.pathname,
  );
  const entityMatch = matchPath(
    { path: `${rootPath}${entityRouteRef.path}` },
    location.pathname,
  );
  const isLinks = matchPath(
    { path: linksPath(), end: true },
    location.pathname,
  );
  const isFavorite = matchPath(
    { path: favoritePath(), end: true },
    location.pathname,
  );
  // Home is tricky because it's root, checking others first might be safer or check exact root
  const isHome =
    matchPath({ path: homePath(), end: true }, location.pathname) ||
    location.pathname === homePath();

  const [entityRef, setEntityRef] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[] | undefined>(undefined);
  const [userRef, setUserRef] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isQuestions || isArticles || isLinks) {
      setEntityRef(searchParams.get('entity') ?? undefined);
      setTags(filterTags(searchParams.get('tags')));
      setUserRef(undefined);
    } else if (tagMatch) {
      if (tagMatch.params.tag) {
        setTags([tagMatch.params.tag]);
      }
      setEntityRef(undefined);
      setUserRef(undefined);
    } else if (userMatch) {
      if (userMatch.params['*']) {
        setUserRef(userMatch.params['*']);
      }
      setTags(undefined);
      setEntityRef(undefined);
    } else if (entityMatch) {
      if (entityMatch.params.entityRef) {
        setEntityRef(entityMatch.params.entityRef);
      }
      setTags(undefined);
      setUserRef(undefined);
    } else {
      setTags(undefined);
      setEntityRef(undefined);
      setUserRef(undefined);
    }
  }, [
    searchParams,
    isQuestions,
    isArticles,
    isLinks,
    tagMatch,
    userMatch,
    entityMatch,
    location.pathname,
  ]);

  let content = null;

  if (isHome) {
    content = <HomeRightContent />;
  } else if (isQuestions) {
    content = <QuestionsRightContent tags={tags} entityRef={entityRef} />;
  } else if (isArticles) {
    content = <ArticlesRightContent tags={tags} entityRef={entityRef} />;
  } else if (isLinks) {
    content = <LinksRightContent tags={tags} entityRef={entityRef} />;
  } else if (isFavorite) {
    content = <FavoriteRightContent />;
  } else if (isUsers) {
    content = <UsersRightContent />;
  } else if (tagMatch) {
    content = <TagRightContent tags={tags} />;
  } else if (userMatch && userRef) {
    content = null;
  } else if (isTags) {
    content = <TagsRightContent />;
  } else if (isEntities) {
    content = <EntitiesRightContent />;
  } else if (entityMatch && entityRef) {
    content = <EntityRightContent entityRef={entityRef} />;
  } else if (isCollections) {
    content = <CollectionsRightContent />;
  }

  if (!content) {
    return null;
  }

  return (
    <Grid item lg={3} xl={2}>
      {content}
    </Grid>
  );
};
