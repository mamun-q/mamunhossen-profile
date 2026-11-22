import type { LText } from './types';

/**
 * "My Digital World" content. Truthful, neutral statements only —
 * the achievements list restates work that has actually shipped
 * (MeetBook live, a working voice assistant, its AI companions);
 * no invented milestones, awards or numbers.
 */
export const digitalWorld = {
  activities: [
    { en: 'Building MeetBook, my social platform', bn: 'আমার সোশ্যাল প্ল্যাটফর্ম MeetBook গড়ছি' },
    { en: 'Developing Limon AI, my voice assistant', bn: 'আমার ভয়েস অ্যাসিস্ট্যান্ট Limon AI বানাচ্ছি' },
    { en: 'Designing new product ideas', bn: 'নতুন প্রোডাক্টের আইডিয়া ডিজাইন করছি' },
    { en: 'Learning & experimenting with AI', bn: 'AI নিয়ে শিখছি আর পরীক্ষা করছি' },
  ] as LText[],
  achievements: [
    { en: 'Shipped MeetBook live to the web', bn: 'MeetBook ওয়েবে লাইভ করেছি' },
    { en: 'Built a working Android voice assistant', bn: 'একটি কার্যকর Android ভয়েস অ্যাসিস্ট্যান্ট বানিয়েছি' },
    { en: 'Created an ecosystem of AI companions on MeetBook', bn: 'MeetBook-এ AI সঙ্গীদের একটি ecosystem তৈরি করেছি' },
  ] as LText[],
  interests: [
    { en: 'Technology', bn: 'প্রযুক্তি' },
    { en: 'Artificial Intelligence', bn: 'কৃত্রিম বুদ্ধিমত্তা' },
    { en: 'Product Building', bn: 'প্রোডাক্ট নির্মাণ' },
    { en: 'Design', bn: 'ডিজাইন' },
  ] as LText[],
  futurePlans: [
    { en: 'Grow MeetBook and its community', bn: 'MeetBook ও তার কমিউনিটি বড় করা' },
    { en: 'Keep building useful free tools', bn: 'দরকারি ফ্রি টুল বানিয়ে যাওয়া' },
    { en: 'Bring MeetBook to its own domain and a bigger audience', bn: 'MeetBook-কে নিজের ডোমেইনে ও বড় দর্শকের কাছে নেওয়া' },
  ] as LText[],
};
