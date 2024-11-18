import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import SvgIcon from '@mui/material/SvgIcon';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import makeStyles from '@mui/styles/makeStyles';
import AccountBox from '@mui/icons-material/AccountBox';
import LoyaltyOutlined from '@mui/icons-material/LoyaltyOutlined';
import StarIcon from '@mui/icons-material/Star';
import React, { ReactNode } from 'react';
import { useApp, useRouteRef } from '@backstage/core-plugin-api';
import HelpOutlined from '@mui/icons-material/HelpOutlined';
import { useNavigate } from 'react-router-dom';
import Home from '@mui/icons-material/Home';
import { useLocation } from 'react-use';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import PlaylistPlay from '@mui/icons-material/PlaylistPlay';
import SettingsIcon from '@mui/icons-material/Settings';
import { GroupIcon } from '@backstage/core-components';
import {
  articlesRouteRef,
  collectionsRouteRef,
  entitiesRouteRef,
  favoriteQuestionsRouteRef,
  moderatorRouteRef,
  qetaRouteRef,
  questionsRouteRef,
  statisticsRouteRef,
  tagsRouteRef,
  userRouteRef,
  usersRouteRef,
} from '../../routes';
import { TrophyIcon } from '../TopRankingUsersCard';
import { useIdentityApi, useIsModerator, useTranslation } from '../../hooks';

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
        width: '165px',
        paddingTop: '2rem',
      },
      inPopup: {
        marginRight: 0,
        padding: '0.5rem',
      },
      outsidePopup: {
        marginRight: theme.spacing(5),
        marginLeft: theme.spacing(1),
        float: 'right',
        position: 'sticky',
      },
      selectedMenuItem: {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.light,
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
        '& svg': {
          color: theme.palette.primary.contrastText,
        },
      },
      nonSelectedMenuItem: {
        backgroundColor: 'initial',
      },
      menuIcon: {
        minWidth: '26px',
      },
    };
  },
  { name: 'QetaLeftMenu' },
);

export const LeftMenu = (props: {
  onKeyDown?: (event: React.KeyboardEvent) => void;
  autoFocusItem?: boolean;
  onClick?: (
    event: MouseEvent | TouchEvent | React.MouseEvent<EventTarget>,
  ) => void;
  inPopup?: boolean;
}) => {
  const rootRoute = useRouteRef(qetaRouteRef);
  const tagsRoute = useRouteRef(tagsRouteRef);
  const favoritesRoute = useRouteRef(favoriteQuestionsRouteRef);
  const statisticsRoute = useRouteRef(statisticsRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const questionsRoute = useRouteRef(questionsRouteRef);
  const articlesRoute = useRouteRef(articlesRouteRef);
  const collectionsRoute = useRouteRef(collectionsRouteRef);
  const entitiesRoute = useRouteRef(entitiesRouteRef);
  const usersRoute = useRouteRef(usersRouteRef);
  const moderatorRoute = useRouteRef(moderatorRouteRef);
  const styles = useStyles();
  const { t } = useTranslation();
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
    children,
  }: {
    route: string;
    children: ReactNode[];
  }) => {
    return (
      <MenuItem
        onClick={e => {
          navigate(route);
          if (props.onClick) {
            props.onClick(e);
          }
        }}
        className={
          route === location.pathname
            ? styles.selectedMenuItem
            : styles.nonSelectedMenuItem
        }
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
        <ListItem>
          <Typography variant="subtitle2">{t('leftMenu.content')}</Typography>
        </ListItem>
        <CustomMenuItem route={questionsRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <HelpOutlined fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.questions')}
        </CustomMenuItem>
        <CustomMenuItem route={articlesRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <CollectionsBookmarkIcon fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.articles')}
        </CustomMenuItem>
        <CustomMenuItem route={favoritesRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <StarIcon fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.favoriteQuestions')}
        </CustomMenuItem>
        <CustomMenuItem route={entitiesRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <EntityIcon fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.entities')}
        </CustomMenuItem>
        <CustomMenuItem route={tagsRoute()}>
          <ListItemIcon className={styles.menuIcon}>
            <LoyaltyOutlined fontSize="small" />
          </ListItemIcon>
          {t('leftMenu.tags')}
        </CustomMenuItem>
        <ListItem>
          <Typography variant="subtitle2">{t('leftMenu.community')}</Typography>
        </ListItem>
        <CustomMenuItem route={collectionsRoute()}>
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
            <ListItem>
              <Typography variant="subtitle2">
                {t('leftMenu.manage')}
              </Typography>
            </ListItem>
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
