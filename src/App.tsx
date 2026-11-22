import { Suspense, lazy, useEffect, useState } from 'react';
import { ContentProvider } from './content';
import { PrefsProvider } from './prefs';
import { BackToTop, CustomCursor, Footer, Loader, Nav } from './components/Chrome';
import Hero from './components/Hero';
import { ProfileSection, SkillsSection, WorldSection } from './components/Sections';
import ProjectsSection from './components/Projects';

// Below-the-fold and routed views are code-split to keep the first
// mobile load light.
const GallerySection = lazy(() => import('./components/Gallery'));
const ContactSection = lazy(() => import('./components/Contact'));
const CvView = lazy(() => import('./components/CvView'));
// The admin dashboard (and supabase-js with it) loads only on #/admin.
const AdminApp = lazy(() => import('./admin/Admin'));

type Route = 'home' | 'cv' | 'admin';

function routeFromHash(): Route {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash;
  if (hash.startsWith('#/admin')) return 'admin';
  if (hash.startsWith('#/cv')) return 'cv';
  return 'home';
}

function Site() {
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [, setIntroDone] = useState(false);

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash());
      if (window.location.hash.startsWith('#/cv') || window.location.hash.startsWith('#/admin')) {
        window.scrollTo({ top: 0 });
      } else if (window.location.hash === '#/' || window.location.hash === '') {
        // Returning home: keep the anchor behaviour for in-page links,
        // but a bare "#/" should land at the top.
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route === 'admin') {
    return (
      <div className="min-h-svh bg-slate-50 text-slate-800 transition-colors duration-500 dark:bg-ink dark:text-slate-100">
        <Suspense fallback={null}>
          <AdminApp />
        </Suspense>
      </div>
    );
  }

  if (route === 'cv') {
    return (
      <main>
        <Suspense fallback={null}>
          <CvView />
        </Suspense>
      </main>
    );
  }

  return (
    <div className="min-h-svh bg-slate-50 text-slate-800 transition-colors duration-500 dark:bg-ink dark:text-slate-100">
      <Loader done={() => setIntroDone(true)} />
      <CustomCursor />
      <Nav />
      <main>
        <Hero />
        <ProfileSection />
        <SkillsSection />
        <ProjectsSection />
        <WorldSection />
        <Suspense fallback={null}>
          <GallerySection />
          <ContactSection />
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default function App() {
  return (
    <PrefsProvider>
      <ContentProvider>
        <Site />
      </ContentProvider>
    </PrefsProvider>
  );
}
