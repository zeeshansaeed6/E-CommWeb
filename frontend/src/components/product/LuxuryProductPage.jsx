import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check, Heart, ShieldCheck, Truck, BadgeCheck, Minus, Plus, ChevronDown } from 'lucide-react';
import useCurrency from '../../hooks/useCurrency';
import { toast } from '../../lib/toast';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BLEED = 'relative w-screen ml-[calc(50%-50vw)]';
const SERIF = 'font-serif font-medium tracking-tight';
const GREEN = '#0b3d2c';
const GOLD = '#c9b27c';
const CREAM = '#f6f4ef';
const NAV_PAD = { paddingTop: 'calc(var(--nav-h, 80px) + 1rem)' };

/**
 * Immersive editorial page for luxury products (product.theme === 'luxury'):
 * dark arch hero -> pinned full-bleed zoom with key figures -> scroll-lit statement
 * -> spec accordions -> purchase panel, plus a sticky buy bar.
 */
const LuxuryProductPage = ({ product, onAdd }) => {
  const root = useRef(null);
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const wished = useSelector((s) => s.wishlist.items.some((x) => x._id === product._id));

  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(0);
  const [added, setAdded] = useState(false);

  const images = product.images?.map((i) => i.url) || [];
  const heroImg = images[0];
  const detailImg = images[1] || images[0];
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const store = product.vendor?.vendorDetails?.storeName || product.vendor?.name || 'Verified vendor';
  const words = product.description.split(/\s+/);

  const groups = useMemo(() => {
    const map = new Map();
    (product.specs || []).forEach((s) => map.set(s.group, [...(map.get(s.group) || []), s]));
    return [...map.entries()];
  }, [product.specs]);

  // Key figures for the zoom chapters, pulled from the spec sheet when present
  const figures = useMemo(() => {
    const find = (k) => product.specs?.find((s) => s.label.toLowerCase().includes(k))?.value?.split(' / ')[0];
    const picked = [
      [find('diameter'), 'Case diameter'],
      [find('water'), 'Water resistance'],
      [find('power'), 'Power reserve'],
    ].filter(([v]) => v);
    return picked.length
      ? picked.map(([big, label]) => ({ big: big.replace(/^Approx\.\s*/i, ''), label }))
      : [
          { big: product.brand, label: 'Maison' },
          { big: product.category, label: 'Collection' },
          { big: `${product.stock}`, label: 'Pieces available' },
        ];
  }, [product]);

  // Publish the sticky navbar height so full-bleed sections can clear it
  useLayoutEffect(() => {
    const header = document.querySelector('header');
    if (!header) return undefined;
    const set = () => document.documentElement.style.setProperty('--nav-h', `${header.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  const handleAdd = () => {
    onAdd(qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.lx-eyebrow', { y: 20, opacity: 0, duration: 0.8 })
          .from('.lx-title', { y: 60, opacity: 0, duration: 1.1 }, '-=0.5')
          .from('.lx-arch', { y: 80, opacity: 0, scale: 0.94, duration: 1.2 }, '-=0.8')
          .from('.lx-hero-cta', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6');

        gsap.to('.lx-arch img', {
          scale: 1.18,
          yPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: '.lx-hero', start: 'top top', end: 'bottom top', scrub: 1 },
        });

        // Pinned zoom: image opens to full-bleed, figures play over it
        const nums = gsap.utils.toArray('.lx-fig');
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '.lx-zoom', start: 'top top', end: `+=${(nums.length + 1) * 90}%`, pin: true, scrub: 1, anticipatePin: 1 },
        });
        tl.fromTo('.lx-zoom-frame', { clipPath: 'inset(14% 26% 14% 26% round 999px 999px 40px 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 });
        nums.forEach((el) => {
          tl.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: 'none', duration: 0.5 });
          tl.to(el, { opacity: 0, y: -50, ease: 'none', duration: 0.5 }, '>0.4');
        });

        gsap.fromTo(
          '.lx-word',
          { opacity: 0.16 },
          { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '.lx-statement', start: 'top 70%', end: 'bottom 50%', scrub: 1 } }
        );
        gsap.fromTo('.lx-parallax', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.lx-statement', start: 'top bottom', end: 'bottom top', scrub: 1 } });

        // Sticky buy bar after the hero
        gsap.set('.lx-bar', { yPercent: 160, autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: '.lx-statement',
          start: 'top 85%',
          endTrigger: '#lx-buy',
          end: 'top 75%',
          onToggle: (self) =>
            gsap.to('.lx-bar', { yPercent: self.isActive ? 0 : 160, autoAlpha: self.isActive ? 1 : 0, duration: 0.45, ease: 'power3.out' }),
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [product._id] }
  );

  const perks = [
    [ShieldCheck, 'Certificate of authenticity', 'Every piece is inspected and documented.'],
    [Truck, 'Insured worldwide delivery', 'Signed for and tracked door to door.'],
    [BadgeCheck, 'Five-year guarantee', 'Backed by the seller and escrow-protected.'],
  ];

  const addLabel = added ? 'Added to cart' : `Add to cart · ${formatPrice(price * qty)}`;

  return (
    <div ref={root}>
      {/* ───────── Hero ───────── */}
      <section
        className={`lx-hero ${BLEED} -mt-8 sm:-mt-12 overflow-hidden text-[#f6f4ef] flex flex-col items-center text-center px-5 pb-16 min-h-[calc(100svh-80px)]`}
        style={{ ...NAV_PAD, background: 'radial-gradient(ellipse at 50% 30%, #12583f 0%, #072e21 45%, #031812 100%)' }}
      >
        <nav className="absolute left-5 top-[calc(var(--nav-h,80px)+1rem)] hidden md:flex items-center gap-2 text-xs text-white/60">
          <Link to="/" className="hover:text-white">Home</Link> /
          <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-white">{product.category}</Link>
        </nav>

        <p className="lx-eyebrow mt-10 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: GOLD }}>
          {product.brand} · {product.category}
        </p>
        <h1 className={`lx-title ${SERIF} mt-5 text-5xl sm:text-7xl lg:text-[104px] leading-[0.98] max-w-6xl`}>{product.title}</h1>

        <div className="lx-arch relative mt-12 w-[min(78vw,420px)] aspect-[3/4] rounded-t-full rounded-b-[2rem] overflow-hidden ring-1 ring-white/20 shadow-[0_40px_120px_-20px_rgba(0,0,0,.7)]">
          <img src={heroImg} alt={product.title} className="w-full h-full object-cover" />
        </div>

        <div className="lx-hero-cta mt-10 flex flex-col sm:flex-row items-center gap-5">
          <p className={`${SERIF} text-3xl`}>
            {formatPrice(price)}
            {product.discountPrice > 0 && <span className="ml-3 text-base text-white/50 line-through">{formatPrice(product.price)}</span>}
          </p>
          <a
            href="#lx-buy"
            className="px-8 py-3 rounded-full text-sm font-semibold tracking-wide text-[#0b3d2c] hover:brightness-110 active:scale-95 transition"
            style={{ backgroundColor: GOLD }}
          >
            Discover &amp; buy
          </a>
        </div>
        <ChevronDown className="mt-10 w-6 h-6 text-white/50 animate-bounce" aria-hidden="true" />
      </section>

      {/* ───────── Pinned zoom with key figures ───────── */}
      <section className={`lx-zoom ${BLEED} h-screen overflow-hidden bg-[#031812]`}>
        <div className="lx-zoom-frame absolute inset-0 motion-safe:[clip-path:inset(14%_26%_14%_26%_round_999px_999px_40px_40px)]">
          <img src={detailImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 grid place-items-center text-center text-[#f6f4ef] px-6">
          {figures.map((f) => (
            <div key={f.label} className="lx-fig motion-safe:opacity-0 col-start-1 row-start-1">
              <p className={`${SERIF} text-6xl sm:text-8xl lg:text-[9rem] leading-none`} style={{ color: GOLD }}>{f.big}</p>
              <p className="mt-4 text-xs sm:text-sm uppercase tracking-[0.4em] text-white/80">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Statement ───────── */}
      <section className={`lx-statement ${BLEED} overflow-hidden px-5 py-28 sm:py-40`} style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-14 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] mb-6" style={{ color: GREEN }}>The watch</p>
            <p className={`${SERIF} text-3xl sm:text-5xl leading-[1.15] text-[#1a1a1a]`}>
              {words.map((w, i) => (
                <span key={i} className="lx-word motion-safe:opacity-[0.16] inline-block mr-[0.26em]">{w}</span>
              ))}
            </p>
          </div>
          <div className="relative aspect-[4/5] rounded-t-full rounded-b-[2rem] overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,.4)]">
            <img src={detailImg} alt="" className="lx-parallax absolute inset-0 w-full h-[116%] -top-[8%] object-cover" />
          </div>
        </div>
      </section>

      {/* ───────── Specs accordion ───────── */}
      {groups.length > 0 && (
        <section className={`${BLEED} px-5 py-24 text-[#f6f4ef]`} style={{ backgroundColor: GREEN }}>
          <div className="max-w-4xl mx-auto">
            <h2 className={`${SERIF} text-4xl sm:text-6xl`}>Specifications</h2>
            <div className="mt-12 divide-y divide-white/15 border-y border-white/15">
              {groups.map(([g, items], i) => (
                <div key={g}>
                  <button
                    onClick={() => setOpen(open === i ? -1 : i)}
                    aria-expanded={open === i}
                    className="w-full flex items-center justify-between py-6 text-left"
                  >
                    <span className={`${SERIF} text-2xl sm:text-3xl`}>{g}</span>
                    <span className="w-9 h-9 rounded-full border border-white/30 grid place-items-center" style={{ color: GOLD }}>
                      {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {open === i && (
                    <dl className="pb-6 grid gap-4">
                      {items.map((s) => (
                        <div key={s.label} className="grid sm:grid-cols-[220px_1fr] gap-1 sm:gap-8">
                          <dt className="text-sm text-white/60">{s.label}</dt>
                          <dd className="text-[17px]">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Purchase ───────── */}
      <section id="lx-buy" className={`${BLEED} px-5 py-24 scroll-mt-24`} style={{ backgroundColor: CREAM }}>
        <div className="max-w-5xl mx-auto text-center text-[#1a1a1a]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: GREEN }}>Own it</p>
          <h2 className={`${SERIF} mt-4 text-4xl sm:text-6xl`}>{product.title}</h2>
          <p className={`${SERIF} mt-4 text-4xl`}>{formatPrice(price)}</p>
          <p className="mt-2 text-sm text-[#6b675e]">
            {product.stock > 0 ? `${product.stock} available · sold by ${store}` : 'Currently unavailable'}
          </p>

          {product.stock > 0 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
              <div className="flex items-center rounded-full border border-[#cfc9bb] bg-white">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="w-12 h-12 grid place-items-center hover:bg-[#f0ede4] rounded-full">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Increase quantity" className="w-12 h-12 grid place-items-center hover:bg-[#f0ede4] rounded-full">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                style={{ backgroundColor: added ? '#1f7a4f' : GREEN }}
                className="flex-1 w-full h-12 rounded-full text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[.98] transition"
              >
                {added && <Check className="w-4 h-4" />}
                {addLabel}
              </button>
              <button
                onClick={() => {
                dispatch(toggleWishlist(product));
                toast(wished ? 'Removed from wishlist' : 'Saved to your wishlist', 'wish');
              }}
                aria-pressed={wished}
                aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
                className="w-12 h-12 rounded-full border border-[#cfc9bb] bg-white grid place-items-center hover:scale-105 active:scale-95 transition flex-shrink-0"
              >
                <Heart className={`w-5 h-5 ${wished ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          )}

          <ul className="mt-16 grid sm:grid-cols-3 gap-10 text-left sm:text-center">
            {perks.map(([Icon, t, d]) => (
              <li key={t} className="flex sm:flex-col items-start sm:items-center gap-4">
                <Icon className="w-6 h-6 flex-shrink-0" style={{ color: GREEN }} />
                <div>
                  <p className="text-sm font-semibold">{t}</p>
                  <p className="text-sm text-[#6b675e] mt-1">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Sticky buy bar ───────── */}
      {product.stock > 0 && (
        <div className="lx-bar fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 pl-6 pr-2 py-2 rounded-full bg-[#031812]/90 backdrop-blur-xl text-[#f6f4ef] shadow-2xl ring-1 ring-white/15 max-w-[92vw]">
          <div className="min-w-0">
            <p className={`${SERIF} text-base truncate max-w-[40vw] sm:max-w-xs`}>{product.title}</p>
            <p className="text-xs" style={{ color: GOLD }}>{formatPrice(price)}</p>
          </div>
          <button
            onClick={() => onAdd(1)}
            className="px-5 py-3 rounded-full text-sm font-semibold text-[#0b3d2c] hover:brightness-110 active:scale-95 transition"
            style={{ backgroundColor: GOLD }}
          >
            Add to cart
          </button>
        </div>
      )}
    </div>
  );
};

export default LuxuryProductPage;
