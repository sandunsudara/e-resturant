import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

// project imports
import config from 'config';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { deepMerge } from 'utils/colorUtils';

const THEME_CONFIG_STORAGE_KEY = 'theme-config';
const THEME_CONFIG_URL = '';

// ==============================|| CONFIG CONTEXT ||============================== //

export const ConfigContext = createContext(undefined);

function getThemeConfigPayload(payload) {
  if (!payload || typeof payload !== 'object') return {};

  return payload.themeConfig || payload.theme || payload.data?.themeConfig || payload.data?.theme || payload.data || payload;
}

// ==============================|| CONFIG PROVIDER ||============================== //

export function ConfigProvider({ children }) {
  const { state: storedConfig, setState, resetState } = useLocalStorage(THEME_CONFIG_STORAGE_KEY, config);
  const [remoteStatus, setRemoteStatus] = useState({ loading: false, error: null });

  const state = useMemo(() => deepMerge(config, storedConfig), [storedConfig]);

  const setConfig = useCallback(
    (nextConfig) => {
      setState((prevConfig) => {
        const currentConfig = deepMerge(config, prevConfig);
        const nextValue = typeof nextConfig === 'function' ? nextConfig(currentConfig) : nextConfig;

        return deepMerge(currentConfig, getThemeConfigPayload(nextValue));
      });
    },
    [setState]
  );

  const setField = useCallback(
    (field, value) => {
      setConfig({ [field]: value });
    },
    [setConfig]
  );

  useEffect(() => {
    if (!THEME_CONFIG_URL) return undefined;

    const controller = new AbortController();

    async function loadRemoteConfig() {
      setRemoteStatus({ loading: true, error: null });

      try {
        const response = await fetch(THEME_CONFIG_URL, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Theme config request failed with ${response.status}`);
        }

        const remoteConfig = await response.json();
        setConfig(remoteConfig);
        setRemoteStatus({ loading: false, error: null });
      } catch (error) {
        if (error.name === 'AbortError') return;

        console.warn('Unable to load remote theme config:', error);
        setRemoteStatus({ loading: false, error });
      }
    }

    loadRemoteConfig();

    return () => controller.abort();
  }, [setConfig]);

  const memoizedValue = useMemo(
    () => ({ state, setConfig, setField, resetState, remoteStatus }),
    [remoteStatus, resetState, setConfig, setField, state]
  );

  return <ConfigContext.Provider value={memoizedValue}>{children}</ConfigContext.Provider>;
}
