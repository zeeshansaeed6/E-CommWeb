import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import useCurrency from '../../../hooks/useCurrency';
import useNavHeight from '../../../hooks/useNavHeight';
import { accentFor, POOLS, storyBeats } from './productTheme';
import ProductBuyPanel from './ProductBuyPanel';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BLEED = 'relative w-screen ml-[calc(50%-50vw)]';
const PAPER = '#f2ebdf';
const DEEP = '#e8dfcf';
const INK = '#3b2f25';
const SERIF = 'font-serif font-semibold tracking-tight';
const KICKERS = ['The idea', 'The details', 'The ritual', 'The promise', 'The care', 'The extras'];

/**
 * Home / stationery experience: warm paper palette, a photo that is "set down" on a
 * table with an elastic landing and shadow, then a sticky image beside a story whose
 * progress line and dots fill as you read.
 */
const CozyProductPage = ({ product, onAdd }) => {
  const root = useRef(null);
  const { formatPrice } = useCurrency();
  useNavHeight();

  const accent = accentFor(product, POOLS.cozy);
  const images = product.images?.map((i) => i.url) || [];
  const beats = storyBeats(product, 3);
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const intro = (product.description || '').split(/(?<=[.!?])\s+/)[0];
  const facts = [
    ['Brand', product.brand],
    ['Category', product.category],
    ['In stock', product.stock > 0 ? `${product.stock} ready` : 'Sold out'],
    ['Rating', `${Number(product.rating || 0).toFixed(1)} / 5`],
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // The object is set down on the table: drop, elastic settle, shadow lands with it
        gsap
          .timeline()
          .from('.cz-copy > *', { y: 34, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out' })
          .fromTo('.cz-frame', { y: -280, rotate: 7, opacity: 0 }, { y: 0, rotate: -2, opacity: 1, duration: 1.9, ease: 'elastic.out(1, 0.55)' }, 0.2)
          .fromTo('.cz-shadow', { scaleX: 0.2, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1.1, ease: 'power3.out' }, 0.55)
          .from('.cz-fact', { y: 20, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 1.1);

        // Hover: the object lifts and its shadow shrinks
        const wrap = root.current.querySelector('.cz-stage');
        const lift = gsap.quickTo('.cz-frame', 'y', { duration: 0.5, ease: 'power3.out' });
        const shrink = gsap.quickTo('.cz-shadow', 'scaleX', { duration: 0.5, ease: 'power3.out' });
        const up = () => { lift(-12); shrink(0.88); };
        const down = () => { lift(0); shrink(1); };
        wrap.addEventListener('pointerenter', up);
        wrap.addEventListener('pointerleave', down);

        gsap.to('.cz-stage', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.cz-hero', start: 'top top', end: 'bottom top', scrub: 1 } });

        // Story: sticky frame tilts gently while the progress line fills
        gsap.fromTo('.cz-sticky-frame', { rotate: -3, scale: 0.98 }, { rotate: 3, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.cz-steps', start: 'top 70%', end: 'bottom 40%', scrub: 1 } });
        gsap.fromTo('.cz-line-fill', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top center', ease: 'none', scrollTrigger: { trigger: '.cz-steps', start: 'top 60%', end: 'bottom 55%', scrub: 1 } });

        const slides = gsap.utils.toArray('.cz-slide');
        const show = (idx) => slides.forEach((s, j) => gsap.to(s, { opacity: j === idx ? 1 : 0, scale: j === idx ? 1 : 1.08, duration: 0.9, ease: 'power2.out', overwrite: 'auto' }));
        gsap.utils.toArray('.cz-step').forEach((step, i) => {
          const dot = step.querySelector('.cz-dot');
          const body = step.querySelector('.cz-step-body');
          gsap.from(body, { x: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 78%', once: true } });
          ScrollTrigger.create({
            trigger: step,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => {
              gsap.to(dot, { backgroundColor: self.isActive ? accent : PAPER, scale: self.isActive ? 1.35 : 1, duration: 0.4, ease: 'back.out(2)' });
              if (self.isActive) show(i);
            },
          });
        });
        show(0);

        return () => {
          wrap.removeEventListener('pointerenter', up);
          wrap.removeEventListener('pointerleave', down);
        };
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [product._id] }
  );

  return (
    <div ref={root} style={{ color: INK }}>
      {/* ───────── Hero ───────── */}
      <section
        className={`cz-hero ${BLEED} -mt-8 sm:-mt-12 overflow-hidden px-5 grid lg:grid-cols-2 gap-10 items-center`}
        style={{ backgroundColor: PAPER, minHeight: 'calc(100svh - var(--nav-h, 80px))' }}
      >
        <div className="cz-copy relative z-10 py-12 lg:pl-[max(0px,calc((100vw-1200px)/2))]">
          <p className="text-xs font-bold uppercase tracking-[0.35em]" style={{ color: accent }}>{product.category}</p>
          <h1 className={`${SERIF} mt-4 text-5xl sm:text-6xl lg:text-7xl leading-[1.02]`}>{product.title}</h1>
          {intro && <p className="mt-6 text-lg leading-relaxed max-w-xl opacity-80">{intro}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <p className={`${SERIF} text-4xl`}>
              {formatPrice(price)}
              {product.discountPrice > 0 && <span className="ml-3 text-base font-normal line-through opacity-50">{formatPrice(product.price)}</span>}
            </p>
            <a href="#buy" className="px-8 py-3.5 rounded-2xl text-sm font-bold text-white hover:brightness-110 active:scale-95 transition" style={{ backgroundColor: accent }}>
              Bring it home
            </a>
          </div>
          <dl className="mt-10 flex flex-wrap gap-3">
            {facts.map(([k, v]) => (
              <div key={k} className="cz-fact px-4 py-2 rounded-full text-sm" style={{ backgroundColor: DEEP }}>
                <dt className="inline opacity-60">{k} </dt>
                <dd className="inline font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="cz-stage relative mx-auto w-[min(86vw,480px)] pb-16">
          <div className="cz-frame relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border-[10px] shadow-[0_20px_40px_-18px_rgba(59,47,37,.5)]" style={{ borderColor: '#fffaf1' }}>
            <img src={images[0]} alt={product.title} className="w-full h-full object-cover" />
          </div>
          <div className="cz-shadow absolute left-[8%] right-[8%] bottom-6 h-6 rounded-[50%] blur-md" style={{ backgroundColor: 'rgba(59,47,37,.45)' }} aria-hidden="true" />
        </div>
      </section>

      {/* ───────── Story ───────── */}
      <section className={`${BLEED} px-5 py-24`} style={{ backgroundColor: DEEP }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
          <div className="lg:sticky self-start" style={{ top: 'calc(var(--nav-h, 80px) + 1.5rem)' }}>
            <div className="cz-sticky-frame relative aspect-square max-h-[74vh] mx-auto rounded-[2.5rem] overflow-hidden border-[10px] shadow-[0_30px_60px_-28px_rgba(59,47,37,.55)]" style={{ borderColor: '#fffaf1' }}>
              {beats.map((_, i) => (
                <img
                  key={i}
                  src={images[i % images.length]}
                  alt=""
                  className="cz-slide absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: i === 0 ? 1 : 0, objectPosition: images.length > 1 ? 'center' : ['50% 50%', '25% 40%', '75% 60%', '50% 20%', '30% 80%', '70% 30%'][i % 6], transform: images.length > 1 ? undefined : `scale(${1 + (i % 3) * 0.15})` }}
                />
              ))}
            </div>
          </div>

          <div className="cz-steps relative pl-10 sm:pl-14">
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 rounded" style={{ backgroundColor: `${INK}22` }} aria-hidden="true" />
            <div className="cz-line-fill absolute left-[11px] top-0 bottom-0 w-0.5 rounded" style={{ backgroundColor: accent }} aria-hidden="true" />
            {beats.map((b, i) => (
              <div key={i} className="cz-step relative min-h-[62svh] flex items-center">
                <span className="cz-dot absolute -left-10 sm:-left-14 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2" style={{ backgroundColor: PAPER, borderColor: accent }} aria-hidden="true" />
                <div className="cz-step-body">
                  <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>{String(i + 1).padStart(2, '0')} · {KICKERS[i]}</p>
                  <p className={`${SERIF} mt-3 text-3xl sm:text-4xl leading-tight`}>{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductBuyPanel product={product} onAdd={onAdd} accent={accent} bg={PAPER} fg={INK} muted="rgba(59,47,37,.65)" headingClass="font-serif font-semibold tracking-tight" />
    </div>
  );
};

export default CozyProductPage;
