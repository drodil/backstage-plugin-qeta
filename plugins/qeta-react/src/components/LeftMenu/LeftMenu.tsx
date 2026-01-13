import {
  Box,
  IconButton,
  List,
  ListItemIcon,
  makeStyles,
  MenuItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useApp, useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-use';
// Icons
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import HelpOutline from '@material-ui/icons/HelpOutline';
import LibraryBooksOutlined from '@material-ui/icons/LibraryBooksOutlined';
import LinkIcon from '@material-ui/icons/Link';
import StarBorder from '@material-ui/icons/StarBorder';
import CategoryOutlined from '@material-ui/icons/CategoryOutlined'; // For Entities?
import LocalOfferOutlined from '@material-ui/icons/LocalOfferOutlined';
import PlaylistPlayOutlined from '@material-ui/icons/PlaylistPlayOutlined'; // Check if exists, else PlaylistPlay
import PeopleOutline from '@material-ui/icons/PeopleOutline';
import PersonOutline from '@material-ui/icons/PersonOutline';
import EmojiEventsOutlined from '@material-ui/icons/EmojiEventsOutlined'; // Check, else plain
import SettingsOutlined from '@material-ui/icons/SettingsOutlined';
import GavelOutlined from '@material-ui/icons/GavelOutlined';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import RateReviewOutlined from '@material-ui/icons/RateReviewOutlined';

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
import { useCanReview, useIdentityApi, useIsModerator } from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const useStyles = makeStyles(
  theme => {
    return {
      leftMenu: {
        top: '0',
        width: '220px', // Standard width
        paddingTop: 0,
        paddingBottom: theme.spacing(2),
        transition: 'width 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      },
      leftMenuCompact: {
        width: '70px',
        overflowX: 'hidden',
        '& $sectionHeader': {
          display: 'none',
        },
      },
      inPopup: {
        marginRight: 0,
        padding: theme.spacing(1),
        width: 'auto',
      },
      outsidePopup: {
        paddingRight: theme.spacing(2),
      },
      menuItem: {
        margin: (props: any) => (props.compact ? 0 : theme.spacing(0, 0)),
        justifyContent: (props: any) =>
          props.compact ? 'center' : 'flex-start',
        padding: (props: any) =>
          props.compact ? theme.spacing(1, 0) : theme.spacing(0.5, 0.5),
        borderRadius: (props: any) =>
          props.compact ? 0 : theme.shape.borderRadius,
        transition: 'all 0.2s ease-in-out',
        color: theme.palette.text.primary,
        display: 'flex',
        alignItems: 'center',
        minHeight: 40,
        maxWidth: '80%',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      },
      selectedMenuItem: {
        color: theme.palette.primary.main,
        backgroundColor: 'transparent',
        fontWeight: 600,
        position: 'relative',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        '& svg': {
          color: theme.palette.primary.main,
        },
      },
      menuIcon: {
        minWidth: '32px',
        color: 'inherit',
        display: 'flex',
        justifyContent: 'center',
      },
      sectionHeader: {
        padding: theme.spacing(0.5, 2, 0.5, 1),
        marginTop: theme.spacing(2),
        color: theme.palette.text.secondary,
        fontWeight: 600,
        textTransform: 'uppercase',
        fontSize: '14px',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
      },
      toggleButton: {
        marginLeft: 'auto',
        marginRight: theme.spacing(0),
        marginBottom: theme.spacing(1),
      },
      label: {
        marginLeft: theme.spacing(1),
        whiteSpace: 'nowrap',
        opacity: 1,
        transition: 'opacity 0.2s',
      },
      labelHidden: {
        opacity: 0,
        width: 0,
        display: 'none',
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
  const styles = useStyles(props);
  const { t } = useTranslationRef(qetaTranslationRef);
  const location = useLocation();
  const navigate = useNavigate();
  const { isModerator } = useIsModerator();
  const { canReview } = useCanReview();
  const app = useApp();
  const { compact = false, onToggle } = props;
  const {
    value: user,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  const EntityIcon = app.getSystemIcon('kind:system') ?? CategoryOutlined;

  const CustomMenuItem = ({
    route,
    hasSubRoutes,
    children,
    label,
  }: {
    route: string;
    hasSubRoutes?: boolean;
    children: ReactNode;
    label: string;
  }) => {
    const isSelected =
      route === location.pathname ||
      (hasSubRoutes && location.pathname?.startsWith(route));

    return (
      <Tooltip title={compact ? label : ''} placement="right">
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
          className={`${styles.menuItem} ${
            isSelected ? styles.selectedMenuItem : ''
          }`}
          href={route}
          component="a"
        >
          {children}
          <Typography
            variant="body2"
            className={compact ? styles.labelHidden : styles.label}
            style={{ fontWeight: isSelected ? 600 : 400 }}
          >
            {label}
          </Typography>
        </MenuItem>
      </Tooltip>
    );
  };

  const isPopup = props.inPopup;
  const isCompact = compact && !isPopup;

  return (
    <List
      id="left-menu"
      className={`${styles.leftMenu} ${
        isPopup
          ? styles.inPopup
          : `${styles.outsidePopup} ${isCompact ? styles.leftMenuCompact : ''}`
      }`}
      component="nav"
      aria-labelledby="nested-list-subheader"
      disablePadding
    >
      <CustomMenuItem route={rootRoute()} label={t('leftMenu.home')}>
        <ListItemIcon className={styles.menuIcon}>
          <HomeOutlined fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      <li style={{ listStyle: 'none' }}>
        <Typography className={styles.sectionHeader}>
          {t('leftMenu.content')}
        </Typography>
      </li>

      <CustomMenuItem
        route={questionsRoute()}
        hasSubRoutes
        label={t('leftMenu.questions')}
      >
        <ListItemIcon className={styles.menuIcon}>
          <HelpOutline fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      <CustomMenuItem
        route={articlesRoute()}
        hasSubRoutes
        label={t('leftMenu.articles')}
      >
        <ListItemIcon className={styles.menuIcon}>
          <LibraryBooksOutlined fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      <CustomMenuItem
        route={linksRoute()}
        hasSubRoutes
        label={t('leftMenu.links')}
      >
        <ListItemIcon className={styles.menuIcon}>
          <LinkIcon fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      <CustomMenuItem
        route={favoritesRoute()}
        label={t('leftMenu.favoriteQuestions')}
      >
        <ListItemIcon className={styles.menuIcon}>
          <StarBorder fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      <CustomMenuItem
        route={entitiesRoute()}
        hasSubRoutes
        label={t('leftMenu.entities')}
      >
        <ListItemIcon className={styles.menuIcon}>
          <EntityIcon fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      <CustomMenuItem
        route={tagsRoute()}
        hasSubRoutes
        label={t('leftMenu.tags')}
      >
        <ListItemIcon className={styles.menuIcon}>
          <LocalOfferOutlined fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      <li style={{ listStyle: 'none' }}>
        <Typography className={styles.sectionHeader}>
          {t('leftMenu.community')}
        </Typography>
      </li>

      <CustomMenuItem
        route={collectionsRoute()}
        hasSubRoutes
        label={t('leftMenu.collections')}
      >
        <ListItemIcon className={styles.menuIcon}>
          <PlaylistPlayOutlined fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      <CustomMenuItem route={usersRoute()} label={t('leftMenu.users')}>
        <ListItemIcon className={styles.menuIcon}>
          <PeopleOutline fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      {user && !loadingUser && !userError && (
        <CustomMenuItem
          route={`${userRoute()}/${user.userEntityRef}`}
          label={t('leftMenu.profile')}
        >
          <ListItemIcon className={styles.menuIcon}>
            <PersonOutline fontSize="small" />
          </ListItemIcon>
        </CustomMenuItem>
      )}

      <CustomMenuItem
        route={statisticsRoute()}
        label={t('leftMenu.statistics')}
      >
        <ListItemIcon className={styles.menuIcon}>
          <EmojiEventsOutlined fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      <li style={{ listStyle: 'none' }}>
        <Typography className={styles.sectionHeader}>
          {t('leftMenu.manage')}
        </Typography>
      </li>
      <CustomMenuItem route={settingsRoute()} label={t('leftMenu.settings')}>
        <ListItemIcon className={styles.menuIcon}>
          <SettingsOutlined fontSize="small" />
        </ListItemIcon>
      </CustomMenuItem>

      {canReview && (
        <CustomMenuItem route={reviewRoute()} label={t('leftMenu.review')}>
          <ListItemIcon className={styles.menuIcon}>
            <RateReviewOutlined fontSize="small" />
          </ListItemIcon>
        </CustomMenuItem>
      )}
      {isModerator && (
        <CustomMenuItem route={moderatorRoute()} label={t('leftMenu.moderate')}>
          <ListItemIcon className={styles.menuIcon}>
            <GavelOutlined fontSize="small" />
          </ListItemIcon>
        </CustomMenuItem>
      )}
      {!isPopup && (
        <Box
          display="flex"
          justifyContent={isCompact ? 'center' : 'flex-start'}
          style={{ marginTop: 'auto' }}
        >
          <Tooltip
            title={isCompact ? t('leftMenu.expand') : t('leftMenu.collapse')}
            placement="right"
          >
            <IconButton
              onClick={onToggle}
              size="small"
              className={isCompact ? '' : styles.toggleButton}
              style={{ marginTop: 8, marginLeft: isCompact ? -10 : 5 }}
            >
              {isCompact ? <ChevronRightIcon /> : <MenuOpenIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </List>
  );
};
