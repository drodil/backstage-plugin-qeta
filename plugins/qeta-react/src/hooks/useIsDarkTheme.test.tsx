import {
  AppTheme,
  AppThemeApi,
  appThemeApiRef,
} from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { useIsDarkTheme } from './useIsDarkTheme';

const themes: AppTheme[] = [
  {
    id: 'light',
    title: 'Light',
    variant: 'light',
    Provider: ({ children }: { children: ReactNode }) => <>{children}</>,
  },
  {
    id: 'dark',
    title: 'Dark',
    variant: 'dark',
    Provider: ({ children }: { children: ReactNode }) => <>{children}</>,
  },
];

function createActiveThemeSubject(initialValue: string | undefined) {
  let value = initialValue;
  const listeners = new Set<(themeId: string | undefined) => void>();

  return {
    get value() {
      return value;
    },
    next(themeId: string | undefined) {
      value = themeId;
      listeners.forEach(listener => listener(themeId));
    },
    asObservable() {
      const observable: ReturnType<AppThemeApi['activeThemeId$']> = {
        [Symbol.observable]: () => observable,
        subscribe(
          observerOrNext?:
            | ((themeId: string | undefined) => void)
            | {
                next?(themeId: string | undefined): void;
                error?(error: Error): void;
                complete?(): void;
              },
          _onError?: (error: Error) => void,
          _onComplete?: () => void,
        ) {
          const onNext =
            typeof observerOrNext === 'function'
              ? observerOrNext
              : observerOrNext?.next?.bind(observerOrNext);
          if (onNext) {
            onNext(value);
            listeners.add(onNext);
          }
          let closed = false;
          return {
            get closed() {
              return closed;
            },
            unsubscribe() {
              if (onNext) {
                listeners.delete(onNext);
              }
              closed = true;
            },
          };
        },
      };
      return observable;
    },
  };
}

describe('useIsDarkTheme', () => {
  let prefersDark: boolean;
  let mediaChangeListener: ((event: MediaQueryListEvent) => void) | undefined;
  let originalMatchMedia: PropertyDescriptor | undefined;

  beforeEach(() => {
    prefersDark = false;
    mediaChangeListener = undefined;
    originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: jest.fn(() => ({
        get matches() {
          return prefersDark;
        },
        addEventListener: jest.fn(
          (_event: string, listener: (event: MediaQueryListEvent) => void) => {
            mediaChangeListener = listener;
          },
        ),
        removeEventListener: jest.fn(),
      })),
    });
  });

  afterEach(() => {
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    } else {
      delete (window as Partial<Window>).matchMedia;
    }
  });

  function renderWithActiveTheme(themeId: string | undefined) {
    const activeThemeId = createActiveThemeSubject(themeId);
    const appThemeApi = {
      getInstalledThemes: () => themes,
      getActiveThemeId: () => activeThemeId.value,
      activeThemeId$: () => activeThemeId.asObservable(),
      setActiveThemeId: (id?: string) => activeThemeId.next(id),
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestApiProvider apis={[[appThemeApiRef, appThemeApi]]}>
        {children}
      </TestApiProvider>
    );

    return {
      ...renderHook(() => useIsDarkTheme(), { wrapper }),
      activeThemeId,
    };
  }

  it('uses the OS dark preference when no theme is selected', () => {
    prefersDark = true;

    const { result } = renderWithActiveTheme(undefined);

    expect(result.current).toBe(true);
  });

  it('updates when the OS color-scheme preference changes', () => {
    const { result } = renderWithActiveTheme(undefined);

    expect(result.current).toBe(false);

    act(() => {
      prefersDark = true;
      mediaChangeListener?.({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('updates when the selected theme changes', () => {
    const { result, activeThemeId } = renderWithActiveTheme('light');

    expect(result.current).toBe(false);

    act(() => {
      activeThemeId.next('dark');
    });

    expect(result.current).toBe(true);
  });
});
