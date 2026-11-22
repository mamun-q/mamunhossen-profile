import { Suspense, lazy, useEffect, useState } from 'react';
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

type Route = 'home' | 'cv';

function routeFromHash(): Route {
  return typeof window !== 'undefined' && window.location.hash.startsWith('#/cv') ? 'cv' : 'home';
}

function Site() {
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [, setIntroDone] = useState(false);

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash());
      if (!window.location.hash.startsWith('#/cv')) {
        // Returning home: keep the anchor behaviour for in-page links,
        // but a bare "#/" should land at the top.
        if (window.location.hash === '#/' || window.location.hash === '') {
          window.scrollTo({ top: 0 });
        }
      } else {
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

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
      <Site />
    </PrefsProvider>
  );
}
