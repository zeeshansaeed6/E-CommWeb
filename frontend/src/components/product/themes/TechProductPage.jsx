import React, { useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronRight, Star } from 'lucide-react';
import useCurrency from '../../../hooks/useCurrency';
import useNavHeight from '../../../hooks/useNavHeight';
import { storyBeats } from './productTheme';
import ProductBuyPanel from './ProductBuyPanel';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BLUE = '#0071e3';
const SKY = '#2997ff';
const INK = '#05070d';
const BLEED = 'relative w-screen ml-[calc(50%-50vw)]';
const TITLE = 'font-sans font-semibold tracking-[-0.045em]';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80';

const UNITS = 'Hz|kHz|MHz|GHz|mW|W|mm|cm|GB|TB|MB|MP|K|mAh|inch|nits|ms|fps|dB|V|hours?|hrs?|h|%|x';
const FIGURE_RE = new RegExp(`(\\d[\\d,.]*)\\s?(${UNITS})(?![A-Za-z])(?:\\s+(?:of\\s+)?([A-Za-z][A-Za-z-]*(?:\\s[A-Za-z][A-Za-z-]*)?))?`, 'gi');
const LEAD_STOP = /^(of|with|and|the|a|an|over|for|in|via|to|up)\s+/i;
const TRAIL_STOP = /\s+(of|with|and|the|a|an|over|for|in|via|to|up|on|at|by)$/i;

/** Pull headline numbers ("144Hz refresh rate", "65W Power Delivery") out of a product description. */
export const extractFigures = (text = '') => {
  const seen = new Set();
  const found = [];
  for (const m of text.matchAll(FIGURE_RE)) {
    const value = parseFloat(m[1].replace(/,/g, ''));
    if (Number.isNaN(value) || seen.has(m[0].toLowerCase())) continue;
    seen.add(m[0].toLowerCase());
    let label = (m[3] || '').trim();
    while (LEAD_STOP.test(`${label} `)) label = label.replace(LEAD_STOP, '');
    while (TRAIL_STOP.test(label)) label = label.replace(TRAIL_STOP, '');
    // Capitalise the first letter, but leave camelCase terms such as "sRGB" alone
    const nice = label && !/^[a-z][A-Z]/.test(label) ? label[0].toUpperCase() + label.slice(1) : label;
    found.push({ value, dec: m[1].includes('.') ? m[1].split('.')[1].length : 0, unit: m[2], label: nice });
  }
  return found.slice(0, 4);
};

/** Slim sticky product nav under the site header. */
export const ProductLocalNav = ({ product }) => {
  const { formatPrice } = useCurrency();
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  return (
    <div className={`${BLEED} sticky top-[var(--nav-h,80px)] z-40 h-[52px] border-b border-white/10 text-white backdrop-blur-xl`} style={{ backgroundColor: `${INK}e6` }}>
      <div className="mx-auto flex h-full max-w-[1100px] items-center justify-between gap-6 px-5">
        <span className="truncate text-[17px] font-semibold tracking-tight">{product.title}</span>
        <nav className="hidden items-center gap-7 text-xs text-white/70 md:flex">
          {[['Overview', '#tc-top'], ['Highlights', '#tc-highlights'], ['Specs', '#tc-specs']].map(([l, h]) => (
            <a key={l} href={h} className="transition-colors hover:text-white">{l}</a>
          ))}
        </nav>
        <div className="flex flex-shrink-0 items-center gap-4">
          <span className="hidden text-xs text-white/70 sm:block">{formatPrice(price)}</span>
          <a href="#buy" className="rounded-full px-3.5 py-1 text-xs font-medium text-white transition-colors hover:brightness-110" style={{ backgroundColor: BLUE }}>Buy</a>
        </div>
      </div>
    </div>
  );
};

/**
 * Electronics experience, built to look good with any product photo:
 * split hero with a tilting "device stage", headline figures parsed from the description,
 * an unpinned scroll-lit overview, sticky highlights, and a spec table.
 */
const TechProductPage = ({ product, onAdd }) => {
  const root = useRef(null);
  const { formatPrice } = useCurrency();
  useNavHeight();

  const images = product.images?.length ? product.images.map((i) => i.url) : [FALLBACK_IMG];
  const [active, setActive] = useState(0);
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const store = product.vendor?.vendorDetails?.storeName || product.vendor?.name || 'a verified vendor';
  const description = (product.description || product.title).trim();
  const intro = description.split(/(?<=[.!?])\s+/)[0];
  const words = description.split(/\s+/);
  const beats = storyBeats(product, 3);
  const rating = Number(product.rating) || 0;

  const figures = useMemo(() => {
    const parsed = extractFigures(description);
    if (parsed.length >= 2) return parsed;
    return [
      { value: rating, dec: 1, unit: '/5', label: 'Average rating' },
      { value: Number(product.numReviews) || 0, dec: 0, unit: '', label: 'Verified reviews' },
      { value: Number(product.stock) || 0, dec: 0, unit: '', label: 'Ready to ship' },
      discount > 0 ? { value: discount, dec: 0, unit: '%', label: 'Off right now' } : { value: 30, dec: 0, unit: '', label: 'Day free returns' },
    ];
  }, [description, rating, product.numReviews, product.stock, discount]);

  const specs = [
    ...figures.filter((f) => f.label).map((f) => [f.label, `${f.value.toFixed(f.dec)}${f.unit}`]),
    ['Brand', product.brand || '—'],
    ['Category', product.category],
    ['Sold by', store],
    ['Price', formatPrice(price)],
    ...(discount > 0 ? [['List price', formatPrice(product.price)]] : []),
    ['Rating', `${rating.toFixed(1)} / 5 (${product.numReviews || 0} reviews)`],
    ['Availability', product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'],
    ['Delivery', 'Ships directly from the vendor'],
    ['Returns', '30 days'],
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.tc-copy > *', { y: 36, opacity: 0, duration: 0.9, stagger: 0.09 })
          .from('.tc-stage-wrap', { y: 70, scale: 0.93, opacity: 0, duration: 1.2 }, 0.15)
          .from('.tc-chip', { scale: 0.6, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(2)' }, 0.8);

        gsap.to('.tc-chip', { y: (i) => (i % 2 ? 9 : -9), duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4 });
        gsap.to('.tc-glow', { opacity: 0.55, scale: 1.12, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

        // Gentle pointer tilt on the stage
        const stage = root.current.querySelector('.tc-stage');
        const rx = gsap.quickTo(stage, 'rotationX', { duration: 0.7, ease: 'power3.out' });
        const ry = gsap.quickTo(stage, 'rotationY', { duration: 0.7, ease: 'power3.out' });
        const onMove = (e) => {
          rx(-(e.clientY / window.innerHeight - 0.5) * 7);
          ry((e.clientX / window.innerWidth - 0.5) * 9);
        };
        window.addEventListener('pointermove', onMove);
        gsap.to('.tc-stage img', { scale: 1.1, yPercent: -3, ease: 'none', scrollTrigger: { trigger: '.tc-hero', start: 'top top', end: 'bottom top', scrub: 1 } });

        // Figures count up
        gsap.utils.toArray('[data-count]').forEach((el) => {
          const o = { v: 0 };
          gsap.to(o, {
            v: Number(el.dataset.end),
            duration: 1.8,
            ease: 'power3.out',
            onUpdate: () => {
              el.textContent = o.v.toFixed(Number(el.dataset.dec));
            },
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });
        gsap.from('.tc-fig', { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.tc-figs', start: 'top 85%', once: true } });

        // Overview text lights up word by word while it scrolls past (not pinned, so no dead space)
        gsap.fromTo('.tc-word', { opacity: 0.16 }, { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: '.tc-overview', start: 'top 72%', end: 'bottom 55%', scrub: 1 } });

        // Highlights: the sticky photo changes as each card takes focus
        const slides = gsap.utils.toArray('.tc-slide');
        const show = (idx) =>
          slides.forEach((s, j) => gsap.to(s, { opacity: j === idx ? 1 : 0, scale: j === idx ? 1 : 1.08, duration: 0.9, ease: 'power2.out', overwrite: 'auto' }));
        gsap.utils.toArray('.tc-card').forEach((card, i) => {
          gsap.from(card, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%', once: true } });
          ScrollTrigger.create({
            trigger: card,
            start: 'top 58%',
            end: 'bottom 58%',
            onToggle: (self) => {
              gsap.to(card.querySelector('.tc-bar'), { scaleX: self.isActive ? 1 : 0, duration: 0.6, ease: 'power3.out' });
              gsap.to(card, { opacity: self.isActive ? 1 : 0.45, duration: 0.4 });
              if (self.isActive) show(i);
            },
          });
        });
        show(0);

        gsap.from('.tc-spec', { opacity: 0, y: 24, stagger: 0.05, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: '.tc-specs', start: 'top 75%', once: true } });

        return () => window.removeEventListener('pointermove', onMove);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [product._id] }
  );

  const refresh = () => ScrollTrigger.refresh();

  return (
    <div ref={root} className="-mt-8 sm:-mt-12" id="tc-top">
      <ProductLocalNav product={product} />

      {/* ───────── Hero ───────── */}
      <section className={`tc-hero ${BLEED} overflow-hidden text-white`} style={{ backgroundColor: INK }}>
        <div className="tc-glow absolute -right-32 -top-40 h-[40rem] w-[40rem] rounded-full opacity-35 blur-[120px]" style={{ backgroundColor: BLUE }} aria-hidden="true" />
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 lg:min-h-[calc(100svh-var(--nav-h,80px)-52px)] lg:grid-cols-[1fr_1.05fr] lg:py-16">
          <div className="tc-copy">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: product.stock > 0 ? '#34d399' : '#f87171' }} />
              {product.category}{product.brand ? ` · ${product.brand}` : ''}
            </span>
            <h1 className={`${TITLE} mt-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-[clamp(2.4rem,5.4vw,5rem)] leading-[1.02] text-transparent`}>{product.title}</h1>
            {intro && <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">{intro}</p>}

            <p className="mt-8 text-2xl font-medium">
              From {formatPrice(price)}
              {discount > 0 && <span className="ml-3 text-base text-slate-500 line-through">{formatPrice(product.price)}</span>}
              {discount > 0 && <span className="ml-3 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-sm font-semibold text-rose-300">Save {discount}%</span>}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-6">
              <a href="#buy" className="rounded-full px-7 py-3 text-[15px] font-semibold text-white transition hover:brightness-110 active:scale-95" style={{ backgroundColor: BLUE }}>Buy</a>
              <a href="#tc-specs" className="inline-flex items-center text-[15px] hover:underline" style={{ color: SKY }}>See the specs <ChevronRight className="h-5 w-5" /></a>
            </div>

            <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <li className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {rating.toFixed(1)} <span className="text-slate-500">({product.numReviews || 0})</span></li>
              <li>{product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}</li>
              <li>Sold by {store}</li>
            </ul>
          </div>

          <div className="tc-stage-wrap [perspective:1400px]">
            <div className="tc-stage relative [transform-style:preserve-3d]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-700 to-slate-900 shadow-[0_50px_120px_-30px_rgba(0,113,227,.55)] ring-1 ring-white/20">
                {images.map((src, i) => (
                  <img key={src + i} src={src} alt={i === 0 ? product.title : ''} onLoad={refresh} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`} />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/5" aria-hidden="true" />
              </div>

              {figures.slice(0, 2).map((f, i) => (
                <div
                  key={f.label + i}
                  className={`tc-chip absolute rounded-2xl bg-slate-950/70 px-4 py-3 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl ${i === 0 ? '-left-4 top-[14%] sm:-left-8' : '-right-3 bottom-[12%] sm:-right-8'}`}
                >
                  <p className="text-2xl font-semibold tracking-tight">{f.value.toFixed(f.dec)}<span className="text-base" style={{ color: SKY }}>{f.unit}</span></p>
                  {f.label && <p className="text-[11px] uppercase tracking-widest text-slate-400">{f.label}</p>}
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <div className="mt-6 flex justify-center gap-3">
                {images.map((src, i) => (
                  <button key={src + i} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} className={`h-14 w-14 overflow-hidden rounded-xl ring-2 transition ${i === active ? 'ring-[#0071e3]' : 'opacity-60 ring-transparent hover:opacity-100'}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────── Key figures ───────── */}
      <section className={`tc-figs ${BLEED} px-5 py-20 text-white`} style={{ backgroundColor: '#0a0f1a' }}>
        <div className={`mx-auto grid max-w-[1100px] gap-x-6 gap-y-12 text-center ${figures.length >= 4 ? 'grid-cols-2 lg:grid-cols-4' : figures.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
          {figures.map((f, i) => (
            <div key={f.label + i} className="tc-fig">
              <p className={`${TITLE} text-5xl sm:text-6xl`}>
                <span className="bg-gradient-to-b from-white to-[#2997ff] bg-clip-text text-transparent">
                  <span data-count data-end={f.value} data-dec={f.dec}>{f.value.toFixed(f.dec)}</span>
                  {f.unit}
                </span>
              </p>
              {f.label && <p className="mt-3 text-[15px] text-slate-400">{f.label}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Overview (word by word, not pinned) ───────── */}
      <section id="tc-overview" className={`tc-overview ${BLEED} px-6 py-28 text-white sm:py-36`} style={{ backgroundColor: INK }}>
        <div className="mx-auto max-w-[1000px]">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: SKY }}>Overview</p>
          <p className={`${TITLE} text-[30px] leading-[1.12] sm:text-5xl lg:text-[60px]`}>
            {words.map((w, i) => (
              <span key={i} className="tc-word inline-block motion-safe:opacity-[0.16] mr-[0.26em]">{w}</span>
            ))}
          </p>
        </div>
      </section>

      {/* ───────── Highlights (sticky photo + cards) ───────── */}
      <section id="tc-highlights" className={`${BLEED} px-5 py-24 text-white`} style={{ backgroundColor: '#0a0f1a' }}>
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-2">
          <div className="self-start lg:sticky" style={{ top: 'calc(var(--nav-h, 80px) + 52px + 1.5rem)' }}>
            <div className="relative mx-auto aspect-square max-h-[72vh] overflow-hidden rounded-[2.5rem] bg-slate-800 shadow-[0_40px_100px_-30px_rgba(0,113,227,.5)] ring-1 ring-white/15">
              {beats.map((_, i) => (
                <img
                  key={i}
                  src={images[i % images.length]}
                  alt=""
                  onLoad={refresh}
                  className="tc-slide absolute inset-0 h-full w-full object-cover"
                  style={{ opacity: i === 0 ? 1 : 0, objectPosition: images.length > 1 ? 'center' : ['50% 50%', '15% 40%', '85% 60%', '50% 15%', '25% 85%', '75% 25%'][i % 6], transform: images.length > 1 ? undefined : `scale(${1 + (i % 3) * 0.2})` }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:space-y-[28vh] lg:py-[12vh]">
            {beats.map((b, i) => (
              <article key={i} className="tc-card rounded-[2rem] bg-white/[0.05] p-8 ring-1 ring-white/10 backdrop-blur-xl sm:p-10">
                <p className="font-mono text-sm tracking-widest" style={{ color: SKY }}>{String(i + 1).padStart(2, '0')}</p>
                <p className={`${TITLE} mt-3 text-3xl leading-tight sm:text-4xl`}>{b}</p>
                <span className="tc-bar mt-7 block h-[3px] w-24 origin-left rounded-full" style={{ backgroundColor: BLUE, transform: 'scaleX(0)' }} />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Specs ───────── */}
      <section id="tc-specs" className={`tc-specs ${BLEED} bg-[#f5f5f7] px-6 py-24 text-[#1d1d1f] scroll-mt-32`}>
        <div className="mx-auto max-w-[1000px]">
          <h2 className={`${TITLE} text-4xl sm:text-6xl`}>Tech specs.</h2>
          <dl className="mt-12 divide-y divide-[#d2d2d7] border-y border-[#d2d2d7]">
            {specs.map(([k, v]) => (
              <div key={k} className="tc-spec grid grid-cols-1 gap-1 py-5 sm:grid-cols-[240px_1fr] sm:gap-8">
                <dt className="text-sm font-semibold text-[#6e6e73]">{k}</dt>
                <dd className="text-[17px]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ProductBuyPanel product={product} onAdd={onAdd} accent={BLUE} bg={INK} fg="#ffffff" muted="rgba(255,255,255,.55)" headingClass="font-sans font-semibold tracking-[-0.04em]" />
    </div>
  );
};

export default TechProductPage;
