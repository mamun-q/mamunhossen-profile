import { motion } from 'framer-motion';
import { useContent } from '../content';
import { usePrefs } from '../prefs';
import { Icon } from './icons';
import Starfield from './Starfield';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const { t, lang } = usePrefs();
  const { profile, settings } = useContent();
  const brand = settings.brandName || profile.brandName;

  return (
    <section id="home" className="relative flex min-h-svh items-center overflow-hidden">
      {/* animated background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(1100px_550px_at_75%_-10%,rgba(123,97,255,0.28),transparent_60%),radial-gradient(900px_500px_at_10%_110%,rgba(24,119,242,0.22),transparent_60%)] dark:bg-[radial-gradient(1100px_550px_at_75%_-10%,rgba(123,97,255,0.32),transparent_60%),radial-gradient(900px_500px_at_10%_110%,rgba(24,119,242,0.26),transparent_60%)]" />
      <Starfield className="absolute inset-0 h-full w-full opacity-70 dark:opacity-100" />
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 rounded-full bg-brand2/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-96 w-96 rounded-full bg-brand/20 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-28 pb-20 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease }}
            className="relative"
          >
            {/* The gradient ring spins on its OWN layer — the photo
                must stay still. (The ring used to wrap the img, so
                the portrait itself rotated; seen in Limon's screen
                recording 2026-11-23.) */}
            <div className="relative h-32 w-32 rounded-full shadow-[0_0_70px_-8px_rgba(123,97,255,0.75)] sm:h-40 sm:w-40">
              <div className="avatar-ring absolute inset-0 rounded-full" aria-hidden="true" />
              <img
                src={profile.avatarUrl}
                alt={`${profile.fullName} — portrait`}
                width={480}
                height={480}
                className="absolute inset-[3.5px] h-[calc(100%-7px)] w-[calc(100%-7px)] rounded-full border-4 border-white object-cover dark:border-ink"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <span className="glass animate-float absolute -right-3 -bottom-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
              {profile.location[lang]}
            </span>
          </motion.div>

          {/* name */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease }}
            className="font-display mt-9 text-sm font-semibold tracking-[0.35em] text-brand uppercase dark:text-goldsoft"
          >
            {t('heroGreeting')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.85, ease }}
            className="font-display text-gradient mt-2 text-[clamp(3.4rem,17vw,10.5rem)] leading-[0.95] font-bold tracking-[0.04em] drop-shadow-[0_10px_45px_rgba(24,119,242,0.35)]"
          >
            {brand}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.75, ease }}
            className="font-display mt-3 max-w-2xl text-lg font-semibold text-slate-800 sm:text-2xl dark:text-slate-100"
          >
            {profile.tagline[lang]}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="mt-2 text-base text-brand2 dark:text-violet-300"
            lang="bn"
          >
            {profile.banglaLine}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.75, ease }}
            className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base dark:text-slate-300"
          >
            {profile.intro[lang]}
          </motion.p>

          {/* actions */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.75, ease }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#about"
              className="btn-glow font-display inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand2 px-6 py-3.5 text-sm font-semibold text-white"
            >
              {t('explore')}
              <Icon name="arrowDown" className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="glass font-display inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:scale-[1.03] dark:text-white"
            >
              <Icon name="mail" className="h-4 w-4" />
              {t('contactMe')}
            </a>
            <a
              href="#/cv"
              className="glass font-display inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:scale-[1.03] dark:text-white"
            >
              <Icon name="download" className="h-4 w-4" />
              {t('downloadCv')}
            </a>
          </motion.div>

          <motion.a
            href="#about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="mt-14 flex flex-col items-center gap-2 text-[11px] tracking-[0.25em] text-slate-400 uppercase dark:text-slate-500"
            aria-label={t('scrollDown')}
          >
            {t('scrollDown')}
            <motion.span animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
              <Icon name="arrowDown" className="h-4 w-4" />
            </motion.span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
