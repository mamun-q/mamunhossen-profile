import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContent } from '../content';
import { usePrefs } from '../prefs';
import { Icon } from './icons';

/* ---------------- Reveal: scroll-triggered entrance ---------------- */

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-[#0b5ed7] dark:text-goldsoft">
        {kicker}
      </p>
      <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        {title}
      </h2>
      <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-brand via-gold to-brand2" />
    </Reveal>
  );
}

/* ---------------- Loading intro ---------------- */

export function Loader({ done }: { done: () => void }) {
  const { t } = usePrefs();
  const { profile, settings } = useContent();
  const brand = settings.brandName || profile.brandName;
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem('limon-intro');
    } catch {
      return true;
    }
  });
  const [leaving, setLeaving] = useState(false);

  // Hardened 2026-11-23 after Limon's phone report (buttons dead
  // until reload): the intro is a full-screen overlay, and its old
  // removal depended on framer-motion's exit animation completing.
  // If that stalls on a phone, the invisible overlay eats every tap
  // and only a reload (which skips the intro via sessionStorage)
  // frees the page. Now dismissal is plain timers + CSS: touches are
  // released the moment fading starts, unmount is timer-guaranteed,
  // and tapping the intro skips it instantly.
  useEffect(() => {
    if (!show) {
      done();
      return;
    }
    const fade = setTimeout(() => setLeaving(true), 1400);
    const unmount = setTimeout(() => {
      try {
        sessionStorage.setItem('limon-intro', '1');
      } catch {
        /* ignore */
      }
      setShow(false);
      done();
    }, 1750);
    return () => {
      clearTimeout(fade);
      clearTimeout(unmount);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  const skip = () => {
    try {
      sessionStorage.setItem('limon-intro', '1');
    } catch {
      /* ignore */
    }
    setLeaving(true);
    setTimeout(() => {
      setShow(false);
      done();
    }, 120);
  };

  return (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink transition-opacity duration-300 ${
            leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
          onClick={skip}
        >
          <div className="flex overflow-hidden">
            {brand.split('').map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-gradient text-6xl font-bold tracking-[0.08em] sm:text-7xl"
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-4 text-xs tracking-[0.25em] text-slate-400 uppercase"
          >
            {t('loadingTag')}
          </motion.p>
          <div className="mt-8 h-[3px] w-44 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand2"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 1.15, ease: 'easeInOut' }}
            />
          </div>
        </div>
  );
}

/* ---------------- Custom cursor (fine pointers only) ---------------- */

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      const target = e.target as HTMLElement | null;
      ring.classList.toggle('is-active', !!target?.closest('a, button, input, textarea, [data-hover]'));
    };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}

/* ---------------- Navigation ---------------- */

const NAV_ITEMS = [
  { id: 'home', key: 'navHome' },
  { id: 'about', key: 'navAbout' },
  { id: 'skills', key: 'navSkills' },
  { id: 'projects', key: 'navProjects' },
  { id: 'world', key: 'navWorld' },
  { id: 'gallery', key: 'navGallery' },
  { id: 'contact', key: 'navContact' },
] as const;

export function Nav() {
  const { t, lang, toggleLang, theme, toggleTheme } = usePrefs();
  const { profile, settings } = useContent();
  const brand = settings.brandName || profile.brandName;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    // Audit fix M3: Gallery and Contact are lazy chunks — their
    // sections do not exist when this effect first runs, so a one-shot
    // scan never observed them and their nav links never highlighted.
    // Keep scanning (cheap: 7 id lookups) until every section exists.
    const observed = new Set<string>();
    let mo: MutationObserver | null = null;
    const scan = () => {
      for (const item of NAV_ITEMS) {
        if (observed.has(item.id)) continue;
        const el = document.getElementById(item.id);
        if (el) {
          observed.add(item.id);
          io.observe(el);
        }
      }
      if (observed.size === NAV_ITEMS.length && mo) mo.disconnect();
    };
    scan();
    mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    const stop = setTimeout(() => mo?.disconnect(), 15000);
    return () => {
      io.disconnect();
      mo?.disconnect();
      clearTimeout(stop);
    };
  }, []);

  const linkCls = (id: string) =>
    `rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
      active === id
        ? 'text-brand dark:text-white dark:bg-white/10 bg-brand/10'
        : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-[0_12px_40px_-18px_rgba(2,6,23,0.45)]' : 'bg-transparent'
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
        aria-label="Main"
      >
        <a href="#home" className="font-display flex items-center gap-2.5" aria-label="LIMON — home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand2 font-bold text-white shadow-lg shadow-brand/30">
            L
          </span>
          <span className="text-lg font-bold tracking-[0.18em] text-slate-900 dark:text-white">
            {brand}
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={linkCls(item.id)}>
              {t(item.key)}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className="glass flex h-11 items-center rounded-full px-3.5 text-xs font-semibold text-slate-700 transition hover:scale-105 dark:text-slate-100"
            aria-label={lang === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
          >
            {lang === 'en' ? 'বাংলা' : 'EN'}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="glass flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition hover:scale-105 dark:text-amber-200"
            aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="glass flex h-11 w-11 items-center justify-center rounded-full text-slate-700 lg:hidden dark:text-slate-100"
            aria-label={open ? t('close') : t('menu')}
            aria-expanded={open}
          >
            <Icon name={open ? 'x' : 'menu'} className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="glass overflow-hidden lg:hidden"
            aria-label="Mobile"
          >
            <div className="space-y-1 px-4 py-4">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-base font-medium ${
                    active === item.id
                      ? 'bg-brand/10 text-brand dark:bg-white/10 dark:text-white'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {t(item.key)}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------------- Back to top ---------------- */

export function BackToTop() {
  const { t } = usePrefs();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 650);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="btn-glow fixed right-5 bottom-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand2 text-white"
          aria-label={t('backToTop')}
        >
          <Icon name="arrowUp" className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Footer ---------------- */

export function Footer() {
  const { t, lang } = usePrefs();
  const { profile, socialLinks, settings } = useContent();
  const brand = settings.brandName || profile.brandName;
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = settings.siteUrl;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'LIMON — Mamun Hossen Limon', url });
        return;
      }
      throw new Error('no native share');
    } catch (err) {
      // Audit fix L4: a visitor CANCELLING the native share sheet
      // (AbortError) must not fall through to "Link copied!".
      if (err instanceof DOMException && err.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* clipboard unavailable */
      }
    }
  };

  return (
    <footer className="border-t border-slate-900/8 dark:border-white/8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center sm:px-6">
        <a href="#home" className="font-display text-xl font-bold tracking-[0.2em] text-slate-900 dark:text-white">
          {brand}
        </a>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{profile.tagline[lang]}</p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {socialLinks.map((l) => (
            <a
              key={l.id}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel={l.href.startsWith('http') ? 'noreferrer' : undefined}
              className="glass flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition hover:scale-110 hover:text-brand dark:text-slate-300 dark:hover:text-white"
              aria-label={l.label}
            >
              <Icon name={l.icon} className="h-[18px] w-[18px]" />
            </a>
          ))}
          <button
            type="button"
            onClick={share}
            className="glass flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-slate-600 transition hover:scale-105 hover:text-brand dark:text-slate-300 dark:hover:text-white"
            aria-label={t('share')}
          >
            <Icon name={copied ? 'check' : 'share'} className="h-[18px] w-[18px]" />
            {copied ? t('shareCopied') : t('share')}
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {profile.fullName} · {profile.location[lang]} · {t('footerNote')}
        </p>
      </div>
    </footer>
  );
}
