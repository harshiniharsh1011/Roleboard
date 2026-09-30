import { useState, useEffect } from "react";

/** Persist simple JSON-serializable state in localStorage under `key`. */
export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage full/unavailable — fail silently, feature is a convenience only
    }
  }, [key, state]);

  return [state, setState];
}
