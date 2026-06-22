import { useState, useEffect, useCallback } from 'react';

// ==============================|| HOOKS - LOCAL STORAGE ||============================== //

export function useLocalStorage(key, defaultValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.warn(`Error reading localStorage key "${key}":`, err);
      return defaultValue;
    }
  }, [defaultValue, key]);

  const [state, setState] = useState(readValue);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn(`Error setting localStorage key "${key}":`, err);
    }
  }, [key, state]);

  const setField = useCallback((field, value) => {
    setState((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(defaultValue);

    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  }, [defaultValue, key]);

  return { state, setState, setField, resetState };
}
