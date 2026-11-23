import { useContent } from '../content';
import { usePrefs } from '../prefs';
import { Icon } from './icons';
import { Reveal, SectionHeading } from './Chrome';

export default function ProjectsSection() {
  const { t, lang } = usePrefs();
  const { projects } = useContent();

  return (
    <section id="projects" className="relative scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_450px_at_85%_20%,rgba(123,97,255,0.09),transparent_65%)]" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading kicker={t('projectsKicker')} title={t('projectsTitle')} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <article className="group glass card-hover flex h-full flex-col overflow-hidden rounded-[28px]">
                {/* generated visual */}
                <div
                  className="relative flex h-48 items-center justify-center overflow-hidden sm:h-56"
                  style={{ background: p.gradient }}
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(420px_200px_at_20%_0%,rgba(255,255,255,0.35),transparent_60%)]" />
                  <div className="absolute -right-8 -bottom-10 h-44 w-44 rounded-full border-[22px] border-white/15" />
                  <div className="absolute top-6 left-6 h-16 w-16 rounded-full border-[14px] border-white/10" />
                  <span className="font-display relative text-7xl font-bold text-white/95 drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:scale-110">
                    {p.monogram}
                  </span>
                  <span className="glass absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-800 dark:text-white">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        p.status.en.trim().toLowerCase() === 'live'
                          ? 'bg-emerald-500 animate-pulse-soft'
                          : 'bg-violet-400'
                      }`}
                    />
                    {t('statusLabel')}: {p.status[lang]}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="font-display mt-1 text-sm font-medium text-brand dark:text-sky-300">
                    {p.tagline[lang]}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {p.description[lang]}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-600 dark:bg-white/8 dark:text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {(p.liveUrl || p.githubUrl) && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand2 px-5 py-2.5 text-sm font-semibold text-white"
                        >
                          {t('liveDemo')}
                          <Icon name="external" className="h-4 w-4" />
                        </a>
                      )}
                      {p.githubUrl && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:scale-[1.03] dark:text-white"
                        >
                          <Icon name="github" className="h-4 w-4" />
                          {t('viewCode')}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
