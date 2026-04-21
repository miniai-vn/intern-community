"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a value — waits for `delay` ms after the value stops changing
 * before updating the returned state.
 * Useful for search inputs, filter changes, etc.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
