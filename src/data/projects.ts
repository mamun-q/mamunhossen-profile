import type { Project } from './types';

/**
 * Project showcase records. Buttons render only when a URL exists —
 * no dead links, ever.
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
    image:
      'https://res.cloudinary.com/e3sdmsgs/image/upload/v1795445110/meetbook/trfaijkp9rvwvlf22uiu.jpg',
    gradient: 'linear-gradient(135deg,#1877f2 0%,#7b61ff 60%,#c86bff 100%)',
    monogram: 'M',
  },
  {
    id: 'addabook',
    name: 'AddaBook',
    tagline: {
      en: 'A friendly social home for everyday adda.',
      bn: 'প্রতিদিনের আড্ডার নিজের সামাজিক জায়গা।',
    },
    description: {
      en: 'Posts, stories, friends, groups, real-time chat, pages, events, a community marketplace and a token wallet — an original, mobile-first social platform in Bangla, live on the web.',
      bn: 'পোস্ট, স্টোরি, বন্ধু, গ্রুপ, রিয়েল-টাইম চ্যাট, পেজ, ইভেন্ট, কমিউনিটি বাজার আর টোকেন ওয়ালেট — বাংলায় মোবাইল-প্রথম, সম্পূর্ণ নিজস্ব ডিজাইনের সোশ্যাল প্ল্যাটফর্ম, লাইভ।',
    },
    tech: ['JavaScript', 'Supabase', 'Realtime', 'GitHub Pages'],
    status: { en: 'Live', bn: 'লাইভ' },
    liveUrl: 'https://mamun-q.github.io/addabook/',
    githubUrl: 'https://github.com/mamun-q/addabook',
    gradient: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 55%,#d946ef 100%)',
    monogram: 'আ',
  },
  {
    id: 'porashona',
    name: 'পড়াশোনা (Porashona)',
    tagline: {
      en: 'Free study notes & model tests for SSC, HSC, Admission and BCS.',
      bn: 'SSC, HSC, Admission ও BCS প্রস্তুতির ফ্রি নোট ও মডেল টেস্ট।',
    },
    description: {
      en: 'Chapter-wise notes, suggestions and live model tests with verified answers and explanations — free for students across Bangladesh.',
      bn: 'অধ্যায়ভিত্তিক নোট, সাজেশন আর যাচাই করা উত্তর ও ব্যাখ্যাসহ লাইভ মডেল টেস্ট — সারা দেশের শিক্ষার্থীদের জন্য সম্পূর্ণ ফ্রি।',
    },
    tech: ['Blogger', 'Education', 'Bangla'],
    status: { en: 'Live', bn: 'লাইভ' },
    liveUrl: 'https://porashona-edu.blogspot.com/',
    gradient: 'linear-gradient(135deg,#059669 0%,#10b981 55%,#84cc16 100%)',
    monogram: 'প',
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
    id: 'limon-hq',
    name: 'LIMON HQ',
    tagline: {
      en: 'My private AI office — hand over a task, watch it move.',
      bn: 'আমার ব্যক্তিগত AI অফিস — কাজ দিলেই এগিয়ে যায়।',
    },
    description: {
      en: 'An Android app where I hand tasks to an AI team — manager, planner, coder, tester — and watch the progress live. A private tool, built for my own workflow.',
      bn: 'একটি Android অ্যাপ, যেখানে আমি AI দলকে — ম্যানেজার, প্ল্যানার, কোডার, টেস্টার — কাজ দিই আর অগ্রগতি লাইভ দেখি। সম্পূর্ণ ব্যক্তিগত টুল।',
    },
    tech: ['Android', 'AI Agents', 'GitHub API'],
    status: { en: 'Private', bn: 'ব্যক্তিগত' },
    gradient: 'linear-gradient(135deg,#064e3b 0%,#047857 55%,#10b981 100%)',
    monogram: 'HQ',
  },
];
