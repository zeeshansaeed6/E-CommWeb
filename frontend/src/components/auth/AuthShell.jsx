import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import axiosClient from '../../api/axiosClient';
import useNavHeight from '../../hooks/useNavHeight';
import ThemedThumb from '../common/ThemedThumb';

gsap.registerPlugin(useGSAP);

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';
const ROTATE_MS = 5200;

// One slide per product theme: its palette, type voice and the products it showcases.
const SLIDES = [
  { theme: 'tech', title: 'Cinematic tech.', sub: 'Scroll-driven product stories.', accent: '#0071e3', dark: true, bg: 'radial-gradient(ellipse at 30% 15%, #1e40af 0%, #050510 62%)', type: 'font-sans font-semibold tracking-[-0.045em]', size: 'w-60 h-72', match: (p) => p.category === 'Electronics' && p.theme !== 'luxury' },
  { theme: 'editorial', title: 'Fashion, edited.', sub: 'Bold type. Sharp looks.', accent: '#f97316', dark: false, bg: '#f3efe8', type: 'font-display font-black uppercase tracking-[-0.04em]', size: 'w-60 h-72', match: (p) => p.category === 'Fashion & Apparel' },
  { theme: 'energy', title: 'No limits.', sub: 'Gear built to move.', accent: '#00e5ff', dark: true, bg: 'linear-gradient(135deg, #0a0a0b 55%, #062b33 100%)', type: 'font-display font-black italic uppercase tracking-[-0.03em]', size: 'w-60 h-72', match: (p) => p.category === 'Sports & Outdoors' },
  { theme: 'soft', title: 'Gentle rituals.', sub: 'Beauty, softly.', accent: '#e8a0b4', dark: false, bg: 'linear-gradient(160deg, #fbf6f1 0%, #f4cdd9 100%)', type: 'font-serif italic font-medium tracking-tight', size: 'w-64 h-64', match: (p) => p.category === 'Beauty & Health' },
  { theme: 'cozy', title: 'Make home yours.', sub: 'Warm, considered pieces.', accent: '#c1583a', dark: false, bg: '#f2ebdf', type: 'font-serif font-semibold tracking-tight', size: 'w-60 h-72', match: (p) => p.category === 'Home & Kitchen' },
  { theme: 'luxury', title: 'Timeless.', sub: 'Pieces that last generations.', accent: '#c9b27c', dark: true, bg: 'radial-gradient(ellipse at 50% 25%, #12583f 0%, #031812 70%)', type: 'font-serif font-medium tracking-tight', size: 'w-56 h-80', match: (p) => p.theme === 'luxury' },
];

// Entrance motion flavour per theme
const enter = (el, theme) => {
  const img = el.querySelector('.stage-img');
  const items = el.querySelectorAll('.stage-item');
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.fromTo(items, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 });
  switch (theme) {
    case 'tech': tl.fromTo(img, { scale: 0.8, y: 60, opacity: 0, filter: 'blur(14px)' }, { scale: 1, y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.3 }, 0); break;
    case 'editorial': tl.fromTo(img, { clipPath: 'inset(0 0 100% 0)', y: 30 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.2, ease: 'expo.out' }, 0); break;
    case 'energy': tl.fromTo(img, { xPercent: 70, rotate: 18, opacity: 0 }, { xPercent: 0, rotate: -4, opacity: 1, duration: 1.1, ease: 'back.out(1.4)' }, 0); break;
    case 'soft': tl.fromTo(img, { scale: 0.55, opacity: 0, filter: 'blur(22px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.6, ease: 'expo.out' }, 0); break;
    case 'cozy': tl.fromTo(img, { y: -240, rotate: 6, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 1.7, ease: 'elastic.out(1, 0.55)' }, 0); break;
    default: tl.fromTo(img, { yPercent: 18, opacity: 0, scale: 0.94 }, { yPercent: 0, opacity: 1, scale: 1, duration: 1.4 }, 0);
  }
  return tl;
};

export const AUTH_INPUT =
  'w-full rounded-2xl bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 ring-1 ring-slate-200 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900';

export const AuthField = ({ label, icon: Icon, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</span>
    <span className="relative block">
      {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
      {children}
    </span>
  </label>
);

/**
 * Split-screen shell for login/register. The left stage cycles through the six product
 * themes (using real catalogue products); the right panel holds the form (children).
 */
const AuthShell = ({ children }) => {
  const root = useRef(null);
  const [idx, setIdx] = useState(0);
  const [products, setProducts] = useState([]);
  useNavHeight();

  useEffect(() => {
    let alive = true;
    axiosClient
      .get('/products')
      .then(({ data }) => alive && setProducts(data.products || []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduced) return undefined;
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced) return undefined;
      const slide = root.current.querySelector('.stage-slide.is-active');
      const tl = slide ? enter(slide, SLIDES[idx].theme) : null;
      return () => tl?.kill();
    },
    { scope: root, dependencies: [idx, products.length] }
  );

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from('.auth-panel > *', { y: 26, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out' });
    },
    { scope: root }
  );

  const slide = SLIDES[idx];

  return (
    <div
      ref={root}
      className="relative w-screen ml-[calc(50%-50vw)] -mt-8 sm:-mt-12 -mb-8 sm:-mb-12 grid lg:grid-cols-[1.05fr_1fr]"
      style={{ minHeight: 'calc(100svh - var(--nav-h, 80px))' }}
    >
      {/* Theme stage (desktop) */}
      <aside className="relative hidden overflow-hidden lg:block" aria-hidden="true">
        {SLIDES.map((s, i) => {
          const product = products.find(s.match);
          const active = i === idx;
          return (
            <div
              key={s.theme}
              className={`stage-slide absolute inset-0 flex flex-col items-center justify-center px-10 text-center transition-opacity duration-1000 ${active ? 'is-active opacity-100' : 'opacity-0'}`}
              style={{ background: s.bg, color: s.dark ? '#fff' : '#1a1a1a' }}
            >
              <p className="stage-item text-xs font-bold uppercase tracking-[0.35em]" style={{ color: s.accent }}>
                {s.theme}
              </p>
              <h2 className={`stage-item mt-3 text-5xl xl:text-6xl leading-[1.02] ${s.type}`}>{s.title}</h2>
              <p className="stage-item mt-3 max-w-xs text-base opacity-70">{s.sub}</p>
              <div className="stage-img mt-10">
                <ThemedThumb src={product?.images?.[0]?.url || FALLBACK_IMG} theme={s.theme} accent={s.accent} size={s.size} />
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.theme}
              type="button"
              tabIndex={-1}
              onClick={() => setIdx(i)}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: i === idx ? 28 : 8, backgroundColor: i === idx ? slide.accent : slide.dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.2)' }}
            />
          ))}
        </div>
      </aside>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-white px-5 py-14 sm:px-10">
        <div className="auth-panel w-full max-w-md space-y-7">{children}</div>
      </section>
    </div>
  );
};

export default AuthShell;
