import { useEffect, useRef } from 'react';

/**
 * Lightweight canvas starfield / drifting particle nebula for the hero.
 * Chosen over Three.js to keep the mobile bundle small: zero extra
 * dependencies, devicePixelRatio capped, particle count scaled to the
 * viewport, pauses when off-screen or the tab is hidden, and renders a
 * single static frame for prefers-reduced-motion.
 */
export default function Starfield({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let visible = true;

    interface Star {
      x: number;
      y: number;
      r: number;
      speed: number;
      drift: number;
      phase: number;
      hue: number;
    }
    let stars: Star[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(150, Math.floor((w * h) / 11000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.16 + 0.03,
        drift: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2,
        hue: [217, 252, 199, 265][Math.floor(Math.random() * 4)],
      }));
      if (reduced) draw(0);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(time / 1600 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 95%, 78%, ${0.75 * twinkle})`;
        ctx.fill();
      }
    };

    const tick = (time: number) => {
      if (running && visible) {
        for (const s of stars) {
          s.y -= s.speed;
          s.x += s.drift;
          if (s.y < -4) {
            s.y = h + 4;
            s.x = Math.random() * w;
          }
          if (s.x < -4) s.x = w + 4;
          if (s.x > w + 4) s.x = -4;
        }
        draw(time);
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVis = () => {
      running = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVis);

    if (!reduced) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
