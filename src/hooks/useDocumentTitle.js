import { useEffect } from 'react';

/** Sets the tab title after client-side navigation (the prerendered head already has it). */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
