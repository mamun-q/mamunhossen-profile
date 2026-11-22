import type { Lang } from './types';

/**
 * Site-wide settings — the knobs a Phase 2 admin dashboard will edit.
 * No secrets belong here; this file ships to the browser.
 */
export interface SiteSettings {
  siteUrl: string;
  brandName: string;
  defaultTheme: 'dark' | 'light';
  defaultLang: Lang;
  contactEmail: string;
}

export const settings: SiteSettings = {
  siteUrl: 'https://mamun-q.github.io/mamunhossen-profile/',
  brandName: 'LIMON',
  defaultTheme: 'dark',
  defaultLang: 'en',
  contactEmail: 'md.mamunhossenlimon@gmail.com',
};
