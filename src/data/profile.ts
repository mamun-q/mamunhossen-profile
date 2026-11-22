import type { LText, ProfileCard } from './types';

/** Core identity: brand, full name, role, tagline, imagery, intro. */
export const profile = {
  brandName: 'LIMON',
  fullName: 'Mamun Hossen Limon',
  role: {
    en: 'Founder & Creator of MeetBook',
    bn: 'MeetBook-এর প্রতিষ্ঠাতা ও নির্মাতা',
  } as LText,
  tagline: {
    en: 'Building Ideas. Exploring Technology. Creating the Future.',
    bn: 'আইডিয়া গড়ি। প্রযুক্তি অন্বেষণ করি। ভবিষ্যৎ তৈরি করি।',
  } as LText,
  banglaLine: 'স্বপ্ন দেখি, বানিয়ে ফেলি।',
  location: { en: 'Jessore, Bangladesh', bn: 'যশোর, বাংলাদেশ' } as LText,
  email: 'md.mamunhossenlimon@gmail.com',
  avatarUrl:
    'https://res.cloudinary.com/e3sdmsgs/image/upload/c_fill,g_face,w_480,h_480,f_auto,q_auto/mv9nh8ccuq9cifxcnm2b.png',
  portraitUrl:
    'https://res.cloudinary.com/e3sdmsgs/image/upload/f_auto,q_auto/v1795376234/mv9nh8ccuq9cifxcnm2b.png',
  siteUrl: 'https://mamun-q.github.io/mamunhossen-profile/',
  intro: {
    en: "I'm Mamun Hossen Limon — a builder from Jessore, Bangladesh, crafting digital products people love to use. I created MeetBook, a complete social platform, and I spend my days turning ideas into living, breathing software.",
    bn: 'আমি মামুন হোসেন লিমন — যশোর, বাংলাদেশের একজন নির্মাতা। আমি এমন ডিজিটাল পণ্য বানাই যা মানুষ ব্যবহার করে আনন্দ পায়। আমি তৈরি করেছি MeetBook — একটি পূর্ণাঙ্গ সোশ্যাল প্ল্যাটফর্ম। আমার প্রতিদিন কাটে আইডিয়াকে জীবন্ত সফটওয়্যারে রূপ দিয়ে।',
  } as LText,
};

/** Personal-profile cards shown in the About section. */
export const profileCards: ProfileCard[] = [
  {
    id: 'about',
    icon: 'user',
    title: { en: 'About Me', bn: 'আমার সম্পর্কে' },
    body: {
      en: "I'm Limon — Mamun Hossen Limon — a product builder from Jessore, Bangladesh. I imagine, design and build complete digital products, from the first spark of an idea to the live product people use every day.",
      bn: 'আমি লিমন — মামুন হোসেন লিমন — যশোর, বাংলাদেশের একজন প্রোডাক্ট নির্মাতা। আইডিয়ার প্রথম ঝলক থেকে শুরু করে মানুষের প্রতিদিন ব্যবহার করা লাইভ পণ্য পর্যন্ত — পুরো যাত্রাটাই আমি নিজে কল্পনা করি, ডিজাইন করি, বানাই।',
    },
  },
  {
    id: 'background',
    icon: 'journey',
    title: { en: 'My Background', bn: 'আমার পটভূমি' },
    body: {
      en: 'My path is self-driven: I learned by building. Instead of waiting for permission or a big team, I started creating real products — and MeetBook, my social platform, is the biggest one so far.',
      bn: 'আমার পথটা নিজের তৈরি: বানাতে বানাতেই শিখেছি। অনুমতি বা বড় দলের অপেক্ষা না করে আমি আসল পণ্য বানানো শুরু করি — আর MeetBook, আমার সোশ্যাল প্ল্যাটফর্ম, এখন পর্যন্ত সবচেয়ে বড়টা।',
    },
  },
  {
    id: 'interests',
    icon: 'heart',
    title: { en: 'My Interests', bn: 'আমার আগ্রহ' },
    body: {
      en: 'Technology, artificial intelligence, product design and the craft of building things that feel alive. I love exploring how software can make everyday life simpler and more joyful.',
      bn: 'প্রযুক্তি, কৃত্রিম বুদ্ধিমত্তা, প্রোডাক্ট ডিজাইন আর জীবন্ত অনুভূতির জিনিস বানানোর কারিগরি। সফটওয়্যার কীভাবে প্রতিদিনের জীবনকে সহজ আর আনন্দময় করতে পারে — তা খুঁজে দেখতে আমার ভালো লাগে।',
    },
  },
  {
    id: 'goals',
    icon: 'target',
    title: { en: 'My Goals', bn: 'আমার লক্ষ্য' },
    body: {
      en: 'To grow MeetBook into a platform people across Bangladesh — and beyond — call home, and to keep releasing useful, free tools that solve real problems for real people.',
      bn: 'MeetBook-কে এমন এক প্ল্যাটফর্মে পরিণত করা যাকে বাংলাদেশের — এবং তার বাইরের — মানুষ নিজের ঠিকানা মনে করে। পাশাপাশি আসল সমস্যার সমাধান করে এমন দরকারি, ফ্রি টুল বানিয়ে যাওয়া।',
    },
  },
  {
    id: 'vision',
    icon: 'eye',
    title: { en: 'My Vision', bn: 'আমার দৃষ্টিভঙ্গি' },
    body: {
      en: "A digital world where powerful technology is free, beautiful and within everyone's reach — built not only by big companies, but by independent creators everywhere.",
      bn: 'এমন এক ডিজিটাল জগৎ যেখানে শক্তিশালী প্রযুক্তি হবে ফ্রি, সুন্দর আর সবার নাগালে — যা শুধু বড় কোম্পানি নয়, সর্বত্রের স্বাধীন নির্মাতারাও গড়ে তুলবে।',
    },
  },
  {
    id: 'journey',
    icon: 'spark',
    title: { en: 'My Personal Journey', bn: 'আমার যাত্রা' },
    body: {
      en: 'From curiosity to creation: every project I ship teaches me something new. MeetBook began as an idea; today it is a living platform with real-time chat, groups, pages, stories and AI companions.',
      bn: 'কৌতূহল থেকে সৃষ্টির পথে: প্রতিটি প্রজেক্ট আমাকে নতুন কিছু শেখায়। MeetBook শুরু হয়েছিল একটা আইডিয়া হিসেবে; আজ তা রিয়েল-টাইম চ্যাট, গ্রুপ, পেজ, স্টোরি আর AI সঙ্গীসহ এক জীবন্ত প্ল্যাটফর্ম।',
    },
  },
];
