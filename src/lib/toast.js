// A tiny toast queue: one message at a time, with an optional action (Undo).
let current = null;
let seq = 0;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

/** Shows a message: toast('Cleared Monday.', { action: { label: 'Undo', onClick } }). */
export function toast(message, { action, duration = 6000 } = {}) {
  seq += 1;
  current = { id: seq, message, action, duration };
  emit();
  return seq;
}

/** Dismisses a toast only if it's still the one on screen. */
export function dismissToastId(id) {
  if (current?.id === id) dismissToast();
}
export const dismissToast = () => {
  current = null;
  emit();
};
export const subscribeToast = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getToast = () => current;
