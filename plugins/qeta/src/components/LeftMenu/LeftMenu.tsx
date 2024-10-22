import {
  Box,
  ListItem,
  ListItemIcon,
  MenuItem,
  MenuList,
  Typography,
} from '@material-ui/core';
import AccountBox from '@material-ui/icons/AccountBox';
import LoyaltyOutlined from '@material-ui/icons/LoyaltyOutlined';
import StarIcon from '@material-ui/icons/Star';
import {
  articlesRouteRef,
  collectionsRouteRef,
  entitiesRouteRef,
  favoriteQuestionsRouteRef,
  qetaRouteRef,
  questionsRouteRef,
  statisticsRouteRef,
  tagsRouteRef,
  TrophyIcon,
  useIdentityApi,
  userRouteRef,
  useStyles,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import React, { ReactNode } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import HelpOutlined from '@material-ui/icons/HelpOutlined';
import { useNavigate } from 'react-router-dom';
import Home from '@material-ui/icons/Home';
import { useLocation } from 'react-use';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import PlaylistPlay from '@material-ui/icons/PlaylistPlay';

export const LeftMenu = (props: {
  onKeyDown?: (event: React.KeyboardEvent) => void;
  autoFocusItem?: boolean;
  onClick?: (event: React.MouseEvent<EventTarget>) => void;
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
  const styles = useStyles();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
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

  return (
    <MenuList
      id="left-menu"
      className={styles.leftMenu}
      onKeyDown={props.onKeyDown}
      autoFocusItem={props.autoFocusItem}
      style={
        props.inPopup
          ? { marginRight: 0, padding: '0.5rem' }
          : { marginRight: '2rem', float: 'right', position: 'sticky' }
      }
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
            <LoyaltyOutlined fontSize="small" />
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
      </Box>
    </MenuList>
  );
};
