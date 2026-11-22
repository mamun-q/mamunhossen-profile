import { useContent } from '../content';
import { usePrefs } from '../prefs';
import { Icon } from './icons';
import { Reveal, SectionHeading } from './Chrome';

/* ---------------- Personal profile ---------------- */

export function ProfileSection() {
  const { t, lang } = usePrefs();
  const { profileCards } = useContent();
  return (
    <section id="about" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker={t('profileKicker')} title={t('profileTitle')} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profileCards.map((card, i) => (
            <Reveal key={card.id} delay={(i % 3) * 0.08}>
              <article className="glass card-hover h-full rounded-3xl p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/15 to-brand2/15 text-brand dark:text-sky-300">
                  <Icon name={card.icon} className="h-[22px] w-[22px]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {card.title[lang]}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {card.body[lang]}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Skills & expertise ---------------- */

export function SkillsSection() {
  const { t, lang } = usePrefs();
  const { skills } = useContent();
  return (
    <section id="skills" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_0%,rgba(24,119,242,0.08),transparent_65%)]" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading kicker={t('skillsKicker')} title={t('skillsTitle')} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, i) => (
            <Reveal key={skill.id} delay={(i % 3) * 0.08}>
              <article className="group glass card-hover relative h-full overflow-hidden rounded-3xl p-6">
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br from-brand/20 to-brand2/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand2 text-white shadow-lg shadow-brand/25">
                    <Icon name={skill.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                    {skill.title[lang]}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {skill.description[lang]}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- My Digital World ---------------- */

function WorldList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: { en: string; bn: string }[];
}) {
  const { lang } = usePrefs();
  return (
    <div className="glass card-hover h-full rounded-3xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-brand2/15 text-brand dark:text-sky-300">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-brand to-brand2" />
            {item[lang]}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WorldSection() {
  const { t } = usePrefs();
  const { digitalWorld, socialLinks } = useContent();
  return (
    <section id="world" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker={t('worldKicker')} title={t('worldTitle')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Reveal>
            <WorldList title={t('activities')} icon="layers" items={digitalWorld.activities} />
          </Reveal>
          <Reveal delay={0.08}>
            <WorldList title={t('achievements')} icon="trophy" items={digitalWorld.achievements} />
          </Reveal>
          <Reveal>
            <WorldList title={t('interests')} icon="heart" items={digitalWorld.interests} />
          </Reveal>
          <Reveal delay={0.08}>
            <WorldList title={t('futurePlans')} icon="rocket" items={digitalWorld.futurePlans} />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-5">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <h3 className="font-display mb-5 text-center text-base font-semibold text-slate-900 dark:text-white">
              {t('presence')}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {socialLinks.map((l) => (
                <a
                  key={l.id}
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel={l.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="inline-flex items-center gap-2.5 rounded-full border border-slate-900/10 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:scale-105 hover:border-brand/50 hover:text-brand dark:border-white/12 dark:text-slate-200 dark:hover:text-white"
                >
                  <Icon name={l.icon} className="h-[18px] w-[18px]" />
                  {l.label}
                  <Icon name="external" className="h-3.5 w-3.5 opacity-60" />
                </a>
              ))}
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 px-5 py-2.5 text-sm text-slate-500 dark:border-white/12 dark:text-slate-400">
                <Icon name="pin" className="h-[18px] w-[18px]" />
                <LocationText />
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LocationText() {
  const { lang } = usePrefs();
  const { profile } = useContent();
  return <>{profile.location[lang]}</>;
}
