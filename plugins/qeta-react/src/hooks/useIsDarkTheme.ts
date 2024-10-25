import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import { useMemo } from 'react';

export function useIsDarkTheme() {
  const appThemeApi = useApi(appThemeApiRef);
  const themes = appThemeApi.getInstalledThemes();
  const theme = useMemo(() => appThemeApi.getActiveThemeId(), [appThemeApi]);
  return Boolean(themes.find(t => t.id === theme)?.variant === 'dark');
}
