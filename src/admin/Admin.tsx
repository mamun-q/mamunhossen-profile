import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { Inbox, LogOut } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { LOCAL_CONTENT, cloudinaryThumb, contentFromRows, moduleValue } from '../content';
import type { ContentKey, SiteContent } from '../content';
import type { GalleryItem, LText, ProfileCard, Project, SkillArea, SocialLink } from '../data';
import { AddButton, Field, LTextField, RecordCard, SaveBar, TextField, inputCls } from './fields';
import type { SaveStatus } from './fields';

/**
 * Private admin dashboard (#/admin — linked from nowhere on the public
 * site). Sign-in uses the owner's existing Supabase Auth accounts;
 * after sign-in the caller's MeetBook `users` row must carry the
 * admin/superadmin role, and every write is independently gated by
 * RLS (public.is_admin()) server-side. Nothing secret ships here —
 * only the public publishable key is in the bundle.
 */

/* ---------------- save plumbing ---------------- */

function useSave(save: (key: ContentKey) => Promise<void>, key: ContentKey) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState('');
  const run = useCallback(async () => {
    setStatus('saving');
    setError('');
    try {
      await save(key);
      setStatus('saved');
      setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 3000);
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }, [save, key]);
  return { status, error, run };
}

/* ---------------- root: auth gate ---------------- */

type Phase = 'loading' | 'signed-out' | 'checking' | 'ready';

export default function AdminApp() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [denied, setDenied] = useState(false);
  // Audit fix M1: once a user is verified, later auth events for the
  // SAME user (TOKEN_REFRESHED fires ~hourly, plus the listener and
  // getSession both firing on load) must not re-enter 'checking' —
  // the render gate would unmount the dashboard and destroy every
  // unsaved edit in it.
  const verifiedFor = useRef<string | null>(null);

  const verifyAdmin = useCallback(async (u: User) => {
    if (verifiedFor.current === u.id) {
      setPhase('ready');
      return;
    }
    setPhase('checking');
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', u.id)
        .maybeSingle();
      const role = (data as { role?: unknown } | null)?.role;
      if (!error && (role === 'admin' || role === 'superadmin')) {
        verifiedFor.current = u.id;
        setDenied(false);
        setPhase('ready');
        return;
      }
    } catch {
      /* fall through to denied */
    }
    verifiedFor.current = null;
    setDenied(true);
    try {
      await getSupabase().auth.signOut();
    } catch {
      /* already signed out */
    }
    setPhase('signed-out');
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        setUser(data.session.user);
        void verifyAdmin(data.session.user);
      } else {
        setPhase('signed-out');
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        // A token refresh changes nothing about who this is — never
        // re-verify (see M1 above).
        if (event !== 'TOKEN_REFRESHED') void verifyAdmin(session.user);
      } else {
        verifiedFor.current = null;
        setUser(null);
        setPhase((p) => (p === 'ready' || p === 'checking' ? 'signed-out' : p));
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [verifyAdmin]);

  if (phase === 'loading' || phase === 'checking') {
    return (
      <main className="flex min-h-svh items-center justify-center px-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {phase === 'checking' ? 'Verifying admin access…' : 'Loading…'}
        </p>
      </main>
    );
  }

  if (phase === 'ready' && user) {
    return <Dashboard user={user} />;
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-10">
      <SignIn denied={denied} onAttempt={() => setDenied(false)} />
    </main>
  );
}

function SignIn({ denied, onAttempt }: { denied: boolean; onAttempt: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onAttempt();
    setBusy(true);
    setError('');
    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    // Audit fix L14: on success the form STAYS disabled — AdminApp's
    // auth listener is verifying the admin role and will replace
    // this screen; re-enabling here allowed a confusing double submit.
    if (signInError) {
      setBusy(false);
      setError(signInError.message);
    }
  };

  return (
    <div className="glass w-full max-w-sm rounded-[28px] p-7">
      <p className="font-display text-gradient text-3xl font-bold tracking-[0.08em]">LIMON</p>
      <h1 className="font-display mt-2 text-lg font-semibold text-slate-900 dark:text-white">
        Admin sign in
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Private area — site owner only.
      </p>

      {denied && (
        <p
          className="mt-4 rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          That account is not authorised for this dashboard. You have been signed out.
        </p>
      )}
      {error && (
        <p
          className="mt-4 rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
        <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={setPassword} />
        <button
          type="submit"
          disabled={busy || !email.trim() || !password}
          className="btn-glow font-display w-full rounded-full bg-gradient-to-r from-brand to-brand2 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <a
        href="#/"
        className="mt-5 block text-center text-sm text-slate-500 transition hover:text-brand dark:text-slate-400"
      >
        ← Back to the public site
      </a>
    </div>
  );
}

/* ---------------- dashboard shell ---------------- */

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'world', label: 'Digital World' },
  { id: 'links', label: 'Links' },
  { id: 'settings', label: 'Settings' },
  { id: 'messages', label: 'Messages' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function Dashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<TabId>('profile');
  const [content, setContent] = useState<SiteContent>(LOCAL_CONTENT);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [unread, setUnread] = useState(0);

  const loadContent = useCallback(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('site_content').select('key, value');
    if (error) {
      setLoadError(error.message);
    } else if (data) {
      setContent(contentFromRows(data as { key: string; value: unknown }[]));
    }
    setLoaded(true);
  }, []);

  const refreshUnread = useCallback(async () => {
    const supabase = getSupabase();
    const { count } = await supabase
      .from('site_messages')
      .select('id', { count: 'exact', head: true })
      .eq('read', false);
    if (typeof count === 'number') setUnread(count);
  }, []);

  useEffect(() => {
    void loadContent();
    void refreshUnread();
  }, [loadContent, refreshUnread]);

  const save = useCallback(
    async (key: ContentKey) => {
      const supabase = getSupabase();
      const { error } = await supabase.from('site_content').upsert(
        { key, value: moduleValue(content, key), updatedAt: Date.now() },
        { onConflict: 'key' },
      );
      if (error) throw new Error(error.message);
    },
    [content],
  );

  const signOut = async () => {
    await getSupabase().auth.signOut();
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-gradient text-2xl font-bold tracking-[0.08em]">LIMON</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Admin dashboard · {user.email ?? ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#/"
            className="glass rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:scale-105 dark:text-slate-200"
          >
            View site
          </a>
          <button
            type="button"
            onClick={() => void signOut()}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:scale-105 dark:text-slate-200"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      <nav className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
              tab === t.id
                ? 'bg-gradient-to-r from-brand to-brand2 text-white shadow-lg shadow-brand/25'
                : 'glass text-slate-600 dark:text-slate-200'
            }`}
          >
            {t.label}
            {t.id === 'messages' && unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        ))}
      </nav>

      {!loaded && (
        <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">Loading live content…</p>
      )}
      {loaded && loadError && (
        <p
          className="mt-6 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200"
          role="alert"
        >
          Could not load live content ({loadError}). You are editing the built-in defaults — saving
          will create the live rows.
        </p>
      )}

      {loaded && (
        <main className="mt-6 pb-16">
          {tab === 'profile' && <ProfileEditor content={content} setContent={setContent} save={save} />}
          {tab === 'projects' && <ProjectsEditor content={content} setContent={setContent} save={save} />}
          {tab === 'skills' && <SkillsEditor content={content} setContent={setContent} save={save} />}
          {tab === 'gallery' && <GalleryEditor content={content} setContent={setContent} save={save} />}
          {tab === 'world' && <WorldEditor content={content} setContent={setContent} save={save} />}
          {tab === 'links' && <LinksEditor content={content} setContent={setContent} save={save} />}
          {tab === 'settings' && <SettingsEditor content={content} setContent={setContent} save={save} />}
          {tab === 'messages' && <MessagesInbox onUnreadChange={setUnread} />}
        </main>
      )}
    </div>
  );
}

interface EditorProps {
  content: SiteContent;
  setContent: Dispatch<SetStateAction<SiteContent>>;
  save: (key: ContentKey) => Promise<void>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-display mb-4 text-base font-bold text-slate-900 dark:text-white">{children}</h3>
  );
}

/* ---------------- Profile ---------------- */

function ProfileEditor({ content, setContent, save }: EditorProps) {
  const { status, error, run } = useSave(save, 'profile');
  const p = content.profile;
  const setP = (patch: Partial<typeof p>) =>
    setContent({ ...content, profile: { ...p, ...patch } });
  const setCard = (i: number, card: ProfileCard) =>
    setContent({
      ...content,
      profileCards: content.profileCards.map((c, j) => (j === i ? card : c)),
    });

  return (
    <div>
      <SectionTitle>Identity</SectionTitle>
      <div className="glass space-y-4 rounded-3xl p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Brand name" value={p.brandName} onChange={(v) => setP({ brandName: v })} />
          <TextField label="Full name" value={p.fullName} onChange={(v) => setP({ fullName: v })} />
        </div>
        <LTextField label="Role" value={p.role} onChange={(v) => setP({ role: v })} />
        <LTextField label="Tagline" value={p.tagline} onChange={(v) => setP({ tagline: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Bangla line"
            value={p.banglaLine}
            onChange={(v) => setP({ banglaLine: v })}
          />
          <TextField label="Email" type="email" value={p.email} onChange={(v) => setP({ email: v })} />
        </div>
        <LTextField label="Location" value={p.location} onChange={(v) => setP({ location: v })} />
        <LTextField label="Intro" area rows={4} value={p.intro} onChange={(v) => setP({ intro: v })} />
        <TextField label="Avatar image URL" value={p.avatarUrl} onChange={(v) => setP({ avatarUrl: v })} />
        <TextField
          label="Portrait image URL"
          value={p.portraitUrl}
          onChange={(v) => setP({ portraitUrl: v })}
        />
        {/* Audit fix M2: no "Site URL" field here — profile.siteUrl
            was saved but read by nothing. The live site URL lives in
            Settings (it drives the footer Share button). */}
      </div>

      <div className="mt-8">
        <SectionTitle>Profile cards (About / Background / Interests / Goals / Vision / Journey)</SectionTitle>
        <div className="space-y-4">
          {content.profileCards.map((card, i) => (
            <RecordCard
              key={card.id}
              title={card.title.en || card.id}
              onRemove={() => {
                if (window.confirm(`Remove the "${card.title.en}" card?`)) {
                  setContent({
                    ...content,
                    profileCards: content.profileCards.filter((_, j) => j !== i),
                  });
                }
              }}
            >
              <TextField
                label="Icon key (user, journey, heart, target, eye, spark…)"
                value={card.icon}
                onChange={(v) => setCard(i, { ...card, icon: v })}
              />
              <LTextField
                label="Title"
                value={card.title}
                onChange={(v) => setCard(i, { ...card, title: v })}
              />
              <LTextField
                label="Body"
                area
                rows={4}
                value={card.body}
                onChange={(v) => setCard(i, { ...card, body: v })}
              />
            </RecordCard>
          ))}
          <AddButton
            label="Add profile card"
            onClick={() =>
              setContent({
                ...content,
                profileCards: [
                  ...content.profileCards,
                  {
                    id: `card-${Date.now().toString(36)}`,
                    icon: 'spark',
                    title: { en: '', bn: '' },
                    body: { en: '', bn: '' },
                  },
                ],
              })
            }
          />
        </div>
      </div>

      <SaveBar status={status} error={error} onSave={() => void run()} />
    </div>
  );
}

/* ---------------- Projects ---------------- */

function TechField({ value, onCommit, itemKey }: { value: string[]; onCommit: (v: string[]) => void; itemKey: string }) {
  const [text, setText] = useState(value.join(', '));
  // Audit fix L6: re-sync the local text when the editor switches to
  // a different project — the stale text of the previous project
  // could otherwise be committed over this one's tech list on blur.
  useEffect(() => {
    setText(value.join(', '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey]);
  return (
    <Field label="Technologies (comma separated)">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() =>
          onCommit(
            text
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        className={inputCls}
      />
    </Field>
  );
}

function ProjectsEditor({ content, setContent, save }: EditorProps) {
  const { status, error, run } = useSave(save, 'projects');
  const setProject = (i: number, proj: Project) =>
    setContent({ ...content, projects: content.projects.map((x, j) => (j === i ? proj : x)) });

  return (
    <div>
      <SectionTitle>Projects</SectionTitle>
      <div className="space-y-4">
        {content.projects.map((proj, i) => (
          <RecordCard
            key={proj.id}
            title={proj.name || proj.id}
            onRemove={() => {
              if (window.confirm(`Delete the project "${proj.name}"?`)) {
                setContent({ ...content, projects: content.projects.filter((_, j) => j !== i) });
              }
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Name" value={proj.name} onChange={(v) => setProject(i, { ...proj, name: v })} />
              <TextField
                label="Monogram (visual letter)"
                value={proj.monogram}
                onChange={(v) => setProject(i, { ...proj, monogram: v })}
              />
            </div>
            <LTextField label="Tagline" value={proj.tagline} onChange={(v) => setProject(i, { ...proj, tagline: v })} />
            <LTextField
              label="Description"
              area
              rows={3}
              value={proj.description}
              onChange={(v) => setProject(i, { ...proj, description: v })}
            />
            <LTextField label="Status" value={proj.status} onChange={(v) => setProject(i, { ...proj, status: v })} />
            <TechField itemKey={proj.id} value={proj.tech} onCommit={(v) => setProject(i, { ...proj, tech: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Live demo URL (blank = no button)"
                value={proj.liveUrl ?? ''}
                onChange={(v) => setProject(i, { ...proj, liveUrl: v.trim() ? v : undefined })}
              />
              <TextField
                label="GitHub URL (blank = no button)"
                value={proj.githubUrl ?? ''}
                onChange={(v) => setProject(i, { ...proj, githubUrl: v.trim() ? v : undefined })}
              />
            </div>
            <TextField
              label="Card gradient (CSS)"
              value={proj.gradient}
              onChange={(v) => setProject(i, { ...proj, gradient: v })}
            />
          </RecordCard>
        ))}
        <AddButton
          label="Add project"
          onClick={() =>
            setContent({
              ...content,
              projects: [
                ...content.projects,
                {
                  id: `project-${Date.now().toString(36)}`,
                  name: 'New Project',
                  tagline: { en: '', bn: '' },
                  description: { en: '', bn: '' },
                  tech: [],
                  status: { en: 'In Development', bn: 'উন্নয়নাধীন' },
                  gradient: 'linear-gradient(135deg,#1877f2 0%,#7b61ff 60%,#c86bff 100%)',
                  monogram: 'N',
                },
              ],
            })
          }
        />
      </div>
      <SaveBar status={status} error={error} onSave={() => void run()} />
    </div>
  );
}

/* ---------------- Skills ---------------- */

function SkillsEditor({ content, setContent, save }: EditorProps) {
  const { status, error, run } = useSave(save, 'skills');
  const setSkill = (i: number, skill: SkillArea) =>
    setContent({ ...content, skills: content.skills.map((x, j) => (j === i ? skill : x)) });

  return (
    <div>
      <SectionTitle>Skills &amp; expertise areas</SectionTitle>
      <div className="space-y-4">
        {content.skills.map((skill, i) => (
          <RecordCard
            key={skill.id}
            title={skill.title.en || skill.id}
            onRemove={() => {
              if (window.confirm(`Remove the "${skill.title.en}" skill area?`)) {
                setContent({ ...content, skills: content.skills.filter((_, j) => j !== i) });
              }
            }}
          >
            <TextField
              label="Icon key (cpu, palette, code, bot, puzzle, bulb…)"
              value={skill.icon}
              onChange={(v) => setSkill(i, { ...skill, icon: v })}
            />
            <LTextField label="Title" value={skill.title} onChange={(v) => setSkill(i, { ...skill, title: v })} />
            <LTextField
              label="Description"
              area
              rows={3}
              value={skill.description}
              onChange={(v) => setSkill(i, { ...skill, description: v })}
            />
          </RecordCard>
        ))}
        <AddButton
          label="Add skill area"
          onClick={() =>
            setContent({
              ...content,
              skills: [
                ...content.skills,
                {
                  id: `skill-${Date.now().toString(36)}`,
                  icon: 'spark',
                  title: { en: '', bn: '' },
                  description: { en: '', bn: '' },
                },
              ],
            })
          }
        />
      </div>
      <SaveBar status={status} error={error} onSave={() => void run()} />
    </div>
  );
}

/* ---------------- Gallery ---------------- */

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/e3sdmsgs/image/upload';

function GalleryEditor({ content, setContent, save }: EditorProps) {
  const { status, error, run } = useSave(save, 'gallery');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Portrait');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const setItem = (i: number, item: GalleryItem) =>
    setContent((prev) => ({ ...prev, gallery: prev.gallery.map((x, j) => (j === i ? item : x)) }));

  // Audit fix H2: functional update — the multi-file upload loop
  // awaits each Cloudinary upload and calls addItem again; building
  // from the render-scope `content` snapshot made every iteration
  // overwrite the previous one, so only the LAST photo survived.
  const addItem = (src: string, category: string) =>
    setContent((prev) => ({
      ...prev,
      gallery: [
        ...prev.gallery,
        {
          id: `photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          src,
          // Audit-2 A1: store a real 480px Cloudinary derivative as
          // the thumb, not the multi-MB original.
          thumb: cloudinaryThumb(src),
          alt: { en: '', bn: '' },
          category: category.trim() || 'Portrait',
        },
      ],
    }));

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', 'meetbook');
        const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: fd });
        if (!res.ok) throw new Error(`Upload failed (HTTP ${res.status})`);
        const json = (await res.json()) as { secure_url?: string };
        if (!json.secure_url) throw new Error('Upload returned no URL');
        addItem(json.secure_url, newCategory);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    }
    setUploading(false);
  };

  return (
    <div>
      <SectionTitle>Photo gallery</SectionTitle>

      <div className="glass space-y-4 rounded-3xl p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <TextField
            label="Add photo by URL"
            value={newUrl}
            onChange={setNewUrl}
            placeholder="https://…"
          />
          <TextField label="Category" value={newCategory} onChange={setNewCategory} />
          <button
            type="button"
            disabled={!newUrl.trim()}
            onClick={() => {
              addItem(newUrl.trim(), newCategory);
              setNewUrl('');
            }}
            className="btn-glow rounded-full bg-gradient-to-r from-brand to-brand2 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <div>
          <span className="mb-1 block text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            …or upload photos (Cloudinary)
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => {
              void onFiles(e.target.files);
              e.target.value = '';
            }}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-brand file:to-brand2 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:opacity-50 dark:text-slate-300"
          />
          {uploading && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Uploading…</p>}
          {uploadError && (
            <p className="mt-2 text-sm text-red-500" role="alert">
              {uploadError}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Uploaded photos are added below — press “Save changes” to publish them.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {content.gallery.map((item, i) => (
          <RecordCard
            key={item.id}
            title={item.alt.en || item.id}
            onRemove={() => {
              if (window.confirm('Remove this photo from the gallery?')) {
                setContent({ ...content, gallery: content.gallery.filter((_, j) => j !== i) });
              }
            }}
          >
            <img
              src={item.thumb}
              alt=""
              className="h-28 w-28 rounded-2xl object-cover"
              loading="lazy"
            />
            <TextField label="Full image URL" value={item.src} onChange={(v) => setItem(i, { ...item, src: v })} />
            <TextField
              label="Thumbnail URL"
              value={item.thumb}
              onChange={(v) => setItem(i, { ...item, thumb: v })}
            />
            <TextField
              label="Category"
              value={item.category}
              onChange={(v) => setItem(i, { ...item, category: v })}
            />
            <LTextField label="Caption / alt text" value={item.alt} onChange={(v) => setItem(i, { ...item, alt: v })} />
          </RecordCard>
        ))}
      </div>
      <SaveBar status={status} error={error} onSave={() => void run()} />
    </div>
  );
}

/* ---------------- Digital World (achievements module) ---------------- */

function LTextListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: LText[];
  onChange: (v: LText[]) => void;
}) {
  return (
    <div>
      <SectionTitle>{label}</SectionTitle>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="glass rounded-3xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">#{i + 1}</span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Remove this item?')) {
                    onChange(items.filter((_, j) => j !== i));
                  }
                }}
                className="rounded-full border border-red-300/60 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
            <div className="space-y-2">
              <span className="relative block">
                <input
                  type="text"
                  value={item.en}
                  onChange={(e) =>
                    onChange(items.map((x, j) => (j === i ? { ...x, en: e.target.value } : x)))
                  }
                  className={`${inputCls} pl-12`}
                  lang="en"
                />
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[10px] font-bold tracking-wider text-slate-400">
                  EN
                </span>
              </span>
              <span className="relative block">
                <input
                  type="text"
                  value={item.bn}
                  onChange={(e) =>
                    onChange(items.map((x, j) => (j === i ? { ...x, bn: e.target.value } : x)))
                  }
                  className={`${inputCls} pl-12`}
                  lang="bn"
                />
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[10px] font-bold tracking-wider text-slate-400">
                  বাংলা
                </span>
              </span>
            </div>
          </div>
        ))}
        <AddButton label={`Add to ${label}`} onClick={() => onChange([...items, { en: '', bn: '' }])} />
      </div>
    </div>
  );
}

function WorldEditor({ content, setContent, save }: EditorProps) {
  const { status, error, run } = useSave(save, 'achievements');
  const w = content.digitalWorld;
  const setW = (patch: Partial<typeof w>) =>
    setContent({ ...content, digitalWorld: { ...w, ...patch } });

  return (
    <div className="space-y-8">
      <LTextListEditor label="Activities" items={w.activities} onChange={(v) => setW({ activities: v })} />
      <LTextListEditor label="Achievements" items={w.achievements} onChange={(v) => setW({ achievements: v })} />
      <LTextListEditor label="Interests" items={w.interests} onChange={(v) => setW({ interests: v })} />
      <LTextListEditor label="Future plans" items={w.futurePlans} onChange={(v) => setW({ futurePlans: v })} />
      <SaveBar status={status} error={error} onSave={() => void run()} />
    </div>
  );
}

/* ---------------- Links ---------------- */

function LinksEditor({ content, setContent, save }: EditorProps) {
  const { status, error, run } = useSave(save, 'links');
  const setLink = (i: number, link: SocialLink) =>
    setContent({ ...content, socialLinks: content.socialLinks.map((x, j) => (j === i ? link : x)) });

  return (
    <div>
      <SectionTitle>Social &amp; presence links</SectionTitle>
      <div className="space-y-4">
        {content.socialLinks.map((link, i) => (
          <RecordCard
            key={link.id}
            title={link.label || link.id}
            onRemove={() => {
              if (window.confirm(`Remove the "${link.label}" link?`)) {
                setContent({ ...content, socialLinks: content.socialLinks.filter((_, j) => j !== i) });
              }
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Label" value={link.label} onChange={(v) => setLink(i, { ...link, label: v })} />
              <TextField
                label="Icon key (meetbook, github, globe, mail…)"
                value={link.icon}
                onChange={(v) => setLink(i, { ...link, icon: v })}
              />
            </div>
            <TextField label="URL" value={link.href} onChange={(v) => setLink(i, { ...link, href: v })} />
          </RecordCard>
        ))}
        <AddButton
          label="Add link"
          onClick={() =>
            setContent({
              ...content,
              socialLinks: [
                ...content.socialLinks,
                { id: `link-${Date.now().toString(36)}`, label: '', href: 'https://', icon: 'globe' },
              ],
            })
          }
        />
      </div>
      <SaveBar status={status} error={error} onSave={() => void run()} />
    </div>
  );
}

/* ---------------- Settings ---------------- */

function SettingsEditor({ content, setContent, save }: EditorProps) {
  const { status, error, run } = useSave(save, 'settings');
  const s = content.settings;
  const setS = (patch: Partial<typeof s>) => setContent({ ...content, settings: { ...s, ...patch } });

  return (
    <div>
      <SectionTitle>Site settings</SectionTitle>
      <div className="glass space-y-4 rounded-3xl p-5">
        <TextField label="Site URL" value={s.siteUrl} onChange={(v) => setS({ siteUrl: v })} />
        <TextField label="Brand name" value={s.brandName} onChange={(v) => setS({ brandName: v })} />
        <TextField
          label="Contact email"
          type="email"
          value={s.contactEmail}
          onChange={(v) => setS({ contactEmail: v })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default theme (first visit)">
            <select
              value={s.defaultTheme}
              onChange={(e) => setS({ defaultTheme: e.target.value as 'dark' | 'light' })}
              className={inputCls}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </Field>
          <Field label="Default language (first visit)">
            <select
              value={s.defaultLang}
              onChange={(e) => setS({ defaultLang: e.target.value as 'en' | 'bn' })}
              className={inputCls}
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </Field>
        </div>
        <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
          Note: the theme and language defaults apply to first-time visitors; returning visitors
          keep the choice saved on their device.
        </p>
      </div>
      <SaveBar status={status} error={error} onSave={() => void run()} />
    </div>
  );
}

/* ---------------- Messages inbox ---------------- */

interface SiteMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: number;
}

function MessagesInbox({ onUnreadChange }: { onUnreadChange: (n: number) => void }) {
  const [messages, setMessages] = useState<SiteMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = getSupabase();
    const { data, error: loadErr } = await supabase
      .from('site_messages')
      .select('*')
      .order('createdAt', { ascending: false });
    if (loadErr) {
      setError(loadErr.message);
    } else {
      const rows = (data ?? []) as SiteMessage[];
      setMessages(rows);
      onUnreadChange(rows.filter((m) => !m.read).length);
    }
    setLoading(false);
  }, [onUnreadChange]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleRead = async (m: SiteMessage) => {
    setBusyId(m.id);
    const supabase = getSupabase();
    const { error: updErr } = await supabase
      .from('site_messages')
      .update({ read: !m.read })
      .eq('id', m.id);
    if (!updErr) {
      // Audit fix L5: functional update — computing from the
      // render-scope `messages` let a slower action on another
      // message overwrite this one's already-applied change.
      setMessages((prev) => {
        const next = prev.map((x) => (x.id === m.id ? { ...x, read: !x.read } : x));
        onUnreadChange(next.filter((x) => !x.read).length);
        return next;
      });
    }
    setBusyId(null);
  };

  const remove = async (m: SiteMessage) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    setBusyId(m.id);
    const supabase = getSupabase();
    const { error: delErr } = await supabase.from('site_messages').delete().eq('id', m.id);
    if (!delErr) {
      setMessages((prev) => {
        const next = prev.filter((x) => x.id !== m.id);
        onUnreadChange(next.filter((x) => !x.read).length);
        return next;
      });
    }
    setBusyId(null);
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionTitle>
          Inbox — {messages.length} message{messages.length === 1 ? '' : 's'}
          {unread > 0 ? ` · ${unread} unread` : ''}
        </SectionTitle>
        <button
          type="button"
          onClick={() => void load()}
          className="glass rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:scale-105 dark:text-slate-200"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading messages…</p>}
      {error && (
        <p
          className="rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          Could not load messages: {error}
        </p>
      )}
      {!loading && !error && messages.length === 0 && (
        <div className="glass flex flex-col items-center rounded-3xl px-6 py-12 text-center">
          <Inbox className="h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            No messages yet. Messages sent from the website contact form will appear here.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((m) => (
          <article
            key={m.id}
            className={`glass rounded-3xl p-5 ${m.read ? 'opacity-75' : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
                  <span className="truncate">{m.name}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  <a href={`mailto:${m.email}`} className="hover:text-brand">
                    {m.email}
                  </a>{' '}
                  · {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={busyId === m.id}
                  onClick={() => void toggleRead(m)}
                  className="rounded-full border border-slate-900/10 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand/50 hover:text-brand disabled:opacity-50 dark:border-white/15 dark:text-slate-300"
                >
                  {m.read ? 'Mark unread' : 'Mark read'}
                </button>
                <button
                  type="button"
                  disabled={busyId === m.id}
                  onClick={() => void remove(m)}
                  className="rounded-full border border-red-300/60 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-200">
              {m.message}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
