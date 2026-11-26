import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { settings, ui } from './data';
import type { Lang, UiKey } from './data';

type Theme = 'dark' | 'light';

interface Prefs {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: UiKey) => string;
}

const PrefsContext = createContext<Prefs | null>(null);

function readLang(): Lang {
  try {
    const stored = localStorage.getItem('limon-lang');
    if (stored === 'bn' || stored === 'en') return stored;
  } catch {
    /* storage unavailable */
  }
  // First visit: auto-pick from the visitor's device/browser language —
  // Bangla devices get Bangla, everyone else gets English.
  try {
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('bn')) return 'bn';
    if (nav) return 'en';
  } catch {
    /* navigator unavailable */
  }
  return settings.defaultLang;
}

function readTheme(): Theme {
  // The inline script in index.html has already applied the class.
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);
  const [theme, setThemeState] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('limon-lang', l);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'en' ? 'bn' : 'en';
      try {
        localStorage.setItem('limon-lang', next);
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        localStorage.setItem('limon-theme', next);
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const t = useCallback((key: UiKey) => ui[lang][key], [lang]);

  const value = useMemo<Prefs>(
    () => ({ lang, setLang, toggleLang, theme, toggleTheme, t }),
    [lang, setLang, toggleLang, theme, toggleTheme, t],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider');
  return ctx;
}
