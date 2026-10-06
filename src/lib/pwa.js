// The service worker makes EduFlow work offline (scripts/sw.template.js):
// lessons you've opened or downloaded, your notes and progress, on a train
// with no signal. Registered after load, so it never competes with the first paint.

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  const register = () => navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  if (document.readyState === 'complete') setTimeout(register, 1500);
  else window.addEventListener('load', () => setTimeout(register, 1500), { once: true });
}
