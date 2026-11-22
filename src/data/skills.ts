import type { SkillArea } from './types';

/** Expertise areas — cards with descriptions, deliberately no
 *  percentage bars or invented proficiency numbers. */
export const skills: SkillArea[] = [
  {
    id: 'technology',
    icon: 'cpu',
    title: { en: 'Technology', bn: 'প্রযুক্তি' },
    description: {
      en: 'A deep love for how things work — systems, platforms and the tools that power the modern web.',
      bn: 'জিনিসপত্র কীভাবে কাজ করে তার প্রতি গভীর আগ্রহ — সিস্টেম, প্ল্যাটফর্ম আর আধুনিক ওয়েবকে চালানো টুলগুলো।',
    },
  },
  {
    id: 'creativity',
    icon: 'palette',
    title: { en: 'Digital Creativity', bn: 'ডিজিটাল সৃজনশীলতা' },
    description: {
      en: 'Turning raw ideas into polished digital experiences, with a strong sense of design and detail.',
      bn: 'কাঁচা আইডিয়াকে নিখুঁত ডিজিটাল অভিজ্ঞতায় রূপ দেওয়া — ডিজাইন আর খুঁটিনাটির প্রতি তীক্ষ্ণ নজর রেখে।',
    },
  },
  {
    id: 'webdev',
    icon: 'code',
    title: { en: 'Web Development', bn: 'ওয়েব ডেভেলপমেন্ট' },
    description: {
      en: 'Designing and building complete, production-grade web platforms — interface, data, realtime and deployment.',
      bn: 'পূর্ণাঙ্গ, প্রোডাকশন-মানের ওয়েব প্ল্যাটফর্ম ডিজাইন ও নির্মাণ — ইন্টারফেস, ডেটা, রিয়েলটাইম আর ডিপ্লয়মেন্ট।',
    },
  },
  {
    id: 'ai',
    icon: 'bot',
    title: { en: 'AI & Automation', bn: 'AI ও অটোমেশন' },
    description: {
      en: 'Building AI-powered experiences: intelligent social bots, multi-provider AI routing and voice assistants.',
      bn: 'AI-চালিত অভিজ্ঞতা নির্মাণ: বুদ্ধিমান সোশ্যাল বট, মাল্টি-প্রোভাইডার AI রাউটিং আর ভয়েস অ্যাসিস্ট্যান্ট।',
    },
  },
  {
    id: 'problem',
    icon: 'puzzle',
    title: { en: 'Problem Solving', bn: 'সমস্যা সমাধান' },
    description: {
      en: 'Breaking hard problems into small, solvable steps — then shipping the fix, verified live.',
      bn: 'কঠিন সমস্যাকে ছোট ছোট সমাধানযোগ্য ধাপে ভাগ করা — তারপর সমাধানটা লাইভ যাচাই করে ছেড়ে দেওয়া।',
    },
  },
  {
    id: 'thinking',
    icon: 'bulb',
    title: { en: 'Creative Thinking', bn: 'সৃজনশীল চিন্তা' },
    description: {
      en: 'Finding the angle others miss — combining familiar pieces into something that feels entirely new.',
      bn: 'অন্যরা যে দিকটা দেখে না, সেটা খুঁজে বের করা — পরিচিত টুকরোগুলো জুড়ে একদম নতুন কিছু বানানো।',
    },
  },
];
