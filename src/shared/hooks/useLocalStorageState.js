import { useState, useCallback, useEffect } from "react";

const PREFIX = "token:v1:";

function readKey(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeKey(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or disabled */
  }
}

export function useLocalStorageState(key, initial) {
  const [value, setValue] = useState(() => readKey(key, initial));

  const setAndPersist = useCallback((updater) => {
    setValue(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeKey(key, next);
      return next;
    });
  }, [key]);

  useEffect(() => {
    writeKey(key, value);
  }, [key, value]);

  return [value, setAndPersist];
}

export function getStoredValue(key, fallback) {
  return readKey(key, fallback);
}

export function setStoredValue(key, value) {
  writeKey(key, value);
}
