import type { GalleryItem } from './types';
import { profile } from './profile';

/** Photo gallery records — starts with the owner's portrait; the grid
 *  and full-screen viewer are ready for more photos as he adds them. */
export const gallery: GalleryItem[] = [
  {
    id: 'portrait-1',
    src: profile.portraitUrl,
    thumb: profile.avatarUrl,
    alt: {
      en: 'Limon — Mamun Hossen Limon, portrait outdoors in Jessore',
      bn: 'লিমন — মামুন হোসেন লিমন, যশোরে বাইরের প্রতিকৃতি',
    },
    category: 'Portrait',
  },
];
