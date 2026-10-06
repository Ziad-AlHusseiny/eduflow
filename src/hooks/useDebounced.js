import { useEffect, useState } from 'react';

/** `value`, but only after it has stopped changing for `ms` (PRD §4.2: search debounced 200ms). */
export function useDebounced(value, ms = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}
