import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { ArrowDown } from 'lucide-react';
import useCurrency from '../../../hooks/useCurrency';
import useNavHeight from '../../../hooks/useNavHeight';
import { accentFor, POOLS, storyBeats } from './productTheme';
import ProductBuyPanel from './ProductBuyPanel';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// overflow-x-clip: transformed children (tilts, scales) must never widen the page, or phones zoom out
const BLEED = 'relative w-screen ml-[calc(50%-50vw)] overflow-x-clip';
const PAPER = '#f3efe8';
const INK = '#111111';
const HEAD = 'font-display font-black uppercase tracking-[-0.04em]';

/**
 * Fashion / editorial experience: oversized masked type, a tilting hero image with an
 * accent block behind it, a marquee that speeds up with scroll velocity, and a sticky
 * gallery whose image wipes to the next as the story scrolls.
 */
const EditorialProductPage = ({ product, onAdd }) => {
  const root = useRef(null);
  const { formatPrice } = useCurrency();
  useNavHeight();

  const accent = accentFor(product, POOLS.editorial);
  const images = product.images?.map((i) => i.url) || [];
  const beats = storyBeats(product, 3);
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const marquee = `${product.brand || product.title} — ${product.category} — `.repeat(6);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        let split;
        let alive = true; // Strict Mode re-runs this effect; ignore the stale first run

        document.fonts.ready.then(() => {
          if (!alive) return;
          split = new SplitText('.ed-title', { type: 'lines, chars', linesClass: 'split-line' });
          gsap
            .timeline({ defaults: { ease: 'power4.out' } })
            .from('.ed-kicker', { y: 24, opacity: 0, duration: 0.7 })
            .from(split.chars, { yPercent: 110, duration: 1, stagger: 0.02 }, '-=0.4')
            .from('.ed-sub', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
            .fromTo('.ed-block', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 1, ease: 'expo.out' }, 0.2)
            .fromTo('.ed-photo', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out' }, 0.3);
          ScrollTrigger.refresh();
        });

        // Mouse-driven 3D tilt with eased follow
        const frame = root.current.querySelector('.ed-tilt');
        const rx = gsap.quickTo(frame, 'rotationX', { duration: 0.6, ease: 'power3.out' });
        const ry = gsap.quickTo(frame, 'rotationY', { duration: 0.6, ease: 'power3.out' });
        const onMove = (e) => {
          rx(-(e.clientY / window.innerHeight - 0.5) * 10);
          ry((e.clientX / window.innerWidth - 0.5) * 12);
        };
        window.addEventListener('pointermove', onMove);

        // Hero parallax on scroll
        gsap.to('.ed-photo img', { yPercent: 10, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.ed-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
        gsap.to('.ed-ghost', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.ed-hero', start: 'top top', end: 'bottom top', scrub: 1 } });

        // Marquee that accelerates with scroll velocity and flips with direction
        const loop = gsap.to('.ed-track', { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            const v = self.getVelocity();
            gsap.to(loop, { timeScale: (self.direction === 1 ? 1 : -1) * (1 + Math.min(Math.abs(v) / 350, 6)), duration: 0.2, overwrite: true });
            gsap.to(loop, { timeScale: self.direction, delay: 0.25, duration: 0.8, overwrite: false });
          },
        });

        // Sticky gallery: each step wipes in the next image
        const slides = gsap.utils.toArray('.ed-slide');
        const wipe = gsap.timeline({
          scrollTrigger: { trigger: '.ed-steps', start: 'top 55%', end: 'bottom 70%', scrub: 1 },
        });
        slides.slice(1).forEach((s, i) => {
          wipe.fromTo(s, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'none', duration: 1 }, i);
          wipe.fromTo(s.querySelector('img'), { scale: 1.25 }, { scale: 1, ease: 'none', duration: 1 }, i);
        });
        gsap.utils.toArray('.ed-step').forEach((el) => {
          gsap.from(el.querySelectorAll('.ed-step-item'), { y: 50, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 75%', once: true } });
        });

        return () => {
          alive = false;
          window.removeEventListener('pointermove', onMove);
          split?.revert();
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
        className={`ed-hero ${BLEED} -mt-8 sm:-mt-12 overflow-hidden px-5 grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center`}
        style={{ backgroundColor: PAPER, minHeight: 'calc(100svh - var(--nav-h, 80px))', paddingTop: 'calc(var(--nav-h, 80px) * 0 + 2rem)' }}
      >
        <p aria-hidden="true" className={`ed-ghost ${HEAD} pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 text-[clamp(8rem,26vw,24rem)] leading-none whitespace-nowrap select-none`} style={{ color: 'transparent', WebkitTextStroke: `2px ${accent}`, opacity: 0.35 }}>
          {product.brand || product.category}
        </p>

        <div className="relative z-10 py-10 lg:pl-[max(0px,calc((100vw-1280px)/2))]">
          <p className="ed-kicker text-xs font-bold uppercase tracking-[0.35em]" style={{ color: accent }}>
            {product.category} · {product.brand}
          </p>
          <h1 className={`ed-title ${HEAD} mt-5 text-[clamp(2.25rem,5.4vw,5.5rem)] leading-[0.95] break-normal [hyphens:none]`}>{product.title}</h1>
          <div className="ed-sub mt-8 flex flex-wrap items-center gap-6">
            <p className="text-3xl font-display font-extrabold">
              {formatPrice(price)}
              {product.discountPrice > 0 && <span className="ml-3 text-base line-through opacity-50">{formatPrice(product.price)}</span>}
            </p>
            <a href="#buy" className="px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:brightness-110 active:scale-95 transition" style={{ backgroundColor: INK }}>
              Shop now
            </a>
            <Link to={`/?category=${encodeURIComponent(product.category)}`} className="text-xs font-bold uppercase tracking-widest underline underline-offset-4">
              More {product.category}
            </Link>
          </div>
          <ArrowDown className="mt-12 w-6 h-6 animate-bounce opacity-60" aria-hidden="true" />
        </div>

        <div className="relative z-10 mx-auto w-[min(86vw,460px)] [perspective:1200px] pb-10">
          <div className="ed-tilt relative [transform-style:preserve-3d]">
            <div className="ed-block absolute -right-5 -bottom-5 w-[85%] h-[85%]" style={{ backgroundColor: accent }} aria-hidden="true" />
            <div className="ed-photo relative aspect-[3/4] overflow-hidden shadow-[0_30px_70px_-25px_rgba(0,0,0,.45)]">
              <img src={images[0]} alt={product.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Marquee ───────── */}
      <div className={`${BLEED} py-4`} aria-hidden="true">
       <div className="overflow-hidden py-5 -rotate-1 scale-[1.03]" style={{ backgroundColor: accent }}>
        <div className="ed-track flex w-max whitespace-nowrap will-change-transform">
          <span className={`${HEAD} italic text-4xl sm:text-6xl text-white pr-8`}>{marquee}</span>
          <span className={`${HEAD} italic text-4xl sm:text-6xl text-white pr-8`}>{marquee}</span>
        </div>
       </div>
      </div>

      {/* ───────── Sticky gallery + story ───────── */}
      <section className={`${BLEED} px-5 py-24`} style={{ backgroundColor: PAPER }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10">
          <div className="sticky z-10 self-start pb-3 max-lg:bg-[#f3efe8] lg:pb-0" style={{ top: 'calc(var(--nav-h, 80px) + 0.5rem)' }}>
            <div className="relative aspect-[16/10] max-lg:max-h-[30vh] lg:aspect-[4/5] lg:max-h-[78vh] mx-auto overflow-hidden shadow-[0_30px_70px_-25px_rgba(0,0,0,.4)]">
              {beats.map((_, i) => (
                <div key={i} className="ed-slide absolute inset-0 overflow-hidden">
                  <img
                    src={images[i % images.length]}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ objectPosition: images.length > 1 ? 'center' : ['50% 50%', '20% 40%', '80% 60%', '50% 20%', '30% 80%', '70% 30%'][i % 6], transform: images.length > 1 ? undefined : `scale(${1 + (i % 3) * 0.18})` }}
                  />
                </div>
              ))}
              <span className="absolute left-4 top-4 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ backgroundColor: accent }}>
                Look book
              </span>
            </div>
          </div>

          <div className="ed-steps">
            {beats.map((b, i) => (
              <div key={i} className="ed-step min-h-[40svh] py-8 lg:min-h-[70svh] lg:py-0 flex flex-col justify-center">
                <p className="ed-step-item font-display font-black text-[5rem] lg:text-[9rem] leading-none" style={{ color: 'transparent', WebkitTextStroke: `2px ${accent}` }}>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className={`ed-step-item ${HEAD} mt-2 text-3xl sm:text-5xl leading-[1.05] normal-case`} style={{ textTransform: 'none', letterSpacing: '-0.03em' }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductBuyPanel product={product} onAdd={onAdd} accent={accent} bg="#111111" fg="#f3efe8" muted="rgba(243,239,232,.6)" headingClass="font-display font-black uppercase tracking-tight" square />
    </div>
  );
};

export default EditorialProductPage;
