import { use, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout.jsx';
import { pageLoaders } from './routes.js';

// Every page is its own chunk. The prerendered HTML already shows the page,
// and it hydrates as soon as its chunk arrives.
/** Marks <html data-hydrated> once the page itself has hydrated (pages
 * hydrate after the layout; tests and nothing else wait for it). */
function PageReady() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true';
    document.documentElement.dataset.ready = location.pathname;
  }, [pathname]);
  return null;
}

// A page whose chunk is already loaded (before hydration) renders directly,
// so hydration never suspends on it.
const P = Object.fromEntries(
  Object.entries(pageLoaders).map(([k, load]) => {
    // `use()` rather than React.lazy: lazy keeps a failed import forever,
    // while the loader forgets it, so the error boundary's retry works.
    const Page = (props) => {
      const C = load.loaded()?.default ?? use(load()).default;
      return (
        <>
          <C {...props} />
          <PageReady />
        </>
      );
    };
    Page.displayName = `Page(${k})`;
    return [k, Page];
  }),
);

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<P.home />} />
        <Route path="courses" element={<P.courses />} />
        <Route path="courses/:id" element={<P.course />} />
        <Route path="courses/:id/checkpoint/:sectionId" element={<P.assessment />} />
        <Route path="courses/:id/final" element={<P.assessment />} />
        <Route path="courses/:id/certificate" element={<P.certificate />} />
        <Route path="lesson/:courseId/:lessonId" element={<P.lesson />} />
        <Route path="learning" element={<P.learning />} />
        <Route path="review" element={<P.review />} />
        <Route path="notes" element={<P.notes />} />
        <Route path="stats" element={<P.stats />} />
        <Route path="paths" element={<P.paths />} />
        <Route path="paths/:id" element={<P.path />} />
        <Route path="placement" element={<P.placement />} />
        <Route path="glossary" element={<P.glossary />} />
        <Route path="instructors" element={<P.instructors />} />
        <Route path="instructors/:id" element={<P.instructor />} />
        <Route path="privacy" element={<P.privacy />} />
        <Route path="*" element={<P.notFound />} />
      </Route>
    </Routes>
  );
}
