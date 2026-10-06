import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import Root from './Root.jsx';
import { loadPageText } from './i18n/content.js';
import { loadDictionary } from './i18n/index.js';
import { appPath, localeFromPath, setActiveLocale } from './i18n/state.js';
import { preload } from './lib/resources.js';
import { registerServiceWorker } from './lib/pwa.js';
import { pageLoaders, pageOf, resourcesFor } from './routes.js';
import './index.css';

// The page's language comes from its address: /… is English, /ar/… Arabic.
// Every page is prerendered, so the app hydrates the HTML that's already
// painted — but only once the page's chunk, its text and its content are
// here, so hydration never meets a suspended page (which would swap the
// painted HTML for a fallback). No top-level await: page chunks import this
// entry, and awaiting them at the top level would deadlock.
const locale = localeFromPath(location.pathname);
const path = appPath(location.pathname);

async function boot() {
  const page = pageOf(path);
  let chunkFailed = false;
  await Promise.all([pageLoaders[page]().catch(() => (chunkFailed = true)), loadDictionary(locale), loadPageText(page, locale), ...resourcesFor(path, locale).map(preload)]);
  setActiveLocale(locale);
  const container = document.getElementById('root');
  const app = (
    <StrictMode>
      <Root />
    </StrictMode>
  );
  // Hydrate only HTML rendered for this exact page and language (the offline
  // fallback and 404.html serve another page's HTML: render fresh).
  const prerendered = container.dataset.locale === locale && container.dataset.path === (path.replace(/\/+$/, '') || '/');
  // The page's code didn't arrive (offline, or a deploy replaced it): the
  // painted HTML is still readable, so leave it rather than swap it for an error.
  if (chunkFailed && container.firstElementChild && prerendered) return registerServiceWorker();
  if (container.firstElementChild && prerendered) hydrateRoot(container, app);
  else createRoot(container).render(app);
  registerServiceWorker();
}
boot();

// Warm the main pages' chunks once the page has loaded and the browser is idle.
const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1));
const warm = () => setTimeout(() => idle(() => ['courses', 'course', 'lesson', 'learning'].forEach((k) => pageLoaders[k]().catch(() => {}))), 2500);
if (document.readyState === 'complete') warm();
else window.addEventListener('load', warm, { once: true });
