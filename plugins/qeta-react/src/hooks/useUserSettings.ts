import { storageApiRef, useApi } from '@backstage/core-plugin-api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { merge } from 'lodash';
import { ViewType } from '../components/ViewToggle/ViewToggle';

export type UserSettings = {
  autoSaveEnabled: boolean;
  anonymousPosting: boolean;
  filterPanelExpanded: Record<string, boolean>;
  viewType: Record<string, ViewType>;
  aiAnswerExpanded: boolean;
  usePagination: boolean;
};

const DEFAULT_SETTINGS: UserSettings = {
  autoSaveEnabled: false,
  anonymousPosting: false,
  filterPanelExpanded: {},
  viewType: {},
  aiAnswerExpanded: false,
  usePagination: false,
};

const BUCKET_KEY = 'qeta';
const STORAGE_KEY = 'qeta-user-settings';

export const useUserSettings = () => {
  const storageApi = useApi(storageApiRef);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const settingsRef = useRef<UserSettings>(DEFAULT_SETTINGS);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const bucket = storageApi.forBucket(BUCKET_KEY);
    const snapshot = bucket.snapshot(STORAGE_KEY);
    const stored = snapshot.value as UserSettings | undefined;

    if (stored) {
      const merged = merge({}, DEFAULT_SETTINGS, stored);
      setSettings(merged);
      settingsRef.current = merged;
    }

    setIsLoaded(true);

    const subscription = bucket.observe$<UserSettings>(STORAGE_KEY).subscribe({
      next: newSnapshot => {
        if (isUpdatingRef.current) {
          return;
        }

        const value = newSnapshot.value;
        if (value) {
          const merged = merge({}, DEFAULT_SETTINGS, value);
          setSettings(merged);
          settingsRef.current = merged;
        } else {
          setSettings(DEFAULT_SETTINGS);
          settingsRef.current = DEFAULT_SETTINGS;
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
      const currentSettings = settingsRef.current;

      const newSettings = { ...currentSettings };
      Object.keys(updates).forEach(key => {
        const k = key as keyof UserSettings;
        const value = updates[k];
        if (value !== undefined) {
          if (k === 'viewType' || k === 'filterPanelExpanded') {
            newSettings[k] = value as any;
          } else if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
          ) {
            newSettings[k] = merge({}, currentSettings[k], value);
          } else {
            newSettings[k] = value as any;
          }
        }
      });

      settingsRef.current = newSettings;
      setSettings(newSettings);

      isUpdatingRef.current = true;
      try {
        await bucket.set(STORAGE_KEY, newSettings);
      } finally {
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }
    },
    [storageApi],
  );

  const getSetting = useCallback(
    <K extends keyof UserSettings>(key: K): UserSettings[K] => {
      return settingsRef.current[key] ?? DEFAULT_SETTINGS[key];
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
    settings: settingsRef.current,
    updateSettings,
    getSetting,
    setSetting,
    resetSettings,
    isLoaded,
  };
};
