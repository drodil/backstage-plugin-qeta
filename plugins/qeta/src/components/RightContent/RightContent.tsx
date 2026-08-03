import { useEffect, useState } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { AskRightContent } from './AskRightContent';
import {
  articleRouteRef,
  articlesRouteRef,
  askRouteRef,
  collectionsRouteRef,
  editQuestionRouteRef,
  entitiesRouteRef,
  entityRouteRef,
  favoriteQuestionsRouteRef,
  linkRouteRef,
  linksRouteRef,
  qetaRouteRef,
  qetaTranslationRef,
  questionRouteRef,
  questionsRouteRef,
  tagRouteRef,
  tagsRouteRef,
  userRouteRef,
  useQetaConfig,
  usersRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import {
  Box,
  ButtonIcon,
  Flex,
  Tooltip,
  TooltipTrigger,
  useBreakpoint,
} from '@backstage/ui';
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
import { RiMenuFoldLine, RiMenuUnfoldLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { DefaultRightContent } from './DefaultRightContent';
import { PostRightContent } from './PostRightContent';
import styles from './RightContent.module.css';

export const RightContent = (props: {
  compact?: boolean;
  onToggle?: () => void;
}) => {
  const { compact = false, onToggle } = props;
  const { disabled } = useQetaConfig();
  const { down } = useBreakpoint();
  const isSmall = down('md');
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useTranslationRef(qetaTranslationRef);

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
  const isQuestions = !!matchPath(
    { path: questionsPath(), end: true },
    location.pathname,
  );
  const isAsk = !!(
    matchPath(
      { path: `${rootPath}${askRouteRef.path}`, end: true },
      location.pathname,
    ) ||
    matchPath(
      { path: `${rootPath}${editQuestionRouteRef.path}`, end: true },
      location.pathname,
    )
  );

  const isArticles = !!matchPath(
    { path: articlesPath(), end: true },
    location.pathname,
  );
  const isUsers = !!matchPath(
    { path: usersPath(), end: true },
    location.pathname,
  );
  const userMatch = matchPath(
    { path: `${rootPath}${userRouteRef.path}` },
    location.pathname,
  );
  const isTags = !!matchPath(
    { path: tagsPath(), end: true },
    location.pathname,
  );
  const tagMatch = matchPath(
    { path: `${rootPath}${tagRouteRef.path}` },
    location.pathname,
  );
  const isCollections = !!matchPath(
    { path: collectionsPath(), end: true },
    location.pathname,
  );
  const isEntities = !!matchPath(
    { path: entitiesPath(), end: true },
    location.pathname,
  );
  const entityMatch = matchPath(
    { path: `${rootPath}${entityRouteRef.path}` },
    location.pathname,
  );
  const isLinks = !!matchPath(
    { path: linksPath(), end: true },
    location.pathname,
  );
  const isFavorite = !!matchPath(
    { path: favoritePath(), end: true },
    location.pathname,
  );
  const questionMatch = matchPath(
    { path: `${rootPath}${questionRouteRef.path}` },
    location.pathname,
  );
  const articleMatch = matchPath(
    { path: `${rootPath}${articleRouteRef.path}` },
    location.pathname,
  );
  const linkMatch = matchPath(
    { path: `${rootPath}${linkRouteRef.path}` },
    location.pathname,
  );
  const isPostPage = !!(questionMatch || articleMatch || linkMatch);
  const isHome = !!(
    matchPath({ path: homePath(), end: true }, location.pathname) ||
    location.pathname === homePath()
  );

  const [entityRef, setEntityRef] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[] | undefined>(undefined);
  const [userRef, setUserRef] = useState<string | undefined>(undefined);

  const tagParam = tagMatch?.params.tag;
  const userParam = userMatch?.params['*'];
  const entityParam = entityMatch?.params.entityRef;

  const entitySearchParam = searchParams.get('entity') ?? undefined;
  const tagsSearchParam = searchParams.get('tags');

  useEffect(() => {
    if (isQuestions || isArticles || isLinks) {
      setEntityRef(entitySearchParam);
      setTags(filterTags(tagsSearchParam));
      setUserRef(undefined);
    } else if (tagParam) {
      setTags([tagParam]);
      setEntityRef(undefined);
      setUserRef(undefined);
    } else if (userParam) {
      setUserRef(userParam);
      setTags(undefined);
      setEntityRef(undefined);
    } else if (entityParam) {
      setEntityRef(entityParam);
      setTags(undefined);
      setUserRef(undefined);
    } else {
      setTags(undefined);
      setEntityRef(undefined);
      setUserRef(undefined);
    }
  }, [
    entitySearchParam,
    tagsSearchParam,
    isQuestions,
    isArticles,
    isLinks,
    tagParam,
    userParam,
    entityParam,
    location.pathname,
  ]);

  let content = null;

  if (isHome) {
    content = <HomeRightContent />;
  } else if (isAsk) {
    content = <AskRightContent />;
  } else if (isPostPage) {
    const id =
      questionMatch?.params.id ||
      articleMatch?.params.id ||
      linkMatch?.params.id;
    content = <PostRightContent id={id} />;
  } else if (isQuestions && !disabled.questions) {
    content = <QuestionsRightContent tags={tags} entityRef={entityRef} />;
  } else if (isArticles && !disabled.articles) {
    content = <ArticlesRightContent tags={tags} entityRef={entityRef} />;
  } else if (isLinks && !disabled.links) {
    content = <LinksRightContent tags={tags} entityRef={entityRef} />;
  } else if (isFavorite) {
    content = <FavoriteRightContent />;
  } else if (isUsers) {
    content = <UsersRightContent />;
  } else if (tagMatch && !disabled.tags) {
    content = <TagRightContent tags={tags} />;
  } else if (userMatch && userRef) {
    content = null;
  } else if (isTags && !disabled.tags) {
    content = <TagsRightContent />;
  } else if (isEntities && !disabled.entities) {
    content = <EntitiesRightContent />;
  } else if (entityMatch && entityRef && !disabled.entities) {
    content = <EntityRightContent entityRef={entityRef} />;
  } else if (isCollections && !disabled.collections) {
    content = <CollectionsRightContent />;
  }

  if (!content) {
    content = <DefaultRightContent />;
  }

  return (
    <Box
      className={[
        styles.container,
        compact ? styles.compact : '',
        isSmall ? styles.full : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Box
        className={`${styles.content} ${compact ? styles.contentHidden : ''}`}
      >
        {content}
      </Box>
      <Flex justify={compact ? 'center' : 'end'} style={{ marginTop: 'auto' }}>
        <TooltipTrigger>
          <ButtonIcon
            aria-label={
              compact ? t('rightMenu.expand') : t('rightMenu.collapse')
            }
            size="small"
            variant="tertiary"
            className={compact ? '' : styles.toggleButton}
            onPress={onToggle}
            icon={
              compact ? (
                <RiMenuUnfoldLine size={16} />
              ) : (
                <RiMenuFoldLine size={16} />
              )
            }
          />
          <Tooltip placement="left">
            {compact ? t('rightMenu.expand') : t('rightMenu.collapse')}
          </Tooltip>
        </TooltipTrigger>
      </Flex>
    </Box>
  );
};
