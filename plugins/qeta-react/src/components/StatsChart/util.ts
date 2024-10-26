import {
  GlobalStat,
  Stat,
  UserStat,
} from '@drodil/backstage-plugin-qeta-common';

export const isGlobalStat = (stat: Stat): stat is GlobalStat => {
  return (stat as GlobalStat).totalUsers !== undefined;
};

export const isUserStat = (stat: Stat): stat is UserStat => {
  return (stat as UserStat).totalFollowers !== undefined;
};
