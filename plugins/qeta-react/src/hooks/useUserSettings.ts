import { useApi } from '@backstage/core-plugin-api';
import { storageApiRef } from '@backstage/core-plugin-api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ViewType } from '../components/ViewToggle/ViewToggle';

export type UserSettings = {
  autoSaveEnabled: boolean;
  filterPanelExpanded: Record<string, boolean>;
  viewType: Record<string, ViewType>;
  aiAnswerExpanded: boolean;
};

const DEFAULT_SETTINGS: UserSettings = {
  autoSaveEnabled: false,
  filterPanelExpanded: {},
  viewType: {},
  aiAnswerExpanded: false,
};

const BUCKET_KEY = 'qeta';
const STORAGE_KEY = 'qeta-user-settings';

export const useUserSettings = () => {
  const storageApi = useApi(storageApiRef);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const settingsRef = useRef<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const bucket = storageApi.forBucket(BUCKET_KEY);
    const snapshot = bucket.snapshot(STORAGE_KEY);
    const stored = snapshot.value as UserSettings | undefined;

    if (stored) {
      setSettings(stored);
    }

    setIsLoaded(true);

    const subscription = bucket.observe$<UserSettings>(STORAGE_KEY).subscribe({
      next: newSnapshot => {
        const value = newSnapshot.value as UserSettings | undefined;
        if (value) {
          setSettings(value);
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [storageApi]);

  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      const bucket = storageApi.forBucket(BUCKET_KEY);
      const snapshot = bucket.snapshot(STORAGE_KEY);
      const currentSettings =
        (snapshot.value as UserSettings) || DEFAULT_SETTINGS;
      const newSettings = {
        ...currentSettings,
        ...(updates as Partial<UserSettings>),
      };
      await bucket.set(STORAGE_KEY, newSettings);
    },
    [storageApi],
  );

  const getSetting = useCallback(
    <K extends keyof UserSettings>(key: K): UserSettings[K] => {
      return settingsRef.current[key];
    },
    [],
  );

  const setSetting = useCallback(
    async <K extends keyof UserSettings>(
      key: K,
      value: UserSettings[K],
    ): Promise<void> => {
      await updateSettings({ [key]: value } as Partial<UserSettings>);
    },
    [updateSettings],
  );

  const resetSettings = useCallback(async () => {
    const bucket = storageApi.forBucket('qeta');
    await bucket.set(STORAGE_KEY, DEFAULT_SETTINGS);
  }, [storageApi]);

  return {
    settings,
    updateSettings,
    getSetting,
    setSetting,
    resetSettings,
    isLoaded,
  };
};
