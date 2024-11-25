import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { MenuItemProps } from '@mui/material/MenuItem';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import SvgIcon from '@mui/material/SvgIcon';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
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
import { styled } from '@mui/system';

const LeftMenuItem = styled(ListItemIcon, { name: 'QetaLeftMenuIcon' })({
  minWidth: '26px !important',
});

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

  const StyledMenuItem = styled(MenuItem, { name: 'QetaLeftMenuItem' })<
    MenuItemProps & { active: boolean }
  >(({ theme, ...p }) => {
    return p.active
      ? {
          width: '100%',
          color: theme.palette.primary.contrastText,
          backgroundColor: theme.palette.primary.light,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
          '& svg': {
            color: theme.palette.primary.contrastText,
          },
        }
      : { width: '100%', backgroundColor: 'initial', borderRadius: 1 };
  });

  const CustomMenuItem = ({
    route,
    children,
  }: {
    route: string;
    children: ReactNode[];
  }) => {
    return (
      <StyledMenuItem
        onClick={e => {
          navigate(route);
          if (props.onClick) {
            props.onClick(e);
          }
        }}
        active={route === location.pathname}
      >
        {children}
      </StyledMenuItem>
    );
  };

  const EntityIcon = app.getSystemIcon('kind:system') ?? SvgIcon;

  return (
    <MenuList
      id="left-menu"
      sx={{
        top: '0',
        maxWidth: '165px',
        paddingTop: '2em',
        ...(props.inPopup
          ? { marginRight: 0, padding: '0.5em' }
          : {
              marginRight: 4,
              float: 'right',
              position: 'sticky',
            }),
      }}
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
          <LeftMenuItem>
            <Home fontSize="small" />
          </LeftMenuItem>
          {t('leftMenu.home')}
        </CustomMenuItem>
        <ListItem>
          <Typography variant="subtitle2">{t('leftMenu.content')}</Typography>
        </ListItem>
        <CustomMenuItem route={questionsRoute()}>
          <LeftMenuItem>
            <HelpOutlined fontSize="small" />
          </LeftMenuItem>
          {t('leftMenu.questions')}
        </CustomMenuItem>
        <CustomMenuItem route={articlesRoute()}>
          <LeftMenuItem>
            <CollectionsBookmarkIcon fontSize="small" />
          </LeftMenuItem>
          {t('leftMenu.articles')}
        </CustomMenuItem>
        <CustomMenuItem route={favoritesRoute()}>
          <LeftMenuItem>
            <StarIcon fontSize="small" />
          </LeftMenuItem>
          {t('leftMenu.favoriteQuestions')}
        </CustomMenuItem>
        <CustomMenuItem route={entitiesRoute()}>
          <LeftMenuItem>
            <EntityIcon fontSize="small" />
          </LeftMenuItem>
          {t('leftMenu.entities')}
        </CustomMenuItem>
        <CustomMenuItem route={tagsRoute()}>
          <LeftMenuItem>
            <LoyaltyOutlined fontSize="small" />
          </LeftMenuItem>
          {t('leftMenu.tags')}
        </CustomMenuItem>
        <ListItem>
          <Typography variant="subtitle2">{t('leftMenu.community')}</Typography>
        </ListItem>
        <CustomMenuItem route={collectionsRoute()}>
          <LeftMenuItem>
            <PlaylistPlay fontSize="small" />
          </LeftMenuItem>
          {t('leftMenu.collections')}
        </CustomMenuItem>
        <CustomMenuItem route={usersRoute()}>
          <LeftMenuItem>
            <GroupIcon fontSize="small" />
          </LeftMenuItem>
          {t('leftMenu.users')}
        </CustomMenuItem>
        {user && !loadingUser && !userError && (
          <CustomMenuItem route={`${userRoute()}/${user.userEntityRef}`}>
            <LeftMenuItem>
              <AccountBox fontSize="small" />
            </LeftMenuItem>
            {t('leftMenu.profile')}
          </CustomMenuItem>
        )}
        <CustomMenuItem route={statisticsRoute()}>
          <LeftMenuItem>
            <TrophyIcon />
          </LeftMenuItem>
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
              <LeftMenuItem>
                <SettingsIcon />
              </LeftMenuItem>
              {t('leftMenu.moderate')}
            </CustomMenuItem>
          </>
        )}
      </Box>
    </MenuList>
  );
};
