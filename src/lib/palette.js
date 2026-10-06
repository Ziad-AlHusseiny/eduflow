// The ⌘K command palette's open state (opened from the navbar, the
// keyboard, or a page).
let open = false;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());
export const openPalette = () => {
  open = true;
  emit();
};
export const closePalette = () => {
  open = false;
  emit();
};
export const isPaletteOpen = () => open;
export const subscribePalette = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
