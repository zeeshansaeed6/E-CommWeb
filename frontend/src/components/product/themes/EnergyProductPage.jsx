import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronDown } from 'lucide-react';
import useCurrency from '../../../hooks/useCurrency';
import useNavHeight from '../../../hooks/useNavHeight';
import { accentFor, POOLS, storyBeats } from './productTheme';
import ProductBuyPanel from './ProductBuyPanel';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BLEED = 'relative w-screen ml-[calc(50%-50vw)]';
const INK = '#0a0a0b';
const HEAD = 'font-display font-black italic uppercase tracking-[-0.03em]';
const PARALLELOGRAM = 'polygon(9% 0, 100% 0, 91% 100%, 0 100%)';

/**
 * Sports / high-energy experience: neon accent, slanted geometry, a photo that
 * slams in on a spring, a marquee that skews with scroll speed, count-up stats
 * and cards that fly in from alternating sides.
 */
const EnergyProductPage = ({ product, onAdd }) => {
  const root = useRef(null);
  const { formatPrice } = useCurrency();
  useNavHeight();

  const accent = accentFor(product, POOLS.energy);
  const images = product.images?.map((i) => i.url) || [];
  const beats = storyBeats(product, 4);
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const words = product.title.split(' ');
  const run = `${product.brand || product.category} • NO LIMITS • `.repeat(8);

  const stats = [
    { end: Number(product.rating) || 0, dec: 1, label: 'Rating', suffix: '/5' },
    { end: Number(product.numReviews) || 0, dec: 0, label: 'Athletes reviewed', suffix: '' },
    { end: Number(product.stock) || 0, dec: 0, label: 'Ready to ship', suffix: '' },
    discount > 0 ? { end: discount, dec: 0, label: 'Off today', suffix: '%' } : { end: 30, dec: 0, label: 'Day returns', suffix: '' },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entrance: slab wipes in, words slam from the left, photo springs in rotated
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .fromTo('.en-slab', { xPercent: 60, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.1 })
          .from('.en-word', { xPercent: -130, skewX: 18, opacity: 0, duration: 0.9, stagger: 0.09 }, 0.15)
          .fromTo('.en-photo', { xPercent: 70, rotate: 22, opacity: 0 }, { xPercent: 0, rotate: -5, opacity: 1, duration: 1.2, ease: 'back.out(1.3)' }, 0.25)
          .from('.en-cta > *', { y: 30, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.6);

        // Speed lines drifting across the slab
        gsap.to('.en-lines', { xPercent: -8, duration: 1.4, ease: 'none', repeat: -1 });

        // Pointer-driven depth: photo drifts, slab counter-drifts
        const px = gsap.quickTo('.en-photo-wrap', 'x', { duration: 0.7, ease: 'power3.out' });
        const py = gsap.quickTo('.en-photo-wrap', 'y', { duration: 0.7, ease: 'power3.out' });
        const sx = gsap.quickTo('.en-slab', 'x', { duration: 1, ease: 'power3.out' });
        const onMove = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          px(nx * 40);
          py(ny * 26);
          sx(nx * -24);
        };
        window.addEventListener('pointermove', onMove);

        // Scroll: photo straightens and the title slides away
        gsap.to('.en-photo', { rotate: 3, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.en-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
        gsap.to('.en-title', { xPercent: -12, ease: 'none', scrollTrigger: { trigger: '.en-hero', start: 'top top', end: 'bottom top', scrub: 1 } });

        // Marquee: runs constantly, skews and speeds up with scroll velocity
        const loop = gsap.to('.en-track', { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
        const skew = gsap.quickTo('.en-band', 'skewX', { duration: 0.5, ease: 'power3.out' });
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            const v = self.getVelocity();
            skew(gsap.utils.clamp(-14, 14, v / -120));
            gsap.to(loop, { timeScale: 1 + Math.min(Math.abs(v) / 300, 7), duration: 0.2, overwrite: true });
            gsap.to(loop, { timeScale: 1, delay: 0.3, duration: 0.9, overwrite: false });
          },
        });

        // Stats: count up + accent bars charge
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
        gsap.fromTo('.en-bar', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 1.2, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.en-stats', start: 'top 80%', once: true } });

        // Cards fly in from alternating sides with a hard skew that settles
        gsap.utils.toArray('.en-card').forEach((card, i) => {
          gsap.from(card, {
            xPercent: i % 2 ? 40 : -40,
            skewX: i % 2 ? -10 : 10,
            opacity: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 85%', once: true },
          });
        });

        return () => window.removeEventListener('pointermove', onMove);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [product._id] }
  );

  return (
    <div ref={root} className="text-white">
      {/* ───────── Hero ───────── */}
      <section
        className={`en-hero ${BLEED} -mt-8 sm:-mt-12 overflow-hidden px-5 flex items-center`}
        style={{ backgroundColor: INK, minHeight: 'calc(100svh - var(--nav-h, 80px))' }}
      >
        <div className="en-slab absolute inset-y-0 right-0 w-[62%] overflow-hidden" style={{ backgroundColor: accent, clipPath: 'polygon(24% 0, 100% 0, 100% 100%, 0 100%)' }} aria-hidden="true">
          <div className="en-lines absolute inset-y-0 -left-[10%] w-[130%] opacity-25" style={{ background: 'repeating-linear-gradient(105deg, transparent 0 26px, #000 26px 29px)' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 items-center gap-8 py-12">
          <div>
            <p className="inline-block px-3 py-1 text-[11px] font-black uppercase tracking-[0.3em] text-black -skew-x-12" style={{ backgroundColor: accent }}>
              {product.category}
            </p>
            <h1 className={`en-title ${HEAD} mt-5 text-[clamp(2.5rem,6.6vw,6.25rem)] leading-[0.9] -skew-x-6`}>
              {words.map((w, i) => (
                <span key={i} className="en-word inline-block mr-[0.2em]" style={i % 3 === 1 ? { color: accent } : undefined}>
                  {w}
                </span>
              ))}
            </h1>
            <div className="en-cta mt-9 flex flex-wrap items-center gap-6">
              <p className="font-display font-black italic text-4xl">
                {formatPrice(price)}
                {discount > 0 && <span className="ml-3 text-base not-italic line-through text-white/50">{formatPrice(product.price)}</span>}
              </p>
              <a href="#buy" className="px-9 py-4 text-sm font-black uppercase tracking-widest text-black -skew-x-12 hover:brightness-110 active:scale-95 transition" style={{ backgroundColor: accent }}>
                <span className="inline-block skew-x-12">Get it now</span>
              </a>
            </div>
          </div>

          <div className="en-photo-wrap relative mx-auto w-[min(86vw,560px)]">
            <div className="en-photo relative aspect-[4/5] shadow-[0_40px_80px_-20px_rgba(0,0,0,.8)]" style={{ clipPath: PARALLELOGRAM }}>
              <img src={images[0]} alt={product.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        <ChevronDown className="absolute bottom-6 left-1/2 -translate-x-1/2 w-7 h-7 text-white/60 animate-bounce" aria-hidden="true" />
      </section>

      {/* ───────── Marquee ───────── */}
      <div className={`${BLEED} overflow-hidden py-4 text-black`} style={{ backgroundColor: accent }} aria-hidden="true">
        <div className="en-band origin-center">
          <div className="en-track flex w-max whitespace-nowrap will-change-transform">
            <span className={`${HEAD} text-3xl sm:text-5xl pr-6`}>{run}</span>
            <span className={`${HEAD} text-3xl sm:text-5xl pr-6`}>{run}</span>
          </div>
        </div>
      </div>

      {/* ───────── Stats ───────── */}
      <section className={`en-stats ${BLEED} px-5 py-24`} style={{ backgroundColor: INK }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {stats.map((s) => (
            <div key={s.label}>
              <p className={`${HEAD} text-6xl sm:text-8xl leading-none`} style={{ color: accent }}>
                <span data-count data-end={s.end} data-dec={s.dec}>{s.end.toFixed(s.dec)}</span>
                <span className="text-3xl sm:text-5xl text-white">{s.suffix}</span>
              </p>
              <div className="en-bar mt-4 h-1.5 w-full -skew-x-12" style={{ backgroundColor: accent }} />
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Cards ───────── */}
      <section className={`${BLEED} px-5 pb-28 overflow-hidden`} style={{ backgroundColor: INK }}>
        <div className="max-w-5xl mx-auto space-y-6">
          {beats.map((b, i) => (
            <article
              key={i}
              className="en-card relative flex items-center gap-6 sm:gap-10 p-6 sm:p-10 bg-white/[0.05] ring-1 ring-white/10"
              style={{ clipPath: i % 2 ? 'polygon(0 0, 96% 0, 100% 100%, 4% 100%)' : 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)', marginLeft: i % 2 ? 'auto' : 0, maxWidth: '92%' }}
            >
              <span className={`${HEAD} text-6xl sm:text-8xl leading-none flex-shrink-0`} style={{ color: 'transparent', WebkitTextStroke: `2px ${accent}` }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-xl sm:text-3xl font-display font-extrabold leading-tight">{b}</p>
            </article>
          ))}
        </div>
      </section>

      <ProductBuyPanel product={product} onAdd={onAdd} accent={accent} bg={INK} fg="#ffffff" muted="rgba(255,255,255,.6)" btnText="#000" headingClass="font-display font-black italic uppercase tracking-tight" square />
    </div>
  );
};

export default EnergyProductPage;
