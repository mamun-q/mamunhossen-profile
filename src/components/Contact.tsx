import { useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContent } from '../content';
import { usePrefs } from '../prefs';
import { Icon } from './icons';
import { Reveal, SectionHeading } from './Chrome';

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Contact form (Phase 2): fully validated on the client, protected by
 * a honeypot, and delivered by INSERTing into the Supabase
 * site_messages inbox (anon key; RLS length-checks the row server
 * side). If the insert fails for any reason, the visitor gets an
 * honest error plus the Phase 1 fallback: a button that composes the
 * same message into their own email app via mailto:.
 */
export default function ContactSection() {
  const { t, lang } = usePrefs();
  const { profile, socialLinks } = useContent();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<FormStatus>('idle');

  const validate = (): boolean => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = t('errName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = t('errEmail');
    if (message.trim().length < 10) next.message = t('errMessage');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildMailto = (): string => {
    const subject = encodeURIComponent(`Message from ${name.trim()} — LIMON website`);
    const body = encodeURIComponent(`${message.trim()}\n\n— ${name.trim()} (${email.trim()})`);
    return `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Honeypot: a human never fills this hidden field. If it has a
    // value, silently pretend success and drop the submission.
    if (honeypot) {
      setStatus('sent');
      return;
    }
    if (!validate()) return;
    setStatus('sending');
    try {
      const { getSupabase } = await import('../lib/supabase');
      const supabase = getSupabase();
      const id = `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      const { error } = await supabase.from('site_messages').insert({
        id,
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        read: false,
        createdAt: Date.now(),
      });
      if (error) throw error;
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const inputCls = (invalid?: string) =>
    `w-full rounded-2xl border bg-white/70 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 transition focus:border-brand2 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 ${
      invalid ? 'border-red-400 dark:border-red-400' : 'border-slate-900/10 dark:border-white/12'
    }`;

  return (
    <section id="contact" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_450px_at_15%_30%,rgba(24,119,242,0.09),transparent_65%)]" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading kicker={t('contactKicker')} title={t('contactTitle')} />
        <Reveal className="mx-auto -mt-6 mb-12 max-w-2xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{t('contactIntro')}</p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* direct contact card */}
          <Reveal className="lg:col-span-2">
            <div className="glass flex h-full flex-col rounded-[28px] p-7">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {t('directContact')}
              </h3>
              <a
                href={`mailto:${profile.email}`}
                className="mt-5 flex items-center gap-3.5 rounded-2xl border border-slate-900/8 p-4 transition hover:border-brand/50 dark:border-white/10"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand2 text-white">
                  <Icon name="mail" className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Email
                  </span>
                  <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {profile.email}
                  </span>
                </span>
              </a>

              <div className="mt-4 flex items-center gap-3.5 rounded-2xl border border-slate-900/8 p-4 dark:border-white/10">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand2 text-white">
                  <Icon name="pin" className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    {t('locationLabel')}
                  </span>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {profile.location[lang]}
                  </span>
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {socialLinks
                  .filter((l) => l.id === 'meetbook' || l.id === 'github')
                  .map((l) => (
                    <a
                      key={l.id}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 px-4 py-2 text-sm font-medium text-slate-700 transition hover:scale-105 hover:border-brand/50 hover:text-brand dark:border-white/12 dark:text-slate-200 dark:hover:text-white"
                    >
                      <Icon name={l.icon} className="h-4 w-4" />
                      {l.label}
                    </a>
                  ))}
              </div>

              <div className="mt-auto pt-8">
                <img
                  src={profile.avatarUrl}
                  alt=""
                  width={480}
                  height={480}
                  loading="lazy"
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <p className="font-display mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {profile.fullName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profile.role[lang]}</p>
              </div>
            </div>
          </Reveal>

          {/* form card */}
          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="glass relative h-full rounded-[28px] p-7">
              <AnimatePresence mode="wait">
                {status === 'sent' ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex h-full min-h-72 flex-col items-center justify-center text-center"
                    role="status"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                      <Icon name="send" className="h-7 w-7" />
                    </span>
                    <h3 className="font-display mt-5 text-xl font-bold text-slate-900 dark:text-white">
                      {t('formSuccessTitle')}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {t('formSuccessBody')}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('idle');
                        setName('');
                        setEmail('');
                        setMessage('');
                      }}
                      className="glass mt-6 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:scale-105 dark:text-white"
                    >
                      {t('formAgain')}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={onSubmit}
                    noValidate
                    aria-label={t('contactTitle')}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                          {t('formName')}
                        </label>
                        <input
                          id="cf-name"
                          type="text"
                          value={name}
                          maxLength={80}
                          onChange={(e) => setName(e.target.value)}
                          className={inputCls(errors.name)}
                          autoComplete="name"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'cf-name-err' : undefined}
                        />
                        {errors.name && (
                          <p id="cf-name-err" className="mt-1.5 text-xs text-red-500" role="alert">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                          {t('formEmail')}
                        </label>
                        <input
                          id="cf-email"
                          type="email"
                          value={email}
                          maxLength={120}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputCls(errors.email)}
                          autoComplete="email"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'cf-email-err' : undefined}
                        />
                        {errors.email && (
                          <p id="cf-email-err" className="mt-1.5 text-xs text-red-500" role="alert">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                        {t('formMessage')}
                      </label>
                      <textarea
                        id="cf-message"
                        value={message}
                        maxLength={2000}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        className={`${inputCls(errors.message)} resize-none`}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'cf-message-err' : undefined}
                      />
                      {errors.message && (
                        <p id="cf-message-err" className="mt-1.5 text-xs text-red-500" role="alert">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* honeypot — invisible to humans, tempting to bots.
                        Zero-size + transparent (no off-screen offset, so
                        it can never create page overflow). */}
                    <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                      <label>
                        Website
                        <input
                          type="text"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                        />
                      </label>
                    </div>

                    {status === 'error' && (
                      <div
                        className="mt-4 rounded-2xl border border-red-300/70 bg-red-50 p-4 dark:border-red-400/30 dark:bg-red-500/10"
                        role="alert"
                      >
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                          {t('formErrorTitle')}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-red-600 dark:text-red-200/85">
                          {t('formErrorBody')}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => setStatus('idle')}
                            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                          >
                            {t('formTryAgain')}
                          </button>
                          <a
                            href={buildMailto()}
                            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-800 dark:text-white"
                          >
                            <Icon name="mail" className="h-4 w-4" />
                            {t('formMailFallback')}
                          </a>
                        </div>
                      </div>
                    )}

                    <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0" />
                      {t('formMailNote')}
                    </p>

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="btn-glow font-display mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand2 px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
                    >
                      <Icon name="send" className="h-4 w-4" />
                      {status === 'sending' ? t('formSending') : t('formSend')}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
