import { useState, useEffect } from 'react';

/**
 * Manages boolean disclosure state for modals, sheets, dropdowns, and collapsible panels.
 *
 * Encapsulates standard open/close/toggle transitions and exposes both discrete action
 * helpers and direct state setter to avoid repetitive boolean state definitions across UI components.
 *
 * @param initialState - Initial visibility state. Defaults to `false` (closed).
 * @returns An object containing current boolean state (`isOpen`), convenience mutators (`open`, `close`, `toggle`), and direct setter (`setIsOpen`).
 *
 * @example
 * const { isOpen, open, close, toggle } = useDisclosure(false);
 * open(); // sets isOpen -> true
 */
export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);
  return { isOpen, open, close, toggle, setIsOpen };
}

/**
 * Debounces rapidly changing input values to prevent excessive calculations, API queries, or re-renders.
 *
 * Establishes a timer that delays updating the output value until `delayMs` milliseconds have elapsed
 * without new input updates. Automatically cancels previous in-flight timeouts on unmount or when
 * `value` / `delayMs` changes, guaranteeing no stale updates or memory leaks occur.
 *
 * @param value - Fast-changing source value (e.g. search query string, filter state, form inputs).
 * @param delayMs - Debounce window duration in milliseconds. Defaults to 250ms.
 * @returns The debounced value, matching `value` once the quiet window elapses.
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * // 'search' typed at t=0 -> debouncedSearch updates at t=300ms if no further changes
 */
export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
