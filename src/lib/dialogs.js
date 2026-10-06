// The page behind open dialogs doesn't scroll. Counted, so one dialog can
// open as another closes: the page scrolls again only when none is left.
let openCount = 0;
export const lockScroll = () => {
  openCount += 1;
  document.documentElement.style.overflow = 'hidden';
};
export const unlockScroll = () => {
  openCount = Math.max(0, openCount - 1);
  if (!openCount) document.documentElement.style.overflow = '';
};

/** Puts focus back where it was before a dialog opened (or on the page's main region if that's gone). */
export function restoreFocus(opener) {
  const target = opener && opener !== document.body && opener.isConnected ? opener : document.getElementById('main');
  target?.focus({ preventScroll: true });
}
