import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Star } from 'lucide-react';
import useCurrency from '../../../hooks/useCurrency';
import useNavHeight from '../../../hooks/useNavHeight';
import { accentFor, POOLS, storyBeats } from './productTheme';
import ProductBuyPanel from './ProductBuyPanel';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// overflow-x-clip: transformed children (tilts, scales) must never widen the page, or phones zoom out
const BLEED = 'relative w-screen ml-[calc(50%-50vw)] overflow-x-clip';
const CREAM = '#fbf6f1';
const INK = '#3a2a2a';
const SERIF = 'font-serif italic font-medium tracking-tight';
const LABELS = ['First impression', 'The feel', 'The finish'];
const RING_PATH = 'M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0';

/**
 * Beauty / wellness experience: pastel gradient tinted by the product accent,
 * blurred drifting colour blobs, a circular photo inside a rotating text ring,
 * blur-to-sharp word reveals and cards that drift at different scroll speeds.
 */
const SoftProductPage = ({ product, onAdd }) => {
  const root = useRef(null);
  const { formatPrice } = useCurrency();
  useNavHeight();

  const accent = accentFor(product, POOLS.soft);
  const images = product.images?.map((i) => i.url) || [];
  const beats = storyBeats(product, 3).slice(0, 3);
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const rating = Number(product.rating) || 0;
  const ring = `${product.brand || product.title} · ${product.category} · `.repeat(4);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entrance: copy blurs into focus word by word, the orb blooms from a blur
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.so-kicker', { y: 16, opacity: 0, duration: 0.9 })
          .fromTo('.so-word', { y: 36, opacity: 0, filter: 'blur(16px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.3, stagger: 0.12 }, 0.1)
          .fromTo('.so-orb', { scale: 0.55, opacity: 0, filter: 'blur(26px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'expo.out' }, 0.2)
          .from('.so-ring', { opacity: 0, duration: 1.4 }, 0.8)
          .from('.so-cta > *', { y: 20, opacity: 0, duration: 0.9, stagger: 0.12 }, 0.9);

        // Ambient motion: ring spins, dots orbit, orb breathes, blobs drift
        gsap.to('.so-ring', { rotation: 360, duration: 48, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
        gsap.to('.so-orbit-a', { rotation: 360, duration: 18, ease: 'none', repeat: -1 });
        gsap.to('.so-orbit-b', { rotation: -360, duration: 28, ease: 'none', repeat: -1 });
        gsap.to('.so-orb-inner', { scale: 1.04, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.utils.toArray('.so-blob').forEach((b, i) => {
          gsap.to(b, { x: i % 2 ? -70 : 80, y: i === 1 ? 60 : -50, scale: 1.18, duration: 7 + i * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        });

        // Pointer parallax with different depths
        const ox = gsap.quickTo('.so-orb', 'x', { duration: 1.1, ease: 'power3.out' });
        const oy = gsap.quickTo('.so-orb', 'y', { duration: 1.1, ease: 'power3.out' });
        const bx = gsap.quickTo('.so-blobs', 'x', { duration: 1.6, ease: 'power3.out' });
        const onMove = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          ox(nx * -26);
          oy(ny * -18);
          bx(nx * 40);
        };
        window.addEventListener('pointermove', onMove);

        // Scroll: orb drifts up and the ring loosens
        gsap.to('.so-stage', { yPercent: -12, scale: 0.92, ease: 'none', scrollTrigger: { trigger: '.so-hero', start: 'top top', end: 'bottom top', scrub: 1 } });

        // Notes: cards drift at different speeds while fading out of blur
        gsap.utils.toArray('.so-note').forEach((el, i) => {
          gsap.fromTo(el, { yPercent: i === 1 ? 16 : -8 }, { yPercent: i === 1 ? -16 : 8, ease: 'none', scrollTrigger: { trigger: '.so-notes', start: 'top bottom', end: 'bottom top', scrub: 1 } });
          gsap.from(el.querySelector('.so-note-body'), { opacity: 0, y: 30, filter: 'blur(10px)', duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        });

        // Rating: number counts up, stars pop in one by one
        const o = { v: 0 };
        gsap.to(o, {
          v: rating,
          duration: 1.8,
          ease: 'power3.out',
          onUpdate: () => {
            const el = root.current?.querySelector('[data-rating]');
            if (el) el.textContent = o.v.toFixed(1);
          },
          scrollTrigger: { trigger: '.so-rating', start: 'top 80%', once: true },
        });
        gsap.from('.so-star', { scale: 0, rotate: -40, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(2.2)', scrollTrigger: { trigger: '.so-rating', start: 'top 80%', once: true } });

        return () => window.removeEventListener('pointermove', onMove);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [product._id] }
  );

  return (
    <div ref={root} style={{ color: INK }}>
      {/* ───────── Hero ───────── */}
      <section
        className={`so-hero ${BLEED} -mt-8 sm:-mt-12 overflow-hidden px-5 flex flex-col items-center text-center`}
        style={{ minHeight: 'calc(100svh - var(--nav-h, 80px))', background: `linear-gradient(180deg, ${CREAM} 0%, ${accent}33 100%)` }}
      >
        <div className="so-blobs absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="so-blob absolute -left-24 top-10 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-60" style={{ backgroundColor: accent }} />
          <div className="so-blob absolute right-[-6rem] top-1/3 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-40" style={{ backgroundColor: '#ffd9c7' }} />
          <div className="so-blob absolute left-1/3 bottom-[-8rem] w-[24rem] h-[24rem] rounded-full blur-3xl opacity-50" style={{ backgroundColor: `${accent}` }} />
        </div>

        <div className="so-stage relative z-10 mt-10 sm:mt-14 flex flex-col items-center">
          <p className="so-kicker text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: accent }}>
            {product.category}
          </p>
          <h1 className={`${SERIF} mt-4 text-5xl sm:text-7xl lg:text-8xl leading-[1.02] max-w-5xl`}>
            {product.title.split(' ').map((w, i) => (
              <span key={i} className="so-word inline-block mr-[0.22em]">{w}</span>
            ))}
          </h1>

          <div className="relative mt-12 w-[min(70vw,380px)] aspect-square">
            <svg className="so-ring absolute -inset-[18%] w-[136%] h-[136%] overflow-visible" viewBox="0 0 200 200" aria-hidden="true">
              <defs><path id="so-ring-path" d={RING_PATH} /></defs>
              <text fontSize="8.5" letterSpacing="3" fill={INK} fillOpacity="0.55" fontFamily="Inter, sans-serif" fontWeight="600">
                <textPath href="#so-ring-path" textLength="548" lengthAdjust="spacing">{ring.toUpperCase()}</textPath>
              </text>
            </svg>
            <div className="so-orbit-a absolute -inset-[8%]" aria-hidden="true"><span className="absolute left-1/2 top-0 w-3 h-3 rounded-full" style={{ backgroundColor: accent }} /></div>
            <div className="so-orbit-b absolute -inset-[14%]" aria-hidden="true"><span className="absolute left-0 top-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: INK }} /></div>
            <div className="so-orb absolute inset-0 rounded-full overflow-hidden ring-8 ring-white/60 shadow-[0_40px_90px_-30px_rgba(0,0,0,.45)]">
              <img src={images[0]} alt={product.title} className="so-orb-inner w-full h-full object-cover" />
            </div>
          </div>

          <div className="so-cta mt-14 flex flex-col sm:flex-row items-center gap-5">
            <p className={`${SERIF} text-4xl`}>
              {formatPrice(price)}
              {product.discountPrice > 0 && <span className="ml-3 text-base not-italic line-through opacity-50">{formatPrice(product.price)}</span>}
            </p>
            <a href="#buy" className="px-9 py-3.5 rounded-full text-sm font-semibold tracking-wide text-white hover:brightness-110 active:scale-95 transition" style={{ backgroundColor: INK }}>
              Add to my ritual
            </a>
          </div>
        </div>
      </section>

      {/* ───────── Notes ───────── */}
      <section className={`so-notes ${BLEED} px-5 py-32 overflow-hidden`} style={{ background: `linear-gradient(180deg, ${accent}33 0%, ${CREAM} 100%)` }}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`${SERIF} text-4xl sm:text-6xl text-center`}>What to expect</h2>
          <div className="mt-20 grid md:grid-cols-3 gap-8 items-start">
            {beats.map((b, i) => (
              <div key={i} className="so-note">
                <div className="so-note-body p-8 rounded-[2rem] bg-white/70 backdrop-blur-md ring-1 ring-white shadow-[0_30px_60px_-30px_rgba(58,42,42,.35)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>{LABELS[i]}</p>
                  <p className={`${SERIF} mt-4 text-2xl leading-snug`}>{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Rating ───────── */}
      <section className={`so-rating ${BLEED} px-5 py-28 text-center`} style={{ backgroundColor: CREAM }}>
        <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: accent }}>Loved by</p>
        <p className={`${SERIF} mt-4 text-8xl sm:text-[10rem] leading-none`}>
          <span data-rating>{rating.toFixed(1)}</span>
        </p>
        <div className="mt-6 flex justify-center gap-2" aria-label={`${rating.toFixed(1)} out of 5`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="so-star w-8 h-8" style={{ color: accent, fill: i < Math.round(rating) ? accent : 'transparent' }} />
          ))}
        </div>
        <p className="mt-4 text-sm opacity-70">{product.numReviews || 0} verified reviews</p>
      </section>

      <ProductBuyPanel product={product} onAdd={onAdd} accent={INK} bg={`${accent}2b`} fg={INK} muted="rgba(58,42,42,.65)" headingClass="font-serif italic font-medium" />
    </div>
  );
};

export default SoftProductPage;
