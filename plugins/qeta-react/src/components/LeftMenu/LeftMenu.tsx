import {
  Box,
  Divider,
  ListItemIcon,
  makeStyles,
  MenuItem,
  MenuList,
  SvgIcon,
  Typography,
} from '@material-ui/core';
import AccountBox from '@material-ui/icons/AccountBox';
import LoyaltyOutlined from '@material-ui/icons/LoyaltyOutlined';
import StarIcon from '@material-ui/icons/Star';
import { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useApp, useRouteRef } from '@backstage/core-plugin-api';
import HelpOutlined from '@material-ui/icons/HelpOutlined';
import { useNavigate } from 'react-router-dom';
import Home from '@material-ui/icons/Home';
import { useLocation } from 'react-use';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import PlaylistPlay from '@material-ui/icons/PlaylistPlay';
import SettingsIcon from '@material-ui/icons/Settings';
import { GroupIcon } from '@backstage/core-components';
import {
  articlesRouteRef,
  collectionsRouteRef,
  entitiesRouteRef,
  favoriteQuestionsRouteRef,
  linksRouteRef,
  moderatorRouteRef,
  qetaRouteRef,
  questionsRouteRef,
  statisticsRouteRef,
  tagsRouteRef,
  userRouteRef,
  usersRouteRef,
} from '../../routes';
import { TrophyIcon } from '../TopRankingUsersCard';
import { useIdentityApi, useIsModerator } from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import LinkIcon from '@material-ui/icons/Link';

export type QetaLeftMenuClassKey =
  | 'leftMenu'
  | 'inPopup'
  | 'outsidePopup'
  | 'selectedMenuItem'
  | 'nonSelectedMenuItem'
  | 'menuIcon';

export const useStyles = makeStyles(
  theme => {
    return {
      leftMenu: {
        top: '0',
        width: '200px',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        transition: 'all 0.2s ease-in-out',
      },
      inPopup: {
        marginRight: 0,
        padding: theme.spacing(1),
      },
      outsidePopup: {
        marginRight: theme.spacing(3),
        float: 'right',
        position: 'sticky',
        top: theme.spacing(2),
      },
      selectedMenuItem: {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
        borderRadius: theme.shape.borderRadius,
        margin: theme.spacing(0.5, 1),
        padding: theme.spacing(0.75, 1.5),
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.primary.contrastText,
          transform: 'translateX(4px)',
        },
        '& svg': {
          color: theme.palette.primary.contrastText,
        },
      },
      nonSelectedMenuItem: {
        margin: theme.spacing(0.5, 1),
        padding: theme.spacing(0.75, 1.5),
        borderRadius: theme.shape.borderRadius,
        transition: 'all 0.2s ease-in-out',
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          transform: 'translateX(4px)',
        },
      },
      menuIcon: {
        minWidth: '32px',
        color: 'inherit',
      },
      sectionHeader: {
        padding: theme.spacing(1, 2, 0.5, 2),
        marginTop: theme.spacing(2),
        color: theme.palette.text.secondary,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
      divider: {
        margin: theme.spacing(1, 2),
        backgroundColor: theme.palette.divider,
      },
    };
  },
  { name: 'QetaLeftMenu' },
);

export const LeftMenu = (props: {
  onKeyDown?: (event: KeyboardEvent) => void;
  autoFocusItem?: boolean;
  onClick?: (event: MouseEvent<EventTarget>) => void;
  inPopup?: boolean;
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
  const styles = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);
  const location = useLocation();
  const navigate = useNavigate();
  const { isModerator } = useIsModerator();
  const app = useApp();
  const {
    value: user,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  const CustomMenuItem = ({
    route,
    hasSubRoutes,
    children,
  }: {
    route: string;
    hasSubRoutes?: boolean;
    children: ReactNode[];
  }) => {
    return (
      <MenuItem
        onClick={e => {
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
            return;
          }
          e.preventDefault();
          navigate(route);
          if (props.onClick) {
            props.onClick(e);
          }
        }}
        className={
          route === location.pathname ||
          (hasSubRoutes && location.pathname?.startsWith(route))
            ? styles.selectedMenuItem
            : styles.nonSelectedMenuItem
        }
        href={route}
        component="a"
      >
        {children}
      </MenuItem>
    );
  };

  const EntityIcon = app.getSystemIcon('kind:system') ?? SvgIcon;

  return (
    <MenuList
      id="left-menu"
      className={`${styles.leftMenu} ${
        props.inPopup ? styles.inPopup : styles.outsidePopup
      }`}
      onKeyDown={props.onKeyDown}
      autoFocusItem={props.autoFocusItem}
    >
      <Box
        display={
          props.inPopup
            ? {}
            : { xs: 'none', sm: 'none', md: 'none', lg: 'block' }
        }
      >
        <CustomMenuItem route={rootRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <Home fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.home')}
        </CustomMenuItem>

        <Typography className={styles.sectionHeader}>
          {t('leftMenu.content')}
        </Typography>
        <Divider className={styles.divider} />

        <CustomMenuItem route={questionsRoute()} hasSubRoutes>
          <ListItemIcon className={styles.menuIcon}>
            <HelpOutlined fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.questions')}
        </CustomMenuItem>

        <CustomMenuItem route={articlesRoute()} hasSubRoutes>
          <ListItemIcon className={styles.menuIcon}>
            <CollectionsBookmarkIcon fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.articles')}
        </CustomMenuItem>

        <CustomMenuItem route={linksRoute()} hasSubRoutes>
          <ListItemIcon className={styles.menuIcon}>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.links')}
        </CustomMenuItem>

        <CustomMenuItem route={favoritesRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <StarIcon fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.favoriteQuestions')}
        </CustomMenuItem>

        <CustomMenuItem route={entitiesRoute()} hasSubRoutes>
          <ListItemIcon className={styles.menuIcon}>
            <EntityIcon fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.entities')}
        </CustomMenuItem>

        <CustomMenuItem route={tagsRoute()} hasSubRoutes>
          <ListItemIcon className={styles.menuIcon}>
            <LoyaltyOutlined fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.tags')}
        </CustomMenuItem>

        <Typography className={styles.sectionHeader}>
          {t('leftMenu.community')}
        </Typography>
        <Divider className={styles.divider} />

        <CustomMenuItem route={collectionsRoute()} hasSubRoutes>
          <ListItemIcon className={styles.menuIcon}>
            <PlaylistPlay fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.collections')}
        </CustomMenuItem>

        <CustomMenuItem route={usersRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.users')}
        </CustomMenuItem>

        {user && !loadingUser && !userError && (
          <CustomMenuItem route={`${userRoute()}/${user.userEntityRef}`}>
            <ListItemIcon className={styles.menuIcon}>
              <AccountBox fontSize="small" />
            </ListItemIcon>
            {t('leftMenu.profile')}
          </CustomMenuItem>
        )}

        <CustomMenuItem route={statisticsRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <TrophyIcon />
          </ListItemIcon>
          {t('leftMenu.statistics')}
        </CustomMenuItem>

        {isModerator && (
          <>
            <Typography className={styles.sectionHeader}>
              {t('leftMenu.manage')}
            </Typography>
            <Divider className={styles.divider} />

            <CustomMenuItem route={moderatorRoute()}>
              <ListItemIcon className={styles.menuIcon}>
                <SettingsIcon />
              </ListItemIcon>
              {t('leftMenu.moderate')}
            </CustomMenuItem>
          </>
        )}
      </Box>
    </MenuList>
  );
};
