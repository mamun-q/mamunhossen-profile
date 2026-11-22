import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  digitalWorld as localWorld,
  gallery as localGallery,
  profile as localProfile,
  profileCards as localCards,
  projects as localProjects,
  settings as localSettings,
  skills as localSkills,
  socialLinks as localLinks,
} from './data';
import type {
  GalleryItem,
  ProfileCard,
  Project,
  SiteSettings,
  SkillArea,
  SocialLink,
} from './data';

/**
 * Content layer (Phase 2). Components read ALL editable content from
 * useContent() — never from the data modules directly.
 *
 * The provider initialises synchronously from the local src/data
 * modules, then fetches the site_content rows from Supabase and swaps
 * in any row that is present and structurally parseable. Any failure
 * (offline, tables missing, bad row) silently keeps the local data:
 * the public site must never break or blank because of the backend.
 */

export type ProfileData = typeof localProfile;
export type DigitalWorldData = typeof localWorld;

export interface SiteContent {
  profile: ProfileData;
  profileCards: ProfileCard[];
  projects: Project[];
  skills: SkillArea[];
  gallery: GalleryItem[];
  digitalWorld: DigitalWorldData;
  socialLinks: SocialLink[];
  settings: SiteSettings;
}

export const LOCAL_CONTENT: SiteContent = {
  profile: localProfile,
  profileCards: localCards,
  projects: localProjects,
  skills: localSkills,
  gallery: localGallery,
  digitalWorld: localWorld,
  socialLinks: localLinks,
  settings: localSettings,
};

/** Keys of the site_content table — one row per content module. */
export type ContentKey =
  | 'profile'
  | 'projects'
  | 'skills'
  | 'gallery'
  | 'achievements'
  | 'links'
  | 'settings';

export const CONTENT_KEYS: ContentKey[] = [
  'profile',
  'projects',
  'skills',
  'gallery',
  'achievements',
  'links',
  'settings',
];

/** The site_content row value for a module, from a SiteContent object. */
export function moduleValue(content: SiteContent, key: ContentKey): unknown {
  switch (key) {
    case 'profile':
      return { profile: content.profile, cards: content.profileCards };
    case 'projects':
      return content.projects;
    case 'skills':
      return content.skills;
    case 'gallery':
      return content.gallery;
    case 'achievements':
      return content.digitalWorld;
    case 'links':
      return content.socialLinks;
    case 'settings':
      return content.settings;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// ---------------------------------------------------------------------
// Deep shape sanitising (audit fix H1, 2026-11-23). The old overlay
// checked only the top level of each row and cast the rest — a single
// partial row (a project without `tech`, a profile without
// `location`) crashed the whole page, because components read nested
// fields directly. Now every field a component can touch is validated
// against the local default's kind: a bad field falls back to the
// local value, a bad list item is dropped, and a list with no valid
// items keeps the local list. A corrupt row can now degrade a section
// to its built-in content — never blank the site.
// ---------------------------------------------------------------------
type LTextShape = { en: string; bn: string };

function isLText(v: unknown): v is LTextShape {
  return isRecord(v) && typeof v.en === 'string' && typeof v.bn === 'string';
}

function asStr(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback;
}

function asLText(v: unknown, fallback: LTextShape): LTextShape {
  return isLText(v) ? { en: v.en, bn: v.bn } : fallback;
}

function asStrList(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  return v.filter((x): x is string => typeof x === 'string');
}

function asLTextList(v: unknown, fallback: LTextShape[]): LTextShape[] {
  if (!Array.isArray(v)) return fallback;
  const out = v.filter(isLText).map((t) => ({ en: t.en, bn: t.bn }));
  return out.length ? out : fallback;
}

/** Keep only the items that pass `clean` (null = drop); empty → fallback. */
function asItemList<T>(v: unknown, fallback: T[], clean: (item: unknown) => T | null): T[] {
  if (!Array.isArray(v)) return fallback;
  const out = v.map(clean).filter((x): x is T => x !== null);
  return out.length ? out : fallback;
}

const EMPTY_LTEXT: LTextShape = { en: '', bn: '' };

function cleanProfile(v: unknown, base: ProfileData): ProfileData {
  if (!isRecord(v)) return base;
  return {
    brandName: asStr(v.brandName, base.brandName),
    fullName: asStr(v.fullName, base.fullName),
    role: asLText(v.role, base.role),
    tagline: asLText(v.tagline, base.tagline),
    banglaLine: asStr(v.banglaLine, base.banglaLine),
    location: asLText(v.location, base.location),
    email: asStr(v.email, base.email),
    avatarUrl: asStr(v.avatarUrl, base.avatarUrl),
    portraitUrl: asStr(v.portraitUrl, base.portraitUrl),
    siteUrl: asStr(v.siteUrl, base.siteUrl),
    intro: asLText(v.intro, base.intro),
  };
}

function cleanCard(item: unknown): ProfileCard | null {
  if (!isRecord(item) || typeof item.id !== 'string' || !item.id) return null;
  if (!isLText(item.title) || !isLText(item.body)) return null;
  return { id: item.id, icon: asStr(item.icon, 'user'), title: { en: item.title.en, bn: item.title.bn }, body: { en: item.body.en, bn: item.body.bn } };
}

function cleanProject(item: unknown): Project | null {
  if (!isRecord(item) || typeof item.id !== 'string' || !item.id) return null;
  if (typeof item.name !== 'string' || !isLText(item.tagline) || !isLText(item.description)) return null;
  return {
    id: item.id,
    name: item.name,
    tagline: { en: item.tagline.en, bn: item.tagline.bn },
    description: { en: item.description.en, bn: item.description.bn },
    tech: asStrList(item.tech, []),
    status: isLText(item.status) ? { en: item.status.en, bn: item.status.bn } : EMPTY_LTEXT,
    ...(typeof item.liveUrl === 'string' && item.liveUrl ? { liveUrl: item.liveUrl } : {}),
    ...(typeof item.githubUrl === 'string' && item.githubUrl ? { githubUrl: item.githubUrl } : {}),
    gradient: asStr(item.gradient, ''),
    monogram: asStr(item.monogram, ''),
  };
}

function cleanSkill(item: unknown): SkillArea | null {
  if (!isRecord(item) || typeof item.id !== 'string' || !item.id) return null;
  if (!isLText(item.title) || !isLText(item.description)) return null;
  return { id: item.id, icon: asStr(item.icon, 'sparkles'), title: { en: item.title.en, bn: item.title.bn }, description: { en: item.description.en, bn: item.description.bn } };
}

function cleanGalleryItem(item: unknown): GalleryItem | null {
  if (!isRecord(item) || typeof item.id !== 'string' || !item.id) return null;
  if (typeof item.src !== 'string' || !item.src || !isLText(item.alt)) return null;
  return {
    id: item.id,
    src: item.src,
    thumb: asStr(item.thumb, item.src),
    alt: { en: item.alt.en, bn: item.alt.bn },
    category: asStr(item.category, 'Portrait'),
  };
}

function cleanLink(item: unknown): SocialLink | null {
  if (!isRecord(item) || typeof item.id !== 'string' || !item.id) return null;
  if (typeof item.label !== 'string' || typeof item.href !== 'string') return null;
  return { id: item.id, label: item.label, href: item.href, icon: asStr(item.icon, 'globe') };
}

function cleanWorld(v: unknown, base: DigitalWorldData): DigitalWorldData {
  if (!isRecord(v)) return base;
  return {
    activities: asLTextList(v.activities, base.activities),
    achievements: asLTextList(v.achievements, base.achievements),
    interests: asLTextList(v.interests, base.interests),
    futurePlans: asLTextList(v.futurePlans, base.futurePlans),
  };
}

function cleanSettings(v: unknown, base: SiteSettings): SiteSettings {
  if (!isRecord(v)) return base;
  return {
    siteUrl: asStr(v.siteUrl, base.siteUrl),
    brandName: asStr(v.brandName, base.brandName),
    defaultTheme: v.defaultTheme === 'light' || v.defaultTheme === 'dark' ? v.defaultTheme : base.defaultTheme,
    defaultLang: v.defaultLang === 'bn' || v.defaultLang === 'en' ? v.defaultLang : base.defaultLang,
    contactEmail: asStr(v.contactEmail, base.contactEmail),
  };
}

/**
 * Overlay site_content rows onto the local defaults, deep-sanitising
 * every module (see above). Rows whose top level is the wrong kind
 * are ignored entirely.
 */
export function contentFromRows(
  rows: { key: string; value: unknown }[],
  base: SiteContent = LOCAL_CONTENT,
): SiteContent {
  const next: SiteContent = { ...base };
  for (const row of rows) {
    const v = row.value;
    switch (row.key) {
      case 'profile':
        if (isRecord(v)) {
          if (isRecord(v.profile)) next.profile = cleanProfile(v.profile, base.profile);
          if (Array.isArray(v.cards)) next.profileCards = asItemList(v.cards, base.profileCards, cleanCard);
        }
        break;
      case 'projects':
        if (Array.isArray(v)) next.projects = asItemList(v, base.projects, cleanProject);
        break;
      case 'skills':
        if (Array.isArray(v)) next.skills = asItemList(v, base.skills, cleanSkill);
        break;
      case 'gallery':
        if (Array.isArray(v)) next.gallery = asItemList(v, base.gallery, cleanGalleryItem);
        break;
      case 'achievements':
        if (isRecord(v)) next.digitalWorld = cleanWorld(v, base.digitalWorld);
        break;
      case 'links':
        if (Array.isArray(v)) next.socialLinks = asItemList(v, base.socialLinks, cleanLink);
        break;
      case 'settings':
        if (isRecord(v)) next.settings = cleanSettings(v, base.settings);
        break;
      default:
        break;
    }
  }
  return next;
}

const ContentContext = createContext<SiteContent>(LOCAL_CONTENT);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(LOCAL_CONTENT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { getSupabase } = await import('./lib/supabase');
        const supabase = getSupabase();
        const { data, error } = await supabase.from('site_content').select('key, value');
        if (cancelled || error || !data) return; // keep local content
        setContent(contentFromRows(data as { key: string; value: unknown }[]));
      } catch {
        /* offline / backend unavailable — local content stays */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => content, [content]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): SiteContent {
  return useContext(ContentContext);
}
