import { Component, Suspense, lazy, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ContentProvider } from './content';
import { PrefsProvider } from './prefs';
import { BackToTop, CustomCursor, Footer, Nav } from './components/Chrome';
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
  // Audit fix L10: exact routes only — '#/cvx' or '#/administrator'
  // used to render the CV / admin sign-in.
  if (hash === '#/admin' || hash === '#/admin/') return 'admin';
  if (hash === '#/cv' || hash === '#/cv/') return 'cv';
  return 'home';
}

/**
 * Last-resort render guard (audit H1, second line of defence): if any
 * section ever throws while rendering, show a recoverable message
 * instead of a white screen.
 */
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <main className="flex min-h-svh items-center justify-center px-4 text-center">
          <div>
            <p className="text-lg font-semibold">Something went wrong while loading this page.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-gradient-to-r from-brand to-brand2 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Reload
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

function Site() {
  const [route, setRoute] = useState<Route>(routeFromHash);

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
      {/* No intro/loader overlay: on Limon's phone a full-screen
          intro layer left the page unresponsive until reload
          (2026-11-23). The site now opens directly — do not
          re-add a blocking intro. */}
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
        <ErrorBoundary>
          <Site />
        </ErrorBoundary>
      </ContentProvider>
    </PrefsProvider>
  );
}
