import type { Project } from './types';

/**
 * Project showcase records. Buttons render only when a URL exists —
 * no dead links, ever. NOTE (owner): "Limoria" has no details yet;
 * the neutral copy below is a placeholder for HIS text, not a claim.
 */
export const projects: Project[] = [
  {
    id: 'meetbook',
    name: 'MeetBook',
    tagline: {
      en: 'A complete social platform, made in Bangladesh.',
      bn: 'একটি পূর্ণাঙ্গ সোশ্যাল প্ল্যাটফর্ম — তৈরি বাংলাদেশে।',
    },
    description: {
      en: 'Feed, friends, groups & pages, real-time chat, stories and an ecosystem of independent AI companions — designed mobile-first and live on the web for everyone.',
      bn: 'ফিড, বন্ধু, গ্রুপ ও পেজ, রিয়েল-টাইম চ্যাট, স্টোরি আর স্বাধীন AI সঙ্গীদের এক পুরো ecosystem — মোবাইল-প্রথম ডিজাইনে, সবার জন্য লাইভ।',
    },
    tech: ['JavaScript', 'Supabase', 'Realtime', 'PWA', 'Cloudinary'],
    status: { en: 'Live', bn: 'লাইভ' },
    liveUrl: 'https://mamun-q.github.io/MeetBook/',
    githubUrl: 'https://github.com/mamun-q/MeetBook',
    gradient: 'linear-gradient(135deg,#1877f2 0%,#7b61ff 60%,#c86bff 100%)',
    monogram: 'M',
  },
  {
    id: 'limon-ai',
    name: 'Limon AI',
    tagline: {
      en: 'A personal voice AI assistant for Android.',
      bn: 'Android-এর জন্য ব্যক্তিগত ভয়েস AI অ্যাসিস্ট্যান্ট।',
    },
    description: {
      en: 'My personal AI assistant that lives on my Android phone: voice commands in Bangla and English, an agentic step planner, reminders and app actions — designed to be genuinely useful every day, even from the lock screen.',
      bn: 'আমার Android ফোনে থাকা ব্যক্তিগত AI অ্যাসিস্ট্যান্ট: বাংলা ও ইংরেজিতে ভয়েস কমান্ড, এজেন্টিক ধাপ-পরিকল্পনা, রিমাইন্ডার আর অ্যাপ অ্যাকশন — লক স্ক্রিন থেকেও প্রতিদিন সত্যিকারের কাজে লাগার জন্য ডিজাইন করা।',
    },
    tech: ['Android', 'Kotlin WebView', 'Gemini AI', 'Voice Interaction'],
    status: { en: 'In Development', bn: 'উন্নয়নাধীন' },
    gradient: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 55%,#a855f7 100%)',
    monogram: 'AI',
  },
  {
    id: 'limoria',
    name: 'Limoria',
    tagline: {
      en: 'A new project taking shape.',
      bn: 'একটি নতুন প্রজেক্ট আকার নিচ্ছে।',
    },
    description: {
      en: 'A new project taking shape — details coming soon.',
      bn: 'একটি নতুন প্রজেক্ট আকার নিচ্ছে — বিস্তারিত শীঘ্রই আসছে।',
    },
    tech: [],
    status: { en: 'Upcoming', bn: 'শীঘ্রই আসছে' },
    gradient: 'linear-gradient(135deg,#1e1b4b 0%,#7b61ff 55%,#d9a441 110%)',
    monogram: 'L',
  },
];
