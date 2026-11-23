/**
 * Shared types for the content data modules. Every editable record on
 * the site conforms to these shapes — Phase 2's admin dashboard binds
 * to them (and to Supabase tables mirroring them).
 */

export type Lang = 'en' | 'bn';

/** A string localised in English and Bangla. */
export type LText = Record<Lang, string>;

export interface ProfileCard {
  id: string;
  icon: string;
  title: LText;
  body: LText;
}

export interface SkillArea {
  id: string;
  icon: string;
  title: LText;
  description: LText;
}

export interface Project {
  id: string;
  name: string;
  tagline: LText;
  description: LText;
  tech: string[];
  status: LText;
  liveUrl?: string;
  githubUrl?: string;
  /** Optional real product screenshot shown on the card */
  image?: string;
  /** CSS gradient used for the generated project visual */
  gradient: string;
  monogram: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  thumb: string;
  alt: LText;
  category: string;
}

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: string;
}
