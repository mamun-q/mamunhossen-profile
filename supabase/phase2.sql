-- =====================================================================
-- LIMON identity site — Phase 2 backend (Supabase)
-- ---------------------------------------------------------------------
-- Paste this whole file into the Supabase SQL editor and run it once.
-- It is safe to re-run: tables/policies use IF EXISTS guards and the
-- seed rows use ON CONFLICT DO NOTHING (live admin edits are kept).
--
-- Tables:
--   public.site_content  — one jsonb row per content module
--                          (profile, projects, skills, gallery,
--                          achievements, links, settings). Publicly
--                          readable; writable only by admins
--                          (public.is_admin()).
--   public.site_messages — contact-form inbox. Anyone may INSERT a
--                          length-checked message; only admins may
--                          read / update / delete.
-- =====================================================================

-- ---------------------------------------------------------------------
-- site_content
-- ---------------------------------------------------------------------
create table if not exists public.site_content (
  "key"       text primary key,
  "value"     jsonb not null,
  "updatedAt" bigint not null
);

alter table public.site_content enable row level security;

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "site_content_admin_insert" on public.site_content;
create policy "site_content_admin_insert"
  on public.site_content
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "site_content_admin_update" on public.site_content;
create policy "site_content_admin_update"
  on public.site_content
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "site_content_admin_delete" on public.site_content;
create policy "site_content_admin_delete"
  on public.site_content
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- site_messages (contact-form inbox)
-- ---------------------------------------------------------------------
create table if not exists public.site_messages (
  "id"        text primary key,
  "name"      text not null,
  "email"     text not null,
  "message"   text not null,
  "read"      boolean not null default false,
  "createdAt" bigint not null
);

alter table public.site_messages enable row level security;

grant insert on public.site_messages to anon, authenticated;
grant select, update, delete on public.site_messages to authenticated;

drop policy if exists "site_messages_public_insert" on public.site_messages;
create policy "site_messages_public_insert"
  on public.site_messages
  for insert
  to anon, authenticated
  with check (
    char_length("name") between 1 and 80
    and char_length("email") between 3 and 120
    and char_length("message") between 1 and 2000
  );

drop policy if exists "site_messages_admin_select" on public.site_messages;
create policy "site_messages_admin_select"
  on public.site_messages
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "site_messages_admin_update" on public.site_messages;
create policy "site_messages_admin_update"
  on public.site_messages
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "site_messages_admin_delete" on public.site_messages;
create policy "site_messages_admin_delete"
  on public.site_messages
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- Seed: initial site_content rows, serialised from src/data/*.
-- ON CONFLICT DO NOTHING — re-running never overwrites admin edits.
-- ---------------------------------------------------------------------
insert into public.site_content ("key", "value", "updatedAt") values
  ('profile', '{"profile":{"brandName":"LIMON","fullName":"Mamun Hossen Limon","role":{"en":"Founder & Creator of MeetBook","bn":"MeetBook-এর প্রতিষ্ঠাতা ও নির্মাতা"},"tagline":{"en":"Building Ideas. Exploring Technology. Creating the Future.","bn":"আইডিয়া গড়ি। প্রযুক্তি অন্বেষণ করি। ভবিষ্যৎ তৈরি করি।"},"banglaLine":"স্বপ্ন দেখি, বানিয়ে ফেলি।","location":{"en":"Jessore, Bangladesh","bn":"যশোর, বাংলাদেশ"},"email":"md.mamunhossenlimon@gmail.com","avatarUrl":"https://res.cloudinary.com/e3sdmsgs/image/upload/c_fill,g_face,w_480,h_480,f_auto,q_auto/mv9nh8ccuq9cifxcnm2b.png","portraitUrl":"https://res.cloudinary.com/e3sdmsgs/image/upload/f_auto,q_auto/v1795376234/mv9nh8ccuq9cifxcnm2b.png","siteUrl":"https://mamun-q.github.io/mamunhossen-profile/","intro":{"en":"I''m Mamun Hossen Limon — a builder from Jessore, Bangladesh, crafting digital products people love to use. I created MeetBook, a complete social platform, and I spend my days turning ideas into living, breathing software.","bn":"আমি মামুন হোসেন লিমন — যশোর, বাংলাদেশের একজন নির্মাতা। আমি এমন ডিজিটাল পণ্য বানাই যা মানুষ ব্যবহার করে আনন্দ পায়। আমি তৈরি করেছি MeetBook — একটি পূর্ণাঙ্গ সোশ্যাল প্ল্যাটফর্ম। আমার প্রতিদিন কাটে আইডিয়াকে জীবন্ত সফটওয়্যারে রূপ দিয়ে।"}},"cards":[{"id":"about","icon":"user","title":{"en":"About Me","bn":"আমার সম্পর্কে"},"body":{"en":"I''m Limon — Mamun Hossen Limon — a product builder from Jessore, Bangladesh. I imagine, design and build complete digital products, from the first spark of an idea to the live product people use every day.","bn":"আমি লিমন — মামুন হোসেন লিমন — যশোর, বাংলাদেশের একজন প্রোডাক্ট নির্মাতা। আইডিয়ার প্রথম ঝলক থেকে শুরু করে মানুষের প্রতিদিন ব্যবহার করা লাইভ পণ্য পর্যন্ত — পুরো যাত্রাটাই আমি নিজে কল্পনা করি, ডিজাইন করি, বানাই।"}},{"id":"background","icon":"journey","title":{"en":"My Background","bn":"আমার পটভূমি"},"body":{"en":"My path is self-driven: I learned by building. Instead of waiting for permission or a big team, I started creating real products — and MeetBook, my social platform, is the biggest one so far.","bn":"আমার পথটা নিজের তৈরি: বানাতে বানাতেই শিখেছি। অনুমতি বা বড় দলের অপেক্ষা না করে আমি আসল পণ্য বানানো শুরু করি — আর MeetBook, আমার সোশ্যাল প্ল্যাটফর্ম, এখন পর্যন্ত সবচেয়ে বড়টা।"}},{"id":"interests","icon":"heart","title":{"en":"My Interests","bn":"আমার আগ্রহ"},"body":{"en":"Technology, artificial intelligence, product design and the craft of building things that feel alive. I love exploring how software can make everyday life simpler and more joyful.","bn":"প্রযুক্তি, কৃত্রিম বুদ্ধিমত্তা, প্রোডাক্ট ডিজাইন আর জীবন্ত অনুভূতির জিনিস বানানোর কারিগরি। সফটওয়্যার কীভাবে প্রতিদিনের জীবনকে সহজ আর আনন্দময় করতে পারে — তা খুঁজে দেখতে আমার ভালো লাগে।"}},{"id":"goals","icon":"target","title":{"en":"My Goals","bn":"আমার লক্ষ্য"},"body":{"en":"To grow MeetBook into a platform people across Bangladesh — and beyond — call home, and to keep releasing useful, free tools that solve real problems for real people.","bn":"MeetBook-কে এমন এক প্ল্যাটফর্মে পরিণত করা যাকে বাংলাদেশের — এবং তার বাইরের — মানুষ নিজের ঠিকানা মনে করে। পাশাপাশি আসল সমস্যার সমাধান করে এমন দরকারি, ফ্রি টুল বানিয়ে যাওয়া।"}},{"id":"vision","icon":"eye","title":{"en":"My Vision","bn":"আমার দৃষ্টিভঙ্গি"},"body":{"en":"A digital world where powerful technology is free, beautiful and within everyone''s reach — built not only by big companies, but by independent creators everywhere.","bn":"এমন এক ডিজিটাল জগৎ যেখানে শক্তিশালী প্রযুক্তি হবে ফ্রি, সুন্দর আর সবার নাগালে — যা শুধু বড় কোম্পানি নয়, সর্বত্রের স্বাধীন নির্মাতারাও গড়ে তুলবে।"}},{"id":"journey","icon":"spark","title":{"en":"My Personal Journey","bn":"আমার যাত্রা"},"body":{"en":"From curiosity to creation: every project I ship teaches me something new. MeetBook began as an idea; today it is a living platform with real-time chat, groups, pages, stories and AI companions.","bn":"কৌতূহল থেকে সৃষ্টির পথে: প্রতিটি প্রজেক্ট আমাকে নতুন কিছু শেখায়। MeetBook শুরু হয়েছিল একটা আইডিয়া হিসেবে; আজ তা রিয়েল-টাইম চ্যাট, গ্রুপ, পেজ, স্টোরি আর AI সঙ্গীসহ এক জীবন্ত প্ল্যাটফর্ম।"}}]}'::jsonb, (extract(epoch from now()) * 1000)::bigint),
  ('projects', '[{"id":"meetbook","name":"MeetBook","tagline":{"en":"A complete social platform, made in Bangladesh.","bn":"একটি পূর্ণাঙ্গ সোশ্যাল প্ল্যাটফর্ম — তৈরি বাংলাদেশে।"},"description":{"en":"Feed, friends, groups & pages, real-time chat, stories and an ecosystem of independent AI companions — designed mobile-first and live on the web for everyone.","bn":"ফিড, বন্ধু, গ্রুপ ও পেজ, রিয়েল-টাইম চ্যাট, স্টোরি আর স্বাধীন AI সঙ্গীদের এক পুরো ecosystem — মোবাইল-প্রথম ডিজাইনে, সবার জন্য লাইভ।"},"tech":["JavaScript","Supabase","Realtime","PWA","Cloudinary"],"status":{"en":"Live","bn":"লাইভ"},"liveUrl":"https://mamun-q.github.io/MeetBook/","githubUrl":"https://github.com/mamun-q/MeetBook","gradient":"linear-gradient(135deg,#1877f2 0%,#7b61ff 60%,#c86bff 100%)","monogram":"M"},{"id":"limon-ai","name":"Limon AI","tagline":{"en":"A personal voice AI assistant for Android.","bn":"Android-এর জন্য ব্যক্তিগত ভয়েস AI অ্যাসিস্ট্যান্ট।"},"description":{"en":"My personal AI assistant that lives on my Android phone: voice commands in Bangla and English, an agentic step planner, reminders and app actions — designed to be genuinely useful every day, even from the lock screen.","bn":"আমার Android ফোনে থাকা ব্যক্তিগত AI অ্যাসিস্ট্যান্ট: বাংলা ও ইংরেজিতে ভয়েস কমান্ড, এজেন্টিক ধাপ-পরিকল্পনা, রিমাইন্ডার আর অ্যাপ অ্যাকশন — লক স্ক্রিন থেকেও প্রতিদিন সত্যিকারের কাজে লাগার জন্য ডিজাইন করা।"},"tech":["Android","Kotlin WebView","Gemini AI","Voice Interaction"],"status":{"en":"In Development","bn":"উন্নয়নাধীন"},"gradient":"linear-gradient(135deg,#0ea5e9 0%,#6366f1 55%,#a855f7 100%)","monogram":"AI"}]'::jsonb, (extract(epoch from now()) * 1000)::bigint),
  ('skills', '[{"id":"technology","icon":"cpu","title":{"en":"Technology","bn":"প্রযুক্তি"},"description":{"en":"A deep love for how things work — systems, platforms and the tools that power the modern web.","bn":"জিনিসপত্র কীভাবে কাজ করে তার প্রতি গভীর আগ্রহ — সিস্টেম, প্ল্যাটফর্ম আর আধুনিক ওয়েবকে চালানো টুলগুলো।"}},{"id":"creativity","icon":"palette","title":{"en":"Digital Creativity","bn":"ডিজিটাল সৃজনশীলতা"},"description":{"en":"Turning raw ideas into polished digital experiences, with a strong sense of design and detail.","bn":"কাঁচা আইডিয়াকে নিখুঁত ডিজিটাল অভিজ্ঞতায় রূপ দেওয়া — ডিজাইন আর খুঁটিনাটির প্রতি তীক্ষ্ণ নজর রেখে।"}},{"id":"webdev","icon":"code","title":{"en":"Web Development","bn":"ওয়েব ডেভেলপমেন্ট"},"description":{"en":"Designing and building complete, production-grade web platforms — interface, data, realtime and deployment.","bn":"পূর্ণাঙ্গ, প্রোডাকশন-মানের ওয়েব প্ল্যাটফর্ম ডিজাইন ও নির্মাণ — ইন্টারফেস, ডেটা, রিয়েলটাইম আর ডিপ্লয়মেন্ট।"}},{"id":"ai","icon":"bot","title":{"en":"AI & Automation","bn":"AI ও অটোমেশন"},"description":{"en":"Building AI-powered experiences: intelligent social bots, multi-provider AI routing and voice assistants.","bn":"AI-চালিত অভিজ্ঞতা নির্মাণ: বুদ্ধিমান সোশ্যাল বট, মাল্টি-প্রোভাইডার AI রাউটিং আর ভয়েস অ্যাসিস্ট্যান্ট।"}},{"id":"problem","icon":"puzzle","title":{"en":"Problem Solving","bn":"সমস্যা সমাধান"},"description":{"en":"Breaking hard problems into small, solvable steps — then shipping the fix, verified live.","bn":"কঠিন সমস্যাকে ছোট ছোট সমাধানযোগ্য ধাপে ভাগ করা — তারপর সমাধানটা লাইভ যাচাই করে ছেড়ে দেওয়া।"}},{"id":"thinking","icon":"bulb","title":{"en":"Creative Thinking","bn":"সৃজনশীল চিন্তা"},"description":{"en":"Finding the angle others miss — combining familiar pieces into something that feels entirely new.","bn":"অন্যরা যে দিকটা দেখে না, সেটা খুঁজে বের করা — পরিচিত টুকরোগুলো জুড়ে একদম নতুন কিছু বানানো।"}}]'::jsonb, (extract(epoch from now()) * 1000)::bigint),
  ('gallery', '[{"id":"portrait-1","src":"https://res.cloudinary.com/e3sdmsgs/image/upload/f_auto,q_auto/v1795376234/mv9nh8ccuq9cifxcnm2b.png","thumb":"https://res.cloudinary.com/e3sdmsgs/image/upload/c_fill,g_face,w_480,h_480,f_auto,q_auto/mv9nh8ccuq9cifxcnm2b.png","alt":{"en":"Limon — Mamun Hossen Limon, portrait outdoors in Jessore","bn":"লিমন — মামুন হোসেন লিমন, যশোরে বাইরের প্রতিকৃতি"},"category":"Portrait"}]'::jsonb, (extract(epoch from now()) * 1000)::bigint),
  ('achievements', '{"activities":[{"en":"Building MeetBook, my social platform","bn":"আমার সোশ্যাল প্ল্যাটফর্ম MeetBook গড়ছি"},{"en":"Developing Limon AI, my voice assistant","bn":"আমার ভয়েস অ্যাসিস্ট্যান্ট Limon AI বানাচ্ছি"},{"en":"Designing new product ideas","bn":"নতুন প্রোডাক্টের আইডিয়া ডিজাইন করছি"},{"en":"Learning & experimenting with AI","bn":"AI নিয়ে শিখছি আর পরীক্ষা করছি"}],"achievements":[{"en":"Shipped MeetBook live to the web","bn":"MeetBook ওয়েবে লাইভ করেছি"},{"en":"Built a working Android voice assistant","bn":"একটি কার্যকর Android ভয়েস অ্যাসিস্ট্যান্ট বানিয়েছি"},{"en":"Created an ecosystem of AI companions on MeetBook","bn":"MeetBook-এ AI সঙ্গীদের একটি ecosystem তৈরি করেছি"}],"interests":[{"en":"Technology","bn":"প্রযুক্তি"},{"en":"Artificial Intelligence","bn":"কৃত্রিম বুদ্ধিমত্তা"},{"en":"Product Building","bn":"প্রোডাক্ট নির্মাণ"},{"en":"Design","bn":"ডিজাইন"}],"futurePlans":[{"en":"Grow MeetBook and its community","bn":"MeetBook ও তার কমিউনিটি বড় করা"},{"en":"Keep building useful free tools","bn":"দরকারি ফ্রি টুল বানিয়ে যাওয়া"},{"en":"Bring MeetBook to its own domain and a bigger audience","bn":"MeetBook-কে নিজের ডোমেইনে ও বড় দর্শকের কাছে নেওয়া"}]}'::jsonb, (extract(epoch from now()) * 1000)::bigint),
  ('links', '[{"id":"meetbook","label":"MeetBook","href":"https://mamun-q.github.io/MeetBook/","icon":"meetbook"},{"id":"github","label":"GitHub","href":"https://github.com/mamun-q","icon":"github"},{"id":"website","label":"Personal Site","href":"https://mamun-q.github.io/mamunhossen-profile/","icon":"globe"},{"id":"email","label":"Email","href":"mailto:md.mamunhossenlimon@gmail.com","icon":"mail"}]'::jsonb, (extract(epoch from now()) * 1000)::bigint),
  ('settings', '{"siteUrl":"https://mamun-q.github.io/mamunhossen-profile/","brandName":"LIMON","defaultTheme":"dark","defaultLang":"en","contactEmail":"md.mamunhossenlimon@gmail.com"}'::jsonb, (extract(epoch from now()) * 1000)::bigint)
on conflict ("key") do nothing;
