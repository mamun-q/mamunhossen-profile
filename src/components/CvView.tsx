import { useContent } from '../content';
import { usePrefs } from '../prefs';
import { Icon } from './icons';

/**
 * Printable CV generated entirely from the shared content layer (the
 * same single source of truth as the website — local data modules,
 * overlaid with the admin-editable site_content rows). "Print / Save
 * as PDF" uses the browser's real print pipeline; no fake PDF file.
 */
export default function CvView() {
  const { t, lang } = usePrefs();
  const { profile, projects, skills, socialLinks } = useContent();

  return (
    <div className="min-h-svh bg-slate-100 px-4 py-8 dark:bg-ink">
      <div className="no-print mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <a
          href="#/"
          className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white"
        >
          ← {t('cvBack')}
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand2 px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Icon name="printer" className="h-4 w-4" />
          {t('cvPrint')}
        </button>
      </div>

      <article className="cv-sheet mx-auto max-w-3xl rounded-2xl bg-white p-8 text-slate-800 shadow-xl sm:p-12 dark:bg-white">
        {/* header */}
        <header className="flex flex-wrap items-center gap-6 border-b-2 border-slate-900 pb-7">
          <img
            src={profile.avatarUrl}
            alt={profile.fullName}
            width={480}
            height={480}
            className="h-24 w-24 rounded-2xl object-cover"
          />
          <div className="min-w-52 flex-1">
            <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">{t('cvTitle')}</p>
            <h1 className="font-display mt-1 text-3xl font-bold text-slate-900">
              {profile.brandName} — {profile.fullName}
            </h1>
            <p className="mt-1 font-medium text-[#1877f2]">{profile.role[lang]}</p>
            <p className="mt-1 text-sm text-slate-500">
              {profile.location[lang]} · {profile.email}
            </p>
          </div>
        </header>

        {/* profile */}
        <section className="mt-7">
          <h2 className="font-display text-sm font-bold tracking-[0.2em] text-slate-900 uppercase">
            {t('cvAbout')}
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed">{profile.intro[lang]}</p>
          <p className="mt-2 text-[15px] text-slate-600" lang="bn">
            {profile.banglaLine}
          </p>
        </section>

        {/* expertise */}
        <section className="mt-7">
          <h2 className="font-display text-sm font-bold tracking-[0.2em] text-slate-900 uppercase">
            {t('cvExpertise')}
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {skills.map((s) => (
              <div key={s.id}>
                <h3 className="font-semibold text-slate-900">{s.title[lang]}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{s.description[lang]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* projects */}
        <section className="mt-7">
          <h2 className="font-display text-sm font-bold tracking-[0.2em] text-slate-900 uppercase">
            {t('cvProjects')}
          </h2>
          <div className="mt-3 space-y-5">
            {projects.map((p) => (
              <div key={p.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-slate-900">{p.name}</h3>
                  <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    {p.status[lang]}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#1877f2]">{p.tagline[lang]}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.description[lang]}</p>
                <p className="mt-1.5 text-xs text-slate-500">{p.tech.join(' · ')}</p>
                {(p.liveUrl || p.githubUrl) && (
                  <p className="mt-1 text-xs break-all text-slate-500">
                    {p.liveUrl}
                    {p.liveUrl && p.githubUrl ? ' · ' : ''}
                    {p.githubUrl}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* contact */}
        <footer className="mt-8 border-t border-slate-200 pt-5">
          <h2 className="font-display text-sm font-bold tracking-[0.2em] text-slate-900 uppercase">
            {t('cvContact')}
          </h2>
          <ul className="mt-2.5 space-y-1 text-sm text-slate-600">
            <li>Email: {profile.email}</li>
            {socialLinks
              .filter((l) => l.href.startsWith('http'))
              .map((l) => (
                <li key={l.id}>
                  {l.label}: {l.href}
                </li>
              ))}
            <li>
              {t('locationLabel')}: {profile.location[lang]}
            </li>
          </ul>
        </footer>
      </article>
    </div>
  );
}
