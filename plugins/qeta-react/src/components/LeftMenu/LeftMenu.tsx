import { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import { useApp, useRouteRef } from '@backstage/core-plugin-api';
import { Link as RouterLink } from 'react-router-dom';
import { useLocation } from 'react-use';
import {
  ButtonIcon,
  List,
  ListRow,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  RiArrowRightSLine,
  RiBook2Line,
  RiFileEditLine,
  RiGroupLine,
  RiHammerLine,
  RiHomeLine,
  RiLinksLine,
  RiMenuFoldLine,
  RiPlayListLine,
  RiPriceTag3Line,
  RiQuestionLine,
  RiSettingsLine,
  RiShapesLine,
  RiStarLine,
  RiTrophyLine,
  RiUserLine,
} from '@remixicon/react';

import {
  articlesRouteRef,
  collectionsRouteRef,
  entitiesRouteRef,
  favoriteQuestionsRouteRef,
  linksRouteRef,
  moderatorRouteRef,
  qetaRouteRef,
  questionsRouteRef,
  reviewRouteRef,
  settingsRouteRef,
  statisticsRouteRef,
  tagsRouteRef,
  userRouteRef,
  usersRouteRef,
} from '../../routes';
import {
  useCanReview,
  useIdentityApi,
  useIsModerator,
  useQetaConfig,
} from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import styles from './LeftMenu.module.css';

export const LeftMenu = (props: {
  onKeyDown?: (event: KeyboardEvent) => void;
  autoFocusItem?: boolean;
  onClick?: (event: MouseEvent<EventTarget>) => void;
  inPopup?: boolean;
  compact?: boolean;
  onToggle?: () => void;
}) => {
  const rootRoute = useRouteRef(qetaRouteRef);
  const tagsRoute = useRouteRef(tagsRouteRef);
  const favoritesRoute = useRouteRef(favoriteQuestionsRouteRef);
  const statisticsRoute = useRouteRef(statisticsRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const questionsRoute = useRouteRef(questionsRouteRef);
  const articlesRoute = useRouteRef(articlesRouteRef);
  const linksRoute = useRouteRef(linksRouteRef);
  const collectionsRoute = useRouteRef(collectionsRouteRef);
  const entitiesRoute = useRouteRef(entitiesRouteRef);
  const usersRoute = useRouteRef(usersRouteRef);
  const moderatorRoute = useRouteRef(moderatorRouteRef);
  const reviewRoute = useRouteRef(reviewRouteRef);
  const settingsRoute = useRouteRef(settingsRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const location = useLocation();
  const { isModerator } = useIsModerator();
  const { canReview } = useCanReview();
  const { disabled } = useQetaConfig();
  const app = useApp();
  const { compact = false, onToggle } = props;
  const {
    value: user,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  const EntityIcon = app.getSystemIcon('kind:system');

  const CustomMenuItem = ({
    route,
    hasSubRoutes,
    icon,
    label,
  }: {
    route: string;
    hasSubRoutes?: boolean;
    icon: ReactElement;
    label: string;
  }) => {
    const isSelected =
      route === location.pathname ||
      (hasSubRoutes && location.pathname?.startsWith(route));

    const link = (
      <RouterLink
        to={route}
        onClick={e => {
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
            return;
          }
          props.onClick?.(e);
        }}
        className={`${styles.menuItemLink} ${
          compact ? styles.menuItemLinkCompact : ''
        } ${isSelected ? styles.selectedMenuItem : ''}`}
      >
        <List>
          <ListRow icon={icon}>
            <span
              className={compact ? styles.labelHidden : styles.label}
              style={{ fontWeight: isSelected ? 600 : 400 }}
            >
              {label}
            </span>
          </ListRow>
        </List>
      </RouterLink>
    );

    if (!compact) {
      return link;
    }

    return (
      <TooltipTrigger>
        {link}
        <Tooltip placement="right">{label}</Tooltip>
      </TooltipTrigger>
    );
  };

  const isPopup = props.inPopup;
  const isCompact = compact && !isPopup;

  return (
    <nav
      id="left-menu"
      aria-labelledby="nested-list-subheader"
      className={`${styles.leftMenu} ${
        isPopup
          ? styles.inPopup
          : `${styles.outsidePopup} ${isCompact ? styles.leftMenuCompact : ''}`
      }`}
    >
      <CustomMenuItem
        route={rootRoute()}
        icon={<RiHomeLine size={16} />}
        label={t('leftMenu.home')}
      />

      {(!disabled.questions || !disabled.articles || !disabled.links) && (
        <Text as="div" className={styles.sectionHeader}>
          {t('leftMenu.content')}
        </Text>
      )}

      {!disabled.questions && (
        <CustomMenuItem
          route={questionsRoute()}
          hasSubRoutes
          icon={<RiQuestionLine size={16} />}
          label={t('leftMenu.questions')}
        />
      )}

      {!disabled.articles && (
        <CustomMenuItem
          route={articlesRoute()}
          hasSubRoutes
          icon={<RiBook2Line size={16} />}
          label={t('leftMenu.articles')}
        />
      )}

      {!disabled.links && (
        <CustomMenuItem
          route={linksRoute()}
          hasSubRoutes
          icon={<RiLinksLine size={16} />}
          label={t('leftMenu.links')}
        />
      )}

      <CustomMenuItem
        route={favoritesRoute()}
        icon={<RiStarLine size={16} />}
        label={t('leftMenu.favoriteQuestions')}
      />

      {!disabled.entities && (
        <CustomMenuItem
          route={entitiesRoute()}
          hasSubRoutes
          icon={
            EntityIcon ? (
              <EntityIcon fontSize="small" />
            ) : (
              <RiShapesLine size={16} />
            )
          }
          label={t('leftMenu.entities')}
        />
      )}

      {!disabled.tags && (
        <CustomMenuItem
          route={tagsRoute()}
          hasSubRoutes
          icon={<RiPriceTag3Line size={16} />}
          label={t('leftMenu.tags')}
        />
      )}

      {!disabled.collections && (
        <Text as="div" className={styles.sectionHeader}>
          {t('leftMenu.community')}
        </Text>
      )}

      {!disabled.collections && (
        <CustomMenuItem
          route={collectionsRoute()}
          hasSubRoutes
          icon={<RiPlayListLine size={16} />}
          label={t('leftMenu.collections')}
        />
      )}

      <CustomMenuItem
        route={usersRoute()}
        icon={<RiGroupLine size={16} />}
        label={t('leftMenu.users')}
      />

      {user && !loadingUser && !userError && (
        <CustomMenuItem
          route={`${userRoute()}/${user.userEntityRef}`}
          icon={<RiUserLine size={16} />}
          label={t('leftMenu.profile')}
        />
      )}

      <CustomMenuItem
        route={statisticsRoute()}
        icon={<RiTrophyLine size={16} />}
        label={t('leftMenu.statistics')}
      />

      <Text as="div" className={styles.sectionHeader}>
        {t('leftMenu.manage')}
      </Text>
      <CustomMenuItem
        route={settingsRoute()}
        icon={<RiSettingsLine size={16} />}
        label={t('leftMenu.settings')}
      />

      {canReview && (
        <CustomMenuItem
          route={reviewRoute()}
          icon={<RiFileEditLine size={16} />}
          label={t('leftMenu.review')}
        />
      )}
      {isModerator && (
        <CustomMenuItem
          route={moderatorRoute()}
          icon={<RiHammerLine size={16} />}
          label={t('leftMenu.moderate')}
        />
      )}
      {!isPopup && (
        <div
          className={`${styles.toggleRow} ${
            isCompact ? styles.toggleRowCompact : styles.toggleRowExpanded
          }`}
        >
          <TooltipTrigger>
            <ButtonIcon
              aria-label={
                isCompact ? t('leftMenu.expand') : t('leftMenu.collapse')
              }
              onPress={onToggle}
              size="small"
              variant="tertiary"
              className={styles.toggleButton}
              icon={
                isCompact ? (
                  <RiArrowRightSLine size={16} />
                ) : (
                  <RiMenuFoldLine size={16} />
                )
              }
            />
            <Tooltip placement="right">
              {isCompact ? t('leftMenu.expand') : t('leftMenu.collapse')}
            </Tooltip>
          </TooltipTrigger>
        </div>
      )}
    </nav>
  );
};
