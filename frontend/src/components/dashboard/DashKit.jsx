import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Search, X } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export const DASH_INPUT =
  'w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900';
export const DASH_LABEL = 'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500';
export const TH = 'px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400';

/** Entrance motion shared by every dashboard page: header, stat cards, then panels. */
export const useDashMotion = (scope, deps = []) => {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.dk-head > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
        // The nav is animated as one block: its overflow-x strip would clip moving links
        gsap.from('.dk-nav', { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.15 });
        gsap.from('.dk-stat', { y: 32, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.1 });
        gsap.from('.dk-panel', { y: 36, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 });
      });
      return () => mm.revert();
    },
    { scope, dependencies: deps }
  );
};

export const DashHeader = ({ kicker, icon: Icon, title, subtitle, actions, accent = '#0071e3' }) => (
  <div className="dk-head flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <span
        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
        style={{ backgroundColor: `${accent}1f`, color: accent }}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />} {kicker}
      </span>
      <h1 className="mt-4 text-5xl sm:text-6xl font-sans font-semibold tracking-[-0.045em] text-slate-900">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-slate-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </div>
);

/** Section switcher shared across a role's pages (replaces the ad-hoc link buttons). */
export const DashNav = ({ items }) => (
  <nav className="dk-nav flex gap-2 overflow-x-auto no-scrollbar" aria-label="Dashboard sections">
    {items.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95 ${
            isActive ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          }`
        }
      >
        {Icon && <Icon className="h-4 w-4" />} {label}
      </NavLink>
    ))}
  </nav>
);

export const StatCard = ({ label, value, hint, icon: Icon, accent = '#0071e3', dark = false }) => (
  <div
    className={`dk-stat relative overflow-hidden rounded-[1.75rem] p-6 ${dark ? 'bg-slate-950 text-white shadow-2xl' : 'bg-white ring-1 ring-slate-200/70'}`}
  >
    <div className="flex items-start justify-between gap-3">
      <p className={`text-xs font-semibold uppercase tracking-widest ${dark ? 'text-white/50' : 'text-slate-500'}`}>{label}</p>
      {Icon && (
        <span className="grid h-10 w-10 place-items-center rounded-2xl" style={{ backgroundColor: `${accent}26`, color: accent }}>
          <Icon className="h-5 w-5" />
        </span>
      )}
    </div>
    <p className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">{value}</p>
    {hint && <p className={`mt-1.5 text-xs font-medium ${dark ? 'text-white/50' : 'text-slate-500'}`}>{hint}</p>}
    <span className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: accent }} aria-hidden="true" />
  </div>
);

export const Panel = ({ children, className = '' }) => (
  <section className={`dk-panel overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-200/70 ${className}`}>{children}</section>
);

const TONES = {
  success: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-slate-100 text-slate-700',
};

export const Pill = ({ tone = 'neutral', children }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${TONES[tone]}`}>{children}</span>
);

export const SegTabs = ({ tabs, value, onChange }) => (
  <div className="dk-panel flex gap-2 overflow-x-auto no-scrollbar" role="tablist">
    {tabs.map(([id, label, count]) => (
      <button
        key={id}
        role="tab"
        aria-selected={value === id}
        onClick={() => onChange(id)}
        className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95 ${
          value === id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
        }`}
      >
        {label}
        {count !== undefined && <span className={`ml-2 ${value === id ? 'text-white/60' : 'text-slate-400'}`}>{count}</span>}
      </button>
    ))}
  </div>
);

export const SearchField = ({ value, onChange, placeholder }) => (
  <label className="relative block flex-1">
    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={`${DASH_INPUT} pl-11`} />
  </label>
);

export const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="px-8 py-20 text-center">
    <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-slate-900 text-white">
      <Icon className="h-7 w-7" />
    </span>
    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-sm text-slate-500">{text}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const Modal = ({ open, onClose, title, subtitle, children, wide = false }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`mx-auto my-8 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} animate-fade-up rounded-[2rem] bg-white p-7 shadow-2xl sm:p-9`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95 disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);
