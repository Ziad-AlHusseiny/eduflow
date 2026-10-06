import { useEffect, useState } from 'react';

/** The current time, refreshed every `ms` (a stable value while prerendering). */
export function useNow(ms = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
