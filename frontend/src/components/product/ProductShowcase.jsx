import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronRight } from 'lucide-react';
import useCurrency from '../../hooks/useCurrency';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80';
const BLUE = 'bg-[#0071e3] hover:bg-[#0077ed]';
const TITLE = 'font-sans font-semibold tracking-[-0.045em]';
const BLEED = 'relative w-screen ml-[calc(50%-50vw)]';
// Space below the site navbar + this page's local nav (52px)
const STICK_PAD = { paddingTop: 'calc(var(--nav-h, 80px) + 52px + 1.5rem)' };

/** Slim sticky product nav, like the bar under the main nav on Apple product pages. */
export const ProductLocalNav = ({ product }) => {
  const { formatPrice } = useCurrency();
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  useLayoutEffect(() => {
    const header = document.querySelector('header');
    if (!header) return undefined;
    const set = () => document.documentElement.style.setProperty('--nav-h', `${header.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`${BLEED} sticky top-[var(--nav-h,80px)] z-40 -mt-8 sm:-mt-12 h-[52px] bg-black/75 backdrop-blur-xl border-b border-white/10 text-white`}>
      <div className="max-w-[1024px] mx-auto h-full px-5 flex items-center justify-between gap-6">
        <span className="text-[17px] font-semibold tracking-tight truncate">{product.title}</span>
        <nav className="hidden md:flex items-center gap-7 text-xs text-white/75">
          {[['Overview', '#story'], ['Highlights', '#highlights'], ['Specs', '#specs']].map(([l, h]) => (
            <a key={l} href={h} className="hover:text-white transition-colors">{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="hidden sm:block text-xs text-white/70">{formatPrice(price)}</span>
          <a href="#buy" className={`${BLUE} px-3.5 py-1 rounded-full text-xs font-medium text-white transition-colors`}>Buy</a>
        </div>
      </div>
    </div>
  );
};

/**
 * Scroll-driven product page in the style of Apple's product pages:
 * pinned hero -> statement -> full-bleed zoom with chapters -> horizontal highlights
 * -> count-up stats -> spec table. Reduced-motion users get a static layout.
 */
const ProductShowcase = ({ product }) => {
  const root = useRef(null);
  const { formatPrice } = useCurrency();

  const images = product.images?.length ? product.images.map((i) => i.url) : [FALLBACK_IMG];
  const img = (i) => images[i % images.length];
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const store = product.vendor?.vendorDetails?.storeName || product.vendor?.name || 'a verified vendor';
  const description = (product.description || product.title).trim();
  const words = description.split(/\s+/);

  const chapters = [
    { kicker: product.category, text: `${product.brand || product.title}. Built to stand out.` },
    { kicker: 'Sold by', text: `Shipped straight from ${store}.` },
    {
      kicker: product.stock > 0 ? 'Available now' : 'Sold out',
      text: product.stock > 0 ? `${product.stock} ready to ship${discount ? `, ${discount}% off today` : ''}.` : 'Check back soon.',
    },
  ];

  const sentences = description.split(/(?<=[.!?])\s+/).filter(Boolean);
  const extras = [
    `Rated ${Number(product.rating || 0).toFixed(1)} out of 5 by ${product.numReviews || 0} verified buyers.`,
    `Sold and shipped by ${store}, protected by escrow.`,
    '30-day returns on every order.',
  ];
  const highlights = [...sentences, ...extras].slice(0, Math.max(sentences.length, 5)).slice(0, 6);

  const stats = [
    { end: Number(product.rating) || 0, dec: 1, label: 'Average rating', suffix: '/5' },
    { end: Number(product.numReviews) || 0, dec: 0, label: 'Verified reviews', suffix: '' },
    { end: Number(product.stock) || 0, dec: 0, label: 'Units ready to ship', suffix: '' },
    discount > 0
      ? { end: discount, dec: 0, label: 'Off right now', suffix: '%' }
      : { end: 30, dec: 0, label: 'Day free returns', suffix: '' },
  ];

  const specs = [
    ['Brand', product.brand || '—'],
    ['Category', product.category],
    ['Sold by', store],
    ['Price', formatPrice(price)],
    ...(discount > 0 ? [['List price', formatPrice(product.price)]] : []),
    ['Rating', `${Number(product.rating || 0).toFixed(1)} / 5 (${product.numReviews || 0} reviews)`],
    ['Availability', product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'],
    ['Delivery', 'Ships directly from the vendor'],
    ['Returns', '30 days'],
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 768px)' }, (ctx) => {
        if (!ctx.conditions.motion) return;

        // Hero: pinned; copy lifts away while the product swells and blends into black
        gsap
          .timeline({
            scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=85%', pin: true, scrub: 1, anticipatePin: 1 },
          })
          .to('.hero-copy', { opacity: 0, yPercent: -25, ease: 'none', duration: 0.5 }, 0)
          .fromTo('.hero-img', { scale: 0.9 }, { scale: 1.35, ease: 'none', duration: 1 }, 0);

        // Statement: each word lights up while pinned
        gsap.fromTo(
          '.story-word',
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.12,
            scrollTrigger: { trigger: '.story', start: 'top top', end: () => `+=${Math.max(words.length * 26, 90)}%`, pin: true, scrub: 1, anticipatePin: 1 },
          }
        );

        // Zoom: image opens from a card to full-bleed, then chapters play over it
        const slides = gsap.utils.toArray('.zoom-img');
        const chapterEls = gsap.utils.toArray('.chapter');
        const zoom = gsap.timeline({
          scrollTrigger: { trigger: '.zoom', start: 'top top', end: `+=${(chapterEls.length + 1) * 100}%`, pin: true, scrub: 1, anticipatePin: 1 },
        });
        zoom.fromTo('.zoom-frame', { clipPath: 'inset(16% 24% 16% 24% round 44px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 });
        chapterEls.forEach((el, i) => {
          if (slides[i] && i > 0) zoom.fromTo(slides[i], { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.6 }, '>-0.3');
          zoom.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'none', duration: 0.5 });
          zoom.to(el, { opacity: 0, y: -40, ease: 'none', duration: 0.5 }, '>0.5');
        });

        // Highlights: horizontal track driven by vertical scroll (desktop only)
        if (ctx.conditions.desktop) {
          const track = root.current.querySelector('.hl-track');
          gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth + 80),
            ease: 'none',
            scrollTrigger: { trigger: '.highlights', start: 'top top', end: () => `+=${track.scrollWidth}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
          });
        }

        // Stats count up
        gsap.utils.toArray('[data-count]').forEach((el) => {
          const o = { v: 0 };
          gsap.to(o, {
            v: Number(el.dataset.end),
            duration: 1.8,
            ease: 'power3.out',
            onUpdate: () => {
              el.textContent = o.v.toFixed(Number(el.dataset.dec));
            },
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });
        gsap.from('.stat-card', { y: 50, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 80%', once: true } });
        gsap.from('.spec-row', { opacity: 0, y: 24, stagger: 0.06, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: '.specs', start: 'top 75%', once: true } });
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [product._id] }
  );

  const refresh = () => ScrollTrigger.refresh();
  const fadeMask = {
    WebkitMaskImage: 'radial-gradient(ellipse 62% 60% at 50% 50%, #000 45%, transparent 100%)',
    maskImage: 'radial-gradient(ellipse 62% 60% at 50% 50%, #000 45%, transparent 100%)',
  };

  return (
    <div ref={root} className="text-white">
      {/* ───────── Hero ───────── */}
      <section className={`hero ${BLEED} bg-black min-h-screen flex flex-col items-center overflow-hidden px-4`} style={STICK_PAD}>
        <div className="hero-copy text-center max-w-4xl mx-auto relative z-10">
          <p className="text-xl sm:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400">
            {product.category}
          </p>
          <h1 className={`${TITLE} mt-2 text-5xl sm:text-7xl lg:text-[88px] leading-[1.02]`}>{product.title}</h1>
          <p className="mt-5 text-xl sm:text-2xl text-[#f5f5f7] font-medium">
            From {formatPrice(price)}
            {discount > 0 && <span className="ml-3 text-base text-[#ff6b6b]">Save {discount}%</span>}
          </p>
          <div className="mt-6 flex items-center justify-center gap-7">
            <a href="#buy" className={`${BLUE} px-6 py-2.5 rounded-full text-[17px] font-medium text-white transition-colors`}>Buy</a>
            <a href="#story" className="inline-flex items-center text-[17px] text-[#2997ff] hover:underline">
              Learn more <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="relative flex-1 w-full flex items-center justify-center mt-4 min-h-[40vh]">
          <img
            src={img(0)}
            alt={product.title}
            onLoad={refresh}
            style={fadeMask}
            className="hero-img w-[min(130vw,1300px)] max-w-none h-[min(58vh,640px)] object-cover"
          />
        </div>
      </section>

      {/* ───────── Statement ───────── */}
      <section id="story" className={`story ${BLEED} bg-black min-h-screen flex items-center px-6`} style={STICK_PAD}>
        <div className="max-w-[1024px] mx-auto w-full">
          <p className={`${TITLE} text-[32px] sm:text-5xl lg:text-[64px] leading-[1.08]`}>
            {words.map((w, i) => (
              <span key={i} className="story-word motion-safe:opacity-[0.16] inline-block mr-[0.26em]">{w}</span>
            ))}
          </p>
        </div>
      </section>

      {/* ───────── Full-bleed zoom with chapters ───────── */}
      <section className={`zoom ${BLEED} bg-black h-screen overflow-hidden`}>
        <div className="zoom-frame absolute inset-0 motion-safe:[clip-path:inset(16%_24%_16%_24%_round_44px)]">
          {images.map((src, i) => (
            <img key={src + i} src={src} alt="" onLoad={refresh} className="zoom-img absolute inset-0 w-full h-full object-cover" />
          ))}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/25 to-transparent" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="relative w-full max-w-[1024px] mx-auto px-6 pb-[14vh] h-[40vh]">
            {chapters.map((c) => (
              <div key={c.kicker} className="chapter motion-safe:opacity-0 absolute left-6 right-6 bottom-[14vh]">
                <p className="text-sm sm:text-base font-semibold text-[#2997ff] mb-2">{c.kicker}</p>
                <p className={`${TITLE} text-4xl sm:text-6xl lg:text-7xl leading-[1.04] max-w-3xl`}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Highlights (horizontal scroll) ───────── */}
      <section id="highlights" className={`highlights ${BLEED} bg-[#f5f5f7] text-[#1d1d1f] min-h-screen overflow-hidden flex flex-col justify-center py-20`} style={STICK_PAD}>
        <div className="max-w-[1024px] mx-auto w-full px-6">
          <h2 className={`${TITLE} text-4xl sm:text-6xl`}>Get the highlights.</h2>
        </div>
        <div className="mt-10 overflow-x-auto md:motion-safe:overflow-visible no-scrollbar snap-x snap-mandatory md:motion-safe:snap-none">
          <div className="hl-track flex gap-5 px-6 md:pl-[max(1.5rem,calc((100vw-1024px)/2+1.5rem))] w-max">
            {highlights.map((t, i) => (
              <article
                key={i}
                className="snap-center relative shrink-0 w-[min(82vw,440px)] h-[min(60vh,540px)] rounded-[2rem] overflow-hidden bg-black text-white shadow-[0_10px_40px_-15px_rgba(0,0,0,.35)]"
              >
                <img src={img(i + 1)} alt="" onLoad={refresh} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/60" aria-hidden="true" />
                <div className="relative p-8 h-full flex flex-col justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Highlight {String(i + 1).padStart(2, '0')}</p>
                  <p className={`${TITLE} text-2xl sm:text-[28px] leading-[1.15]`}>{t}</p>
                </div>
              </article>
            ))}
            <div className="shrink-0 w-6 md:w-20" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ───────── Stats ───────── */}
      <section className={`stats ${BLEED} bg-black px-6 py-32`}>
        <div className="max-w-[1024px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14 text-center">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <p className={`${TITLE} text-6xl sm:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-[#86868b]`}>
                <span data-count data-end={s.end} data-dec={s.dec}>{s.end.toFixed(s.dec)}</span>
                {s.suffix}
              </p>
              <p className="mt-3 text-[17px] text-[#86868b]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Specs ───────── */}
      <section id="specs" className={`specs ${BLEED} bg-white text-[#1d1d1f] px-6 py-28 scroll-mt-32`}>
        <div className="max-w-[1024px] mx-auto">
          <h2 className={`${TITLE} text-4xl sm:text-6xl`}>Tech specs.</h2>
          <dl className="mt-12 divide-y divide-[#d2d2d7] border-y border-[#d2d2d7]">
            {specs.map(([k, v]) => (
              <div key={k} className="spec-row grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-1 sm:gap-8 py-5">
                <dt className="text-sm font-semibold text-[#6e6e73]">{k}</dt>
                <dd className="text-[17px]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
};

export default ProductShowcase;
