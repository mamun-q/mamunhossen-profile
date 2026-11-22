import type { SocialLink } from './types';
import { profile } from './profile';

/** Public presence links. WhatsApp is intentionally NOT published
 *  (owner's instruction). */
export const socialLinks: SocialLink[] = [
  { id: 'meetbook', label: 'MeetBook', href: 'https://mamun-q.github.io/MeetBook/', icon: 'meetbook' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/mamun-q', icon: 'github' },
  { id: 'website', label: 'Personal Site', href: profile.siteUrl, icon: 'globe' },
  { id: 'email', label: 'Email', href: `mailto:${profile.email}`, icon: 'mail' },
];
