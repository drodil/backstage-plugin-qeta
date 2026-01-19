import {
  useQetaContext,
  UserSettings,
} from '../components/QetaContext/QetaContext';

export type { UserSettings } from '../components/QetaContext/QetaContext';

export type UserSettingsHook = {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  getSetting: <K extends keyof UserSettings>(key: K) => UserSettings[K];
  setSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoaded: boolean;
};

export const useUserSettings = (): UserSettingsHook => {
  const context = useQetaContext();

  return {
    settings: context.settings!,
    updateSettings: context.updateSettings!,
    getSetting: context.getSetting!,
    setSetting: context.setSetting!,
    resetSettings: context.resetSettings!,
    isLoaded: context.isSettingsLoaded ?? false,
  };
};
