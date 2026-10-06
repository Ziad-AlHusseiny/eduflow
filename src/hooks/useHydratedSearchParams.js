import { useSearchParams } from 'react-router-dom';
import { useHydrated } from './useMedia.js';

const EMPTY = new URLSearchParams();

/**
 * useSearchParams(), but empty while hydrating: only the bare page is
 * prerendered, so a shared link with filters (/courses?level=beginner)
 * first hydrates the unfiltered HTML, then applies its filters.
 */
export function useHydratedSearchParams() {
  const hydrated = useHydrated();
  const [params, setParams] = useSearchParams();
  return [hydrated ? params : EMPTY, setParams];
}
