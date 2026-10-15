import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import { useEffect, useMemo, useState } from 'react';
import useObservable from 'react-use/esm/useObservable';

export function useIsDarkTheme() {
  const appThemeApi = useApi(appThemeApiRef);
  const themes = appThemeApi.getInstalledThemes();
  const themeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );
  const mediaQuery = useMemo(
    () =>
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : undefined,
    [],
  );
  const [shouldPreferDark, setShouldPreferDark] = useState(
    Boolean(mediaQuery?.matches),
  );

  useEffect(() => {
    if (!mediaQuery) {
      return undefined;
    }

    const listener = (event: MediaQueryListEvent) =>
      setShouldPreferDark(event.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [mediaQuery]);

  if (themeId !== undefined) {
    const selectedTheme = themes.find(theme => theme.id === themeId);
    if (selectedTheme) {
      return selectedTheme.variant === 'dark';
    }
  }

  if (shouldPreferDark) {
    const darkTheme = themes.find(theme => theme.variant === 'dark');
    if (darkTheme) {
      return darkTheme.variant === 'dark';
    }
  }

  const lightTheme = themes.find(theme => theme.variant === 'light');
  if (lightTheme) {
    return lightTheme.variant === 'dark';
  }

  return themes[0]?.variant === 'dark';
}
