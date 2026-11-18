import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, Search } from 'lucide-react';

gsap.registerPlugin(useGSAP);

// The six page styles, each with the colour it wears across the site
const STYLES = [
  ['Tech', 'Electronics', '#0071e3'],
  ['Editorial', 'Fashion & Apparel', '#f97316'],
  ['Energy', 'Sports & Outdoors', '#00e5ff'],
  ['Soft', 'Beauty & Health', '#e8a0b4'],
  ['Cozy', 'Home & Kitchen', '#c1583a'],
  ['Luxury', 'Watches & Jewelry', '#c9b27c'],
];

const DIGIT_COLORS = ['#0071e3', '#f97316', '#e8a0b4'];

const NotFoundPage = () => {
  const root = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [query, setQuery] = useState('');

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline()
          .from('.nf-digit', { yPercent: -160, opacity: 0, rotate: () => gsap.utils.random(-14, 14), duration: 1.5, stagger: 0.12, ease: 'elastic.out(1, 0.55)' })
          .from('.nf-in > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.5)
          .from('.nf-tile', { y: 30, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, 0.9);
        gsap.to('.nf-blob', { x: (i) => (i % 2 ? -50 : 60), y: (i) => (i ? 40 : -30), duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 1.2 });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const search = (e) => {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/?keyword=${encodeURIComponent(term)}` : '/');
  };

  return (
    <div ref={root} className="relative mx-auto max-w-3xl py-14 text-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="nf-blob absolute -left-10 top-4 h-64 w-64 rounded-full bg-[#0071e3]/25 blur-3xl" />
        <span className="nf-blob absolute right-0 top-24 h-72 w-72 rounded-full bg-[#f97316]/20 blur-3xl" />
        <span className="nf-blob absolute bottom-10 left-1/3 h-60 w-60 rounded-full bg-[#e8a0b4]/30 blur-3xl" />
      </div>

      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">Error 404</p>

        <h1 className="mt-4 flex justify-center gap-1 sm:gap-3 text-[clamp(7rem,26vw,14rem)] font-display font-black leading-none tracking-[-0.06em]" aria-label="404">
          {['4', '0', '4'].map((d, i) => (
            <span key={i} className="nf-digit inline-block" style={{ color: DIGIT_COLORS[i] }} aria-hidden="true">
              {d}
            </span>
          ))}
        </h1>

        <div className="nf-in mt-4 space-y-5">
          <p className="text-3xl font-sans font-semibold tracking-[-0.04em] text-slate-900 sm:text-4xl">This page wandered off.</p>
          <p className="mx-auto max-w-md text-slate-500">
            There is nothing at{' '}
            <code className="break-all rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-sm text-slate-700">{pathname}</code>. Try a search, or pick a style below.
          </p>

          <form onSubmit={search} role="search" className="relative mx-auto max-w-md">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, stores…"
              aria-label="Search products"
              className="w-full rounded-full bg-white py-4 pl-12 pr-28 text-sm text-slate-900 shadow-lg ring-1 ring-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95">
              Search
            </button>
          </form>

          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Back to the marketplace
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {STYLES.map(([name, category, color]) => (
            <li key={name} className="nf-tile">
              <Link
                to={`/?category=${encodeURIComponent(category)}`}
                className="group block rounded-3xl bg-white p-5 text-left ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl"
                style={{ '--c': color }}
              >
                <span className="block h-1.5 w-10 rounded-full transition-all duration-300 group-hover:w-16" style={{ backgroundColor: color }} />
                <span className="mt-4 block font-semibold tracking-tight text-slate-900">{name}</span>
                <span className="block text-xs text-slate-500">{category}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotFoundPage;
