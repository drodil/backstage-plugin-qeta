import {
  ListItem,
  ListItemIcon,
  MenuItem,
  MenuList,
  Typography,
} from '@material-ui/core';
import AccountBox from '@material-ui/icons/AccountBox';
import LoyaltyOutlined from '@material-ui/icons/LoyaltyOutlined';
import StarIcon from '@material-ui/icons/Star';
import { TrophyIcon } from '../Statistics';
import React, { ReactNode } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useIdentityApi, useStyles, useTranslation } from '../../utils/hooks';
import {
  favoriteQuestionsRouteRef,
  qetaRouteRef,
  questionsRouteRef,
  statisticsRouteRef,
  tagsRouteRef,
  userRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import HelpOutlined from '@material-ui/icons/HelpOutlined';
import { useNavigate } from 'react-router-dom';
import Home from '@material-ui/icons/Home';
import { useLocation } from 'react-use';

export const LeftMenu = () => {
  const rootRoute = useRouteRef(qetaRouteRef);
  const tagsRoute = useRouteRef(tagsRouteRef);
  const favoritesRoute = useRouteRef(favoriteQuestionsRouteRef);
  const statisticsRoute = useRouteRef(statisticsRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const questionsRoute = useRouteRef(questionsRouteRef);
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
        onClick={() => navigate(route)}
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
    <MenuList id="left-menu">
      <CustomMenuItem route={rootRoute()}>
        <ListItemIcon className={styles.menuIcon}>
          <Home fontSize="small" />
        </ListItemIcon>
        {t('leftMenu.home')}
      </CustomMenuItem>
      <ListItem>
        <Typography variant="subtitle2">Content</Typography>
      </ListItem>
      <CustomMenuItem route={questionsRoute()}>
        <ListItemIcon className={styles.menuIcon}>
          <HelpOutlined fontSize="small" />
        </ListItemIcon>
        {t('leftMenu.questions')}
      </CustomMenuItem>
      <CustomMenuItem route={favoritesRoute()}>
        <ListItemIcon className={styles.menuIcon}>
          <StarIcon fontSize="small" />
        </ListItemIcon>
        {t('leftMenu.favoriteQuestions')}
      </CustomMenuItem>
      <CustomMenuItem route={tagsRoute()}>
        <ListItemIcon className={styles.menuIcon}>
          <LoyaltyOutlined fontSize="small" />
        </ListItemIcon>
        {t('leftMenu.tags')}
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
    </MenuList>
  );
};
