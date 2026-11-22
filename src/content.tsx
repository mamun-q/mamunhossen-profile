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

/**
 * Overlay site_content rows onto the local defaults. A row is applied
 * only when its shape is plausible for its module; anything else is
 * ignored so a corrupt row can never blank a section.
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
        if (isRecord(v) && isRecord(v.profile) && Array.isArray(v.cards)) {
          next.profile = v.profile as ProfileData;
          next.profileCards = v.cards as ProfileCard[];
        }
        break;
      case 'projects':
        if (Array.isArray(v)) next.projects = v as Project[];
        break;
      case 'skills':
        if (Array.isArray(v)) next.skills = v as SkillArea[];
        break;
      case 'gallery':
        if (Array.isArray(v)) next.gallery = v as GalleryItem[];
        break;
      case 'achievements':
        if (isRecord(v)) next.digitalWorld = v as unknown as DigitalWorldData;
        break;
      case 'links':
        if (Array.isArray(v)) next.socialLinks = v as SocialLink[];
        break;
      case 'settings':
        if (isRecord(v)) next.settings = v as unknown as SiteSettings;
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
