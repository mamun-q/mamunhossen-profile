import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContent } from '../content';
import { usePrefs } from '../prefs';
import { Icon } from './icons';
import { Reveal, SectionHeading } from './Chrome';

export default function GallerySection() {
  const { t, lang } = usePrefs();
  const { gallery } = useContent();
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(gallery.map((g) => g.category)))],
    [gallery],
  );
  const [filter, setFilter] = useState('All');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // Category labels localised where a translation is known (audit
  // fix L8); admin-defined categories fall back to their raw text.
  const catLabel = (c: string): string => {
    if (c === 'All') return t('galleryAll');
    if (c === 'Portrait') return lang === 'bn' ? 'প্রতিকৃতি' : 'Portrait';
    return c;
  };

  const items = useMemo(
    () => (filter === 'All' ? gallery : gallery.filter((g) => g.category === filter)),
    [filter, gallery],
  );

  // Lightbox focus management (audit fix L1): focus moves into the
  // dialog on open, Tab cycles inside it, and focus returns to the
  // thumbnail that opened it on close.
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const openAt = (i: number) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setOpenIdx(i);
  };
  const close = useCallback(() => {
    setOpenIdx(null);
    openerRef.current?.focus?.();
    openerRef.current = null;
  }, []);
  const step = useCallback(
    (dir: 1 | -1) => {
      setOpenIdx((cur) => (cur === null ? cur : (cur + dir + items.length) % items.length));
    },
    [items.length],
  );

  const prevOpenRef = useRef<number | null>(null);
  useEffect(() => {
    if (openIdx === null) {
      prevOpenRef.current = null;
      return;
    }
    // Audit-2 A3: move focus into the dialog only when it OPENS —
    // re-focusing Close on every photo step yanked focus away from
    // the Next/Previous button the user just used.
    if (prevOpenRef.current === null) closeBtnRef.current?.focus();
    prevOpenRef.current = openIdx;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button'));
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [openIdx, close, step]);

  const current = openIdx !== null ? items[openIdx] : null;

  return (
    <section id="gallery" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker={t('galleryKicker')} title={t('galleryTitle')} />

        {/* Audit fix L2: these are toggle filters, not tabs — plain
            buttons with aria-pressed, no tab pattern promised. */}
        <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Gallery categories">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={`flex min-h-11 items-center rounded-full px-4 py-2.5 text-sm font-medium transition ${
                filter === c
                  ? 'bg-gradient-to-r from-brand to-brand2 text-white shadow-lg shadow-brand/25'
                  : 'glass text-slate-600 hover:scale-105 dark:text-slate-200'
              }`}
            >
              {catLabel(c)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <button
                type="button"
                onClick={() => openAt(i)}
                className="group relative block w-full overflow-hidden rounded-3xl"
                aria-label={item.alt[lang]}
                data-hover
              >
                <img
                  src={item.thumb}
                  alt={item.alt[lang]}
                  loading="lazy"
                  width={480}
                  height={480}
                  className="aspect-square w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold text-white opacity-0 backdrop-blur transition duration-500 group-hover:opacity-100">
                  {catLabel(item.category)}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* full-screen viewer */}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={current.alt[lang]}
            onClick={close}
            ref={dialogRef}
          >
            <motion.figure
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={current.src}
                alt={current.alt[lang]}
                className="max-h-[82svh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <figcaption className="mt-4 text-center text-sm text-slate-300">
                {current.alt[lang]} · {catLabel(current.category)}
              </figcaption>
            </motion.figure>

            <button
              type="button"
              onClick={close}
              ref={closeBtnRef}
              className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label={t('close')}
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  aria-label={t('previous')}
                >
                  <Icon name="chevL" className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  aria-label={t('next')}
                >
                  <Icon name="chevR" className="h-5 w-5" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
