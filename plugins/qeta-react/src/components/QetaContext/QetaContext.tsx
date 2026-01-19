import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PluggableList } from 'unified';
import { storageApiRef, useApi } from '@backstage/core-plugin-api';
import { merge } from 'lodash';
import { ViewType } from '../ViewToggle/ViewToggle';

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

export type QetaContextProps = {
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  draftQuestion?: {
    title: string;
    content: string;
    tags?: string[];
    entities?: string[];
  };
  setDraftQuestion?: Dispatch<
    SetStateAction<
      | {
          title: string;
          content: string;
          tags?: string[];
          entities?: string[];
        }
      | undefined
    >
  >;
  settings?: UserSettings;
  updateSettings?: (updates: Partial<UserSettings>) => Promise<void>;
  getSetting?: <K extends keyof UserSettings>(key: K) => UserSettings[K];
  setSetting?: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => Promise<void>;
  resetSettings?: () => Promise<void>;
  isSettingsLoaded?: boolean;
};

export const QetaContext = createContext<QetaContextProps>({
  remarkPlugins: [],
  rehypePlugins: [],
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  getSetting: <K extends keyof UserSettings>(key: K): UserSettings[K] =>
    DEFAULT_SETTINGS[key],
  setSetting: async () => {},
  resetSettings: async () => {},
  isSettingsLoaded: false,
});

export const QetaProvider = (props: PropsWithChildren<QetaContextProps>) => {
  const storageApi = useApi(storageApiRef);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const settingsRef = useRef<UserSettings>(DEFAULT_SETTINGS);
  const isUpdatingRef = useRef(false);

  const [draftQuestion, setDraftQuestion] = useState<
    | {
        title: string;
        content: string;
        tags?: string[];
        entities?: string[];
      }
    | undefined
  >(undefined);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const bucket = storageApi.forBucket(BUCKET_KEY);

    isUpdatingRef.current = false;

    const snapshot = bucket.snapshot(STORAGE_KEY);
    const stored = snapshot.value as UserSettings | undefined;

    if (stored) {
      const merged = merge({}, DEFAULT_SETTINGS, stored);
      setSettings(merged);
      settingsRef.current = merged;
    } else {
      setSettings(DEFAULT_SETTINGS);
      settingsRef.current = DEFAULT_SETTINGS;
    }

    setIsSettingsLoaded(true);

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
      const storedSettings = snapshot.value as UserSettings | undefined;
      const currentSettings = storedSettings
        ? merge({}, DEFAULT_SETTINGS, storedSettings)
        : settingsRef.current;

      const newSettings = { ...currentSettings };
      Object.keys(updates).forEach(key => {
        const k = key as keyof UserSettings;
        const value = updates[k];
        if (Object.hasOwn(updates, k)) {
          if (k === 'viewType' || k === 'filterPanelExpanded') {
            const currentValue = currentSettings[k] || {};
            const updateValue = (value || {}) as Record<string, any>;
            const merged = { ...currentValue };

            Object.keys(updateValue).forEach(subKey => {
              if (updateValue[subKey] === undefined) {
                delete merged[subKey];
              } else {
                merged[subKey] = updateValue[subKey];
              }
            });

            newSettings[k] = merged as any;
          } else if (
            value !== undefined &&
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
          ) {
            newSettings[k] = merge({}, currentSettings[k], value);
          } else if (value !== undefined) {
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
        await Promise.resolve();
        isUpdatingRef.current = false;
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
    await updateSettings(DEFAULT_SETTINGS);
  }, [updateSettings]);

  const contextValue = useMemo(
    () => ({
      ...props,
      draftQuestion,
      setDraftQuestion,
      settings,
      updateSettings,
      getSetting,
      setSetting,
      resetSettings,
      isSettingsLoaded,
    }),
    [
      props,
      draftQuestion,
      setDraftQuestion,
      settings,
      updateSettings,
      getSetting,
      setSetting,
      resetSettings,
      isSettingsLoaded,
    ],
  );

  return (
    <QetaContext.Provider value={contextValue}>
      {props.children}
    </QetaContext.Provider>
  );
};

export function useQetaContext(): QetaContextProps {
  const context = useContext(QetaContext);

  if (!context) {
    return {
      remarkPlugins: [],
      rehypePlugins: [],
      draftQuestion: undefined,
      setDraftQuestion: undefined,
      settings: DEFAULT_SETTINGS,
      updateSettings: async () => {},
      getSetting: <K extends keyof UserSettings>(key: K): UserSettings[K] =>
        DEFAULT_SETTINGS[key],
      setSetting: async () => {},
      resetSettings: async () => {},
      isSettingsLoaded: false,
    };
  }

  return context;
}
