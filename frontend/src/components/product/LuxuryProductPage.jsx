import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check, Heart, ShieldCheck, Truck, BadgeCheck, Minus, Plus } from 'lucide-react';
import useCurrency from '../../hooks/useCurrency';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BLEED = 'relative w-screen ml-[calc(50%-50vw)]';
const SERIF = 'font-serif font-medium tracking-tight';
const GREEN = '#0b3d2c';

/**
 * Editorial product page for luxury items (product.theme === 'luxury'):
 * quiet palette, serif headings, staged hero, scroll-lit statement, tabbed spec sheet.
 */
const LuxuryProductPage = ({ product, onAdd }) => {
  const root = useRef(null);
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const wished = useSelector((s) => s.wishlist.items.some((x) => x._id === product._id));

  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState(0);
  const [added, setAdded] = useState(false);

  const images = product.images?.map((i) => i.url) || [];
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const store = product.vendor?.vendorDetails?.storeName || product.vendor?.name || 'Verified vendor';
  const words = product.description.split(/\s+/);

  const groups = useMemo(() => {
    const map = new Map();
    (product.specs || []).forEach((s) => map.set(s.group, [...(map.get(s.group) || []), s]));
    return [...map.entries()];
  }, [product.specs]);

  const handleAdd = () => {
    onAdd(qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.lux-hero-item', { y: 36, opacity: 0, stagger: 0.09, duration: 1, ease: 'power3.out' });
        gsap.fromTo(
          '.lux-word',
          { opacity: 0.18 },
          { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '.lux-statement', start: 'top 70%', end: 'bottom 45%', scrub: 1 } }
        );
        gsap.fromTo(
          '.lux-parallax',
          { yPercent: -8, scale: 1.12 },
          { yPercent: 8, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.lux-statement', start: 'top bottom', end: 'bottom top', scrub: 1 } }
        );
        gsap.from('.lux-spec-card', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.lux-specs', start: 'top 75%', once: true } });
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

  return (
    <div ref={root} className="text-[#1a1a1a]">
      {/* ───────── Hero ───────── */}
      <section className={`${BLEED} -mt-8 sm:-mt-12 bg-[#f6f4ef] px-5 pt-12 pb-20 sm:pt-16`}>
        <nav className="lux-hero-item max-w-7xl mx-auto mb-8 flex items-center gap-2 text-xs text-[#6b675e]">
          <Link to="/" className="hover:text-[#1a1a1a]">Home</Link> /
          <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-[#1a1a1a]">{product.category}</Link> /
          <span className="text-[#1a1a1a]">{product.title}</span>
        </nav>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-20 items-start">
          <div className="lux-hero-item lg:sticky lg:top-32">
            <div className="relative aspect-[4/5] sm:aspect-square rounded-[2rem] overflow-hidden bg-gradient-to-b from-[#ece8de] to-[#ddd8cb] shadow-[0_30px_80px_-30px_rgba(0,0,0,.35)]">
              <img src={images[active]} alt={product.title} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActive(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`w-20 h-20 rounded-2xl overflow-hidden ring-2 transition ${i === active ? 'ring-[#0b3d2c]' : 'ring-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:pt-6">
            <p className="lux-hero-item text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GREEN }}>
              {product.brand} · {product.category}
            </p>
            <h1 className={`lux-hero-item ${SERIF} mt-4 text-5xl sm:text-6xl leading-[1.02]`}>{product.title}</h1>
            <p className="lux-hero-item mt-6 text-[#4a463e] leading-relaxed text-[17px]">{product.description}</p>

            <div className="lux-hero-item mt-8 flex items-baseline gap-4">
              <span className={`${SERIF} text-4xl`}>{formatPrice(price)}</span>
              {product.discountPrice > 0 && <span className="text-[#8a857a] line-through">{formatPrice(product.price)}</span>}
            </div>
            <p className="lux-hero-item mt-1 text-xs text-[#6b675e]">
              {product.stock > 0 ? `${product.stock} available · sold by ${store}` : 'Currently unavailable'}
            </p>

            {product.stock > 0 && (
              <div className="lux-hero-item mt-8 flex items-center gap-3">
                <div className="flex items-center rounded-full border border-[#cfc9bb] bg-white">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="w-11 h-11 grid place-items-center hover:bg-[#f0ede4] rounded-full">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Increase quantity" className="w-11 h-11 grid place-items-center hover:bg-[#f0ede4] rounded-full">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  style={{ backgroundColor: added ? '#1f7a4f' : GREEN }}
                  className="flex-1 h-12 rounded-full text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[.98] transition"
                >
                  {added ? <Check className="w-4 h-4" /> : null}
                  {added ? 'Added to cart' : `Add to cart · ${formatPrice(price * qty)}`}
                </button>
                <button
                  onClick={() => dispatch(toggleWishlist(product))}
                  aria-pressed={wished}
                  aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
                  className="w-12 h-12 rounded-full border border-[#cfc9bb] bg-white grid place-items-center hover:scale-105 active:scale-95 transition"
                >
                  <Heart className={`w-5 h-5 ${wished ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            )}

            <ul className="lux-hero-item mt-10 space-y-5 border-t border-[#d8d3c6] pt-8">
              {perks.map(([Icon, t, d]) => (
                <li key={t} className="flex items-start gap-4">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: GREEN }} />
                  <div>
                    <p className="text-sm font-semibold">{t}</p>
                    <p className="text-sm text-[#6b675e]">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── Statement ───────── */}
      <section className={`lux-statement ${BLEED} overflow-hidden text-[#f6f4ef] px-5 py-28 sm:py-40`} style={{ backgroundColor: GREEN }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9b27c] mb-6">The watch</p>
            <p className={`${SERIF} text-3xl sm:text-5xl leading-[1.15]`}>
              {words.map((w, i) => (
                <span key={i} className="lux-word motion-safe:opacity-[0.18] inline-block mr-[0.26em]">{w}</span>
              ))}
            </p>
          </div>
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden ring-1 ring-white/15">
            <img src={images[images.length - 1]} alt="" className="lux-parallax absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ───────── Specs ───────── */}
      {groups.length > 0 && (
        <section className={`lux-specs ${BLEED} bg-[#f6f4ef] px-5 py-24`}>
          <div className="max-w-5xl mx-auto">
            <h2 className={`${SERIF} text-4xl sm:text-5xl`}>Specifications</h2>
            <div role="tablist" className="mt-10 flex gap-2 overflow-x-auto no-scrollbar border-b border-[#d8d3c6]">
              {groups.map(([g], i) => (
                <button
                  key={g}
                  role="tab"
                  aria-selected={tab === i}
                  onClick={() => setTab(i)}
                  className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === i ? 'text-[#0b3d2c] border-[#0b3d2c]' : 'text-[#6b675e] border-transparent hover:text-[#1a1a1a]'}`}
                >
                  {g}
                </button>
              ))}
            </div>
            <dl className="lux-spec-card mt-4 divide-y divide-[#e2ddd0]">
              {groups[tab][1].map((s) => (
                <div key={s.label} className="grid sm:grid-cols-[240px_1fr] gap-1 sm:gap-8 py-5">
                  <dt className="text-sm text-[#6b675e]">{s.label}</dt>
                  <dd className="text-[17px]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}
    </div>
  );
};

export default LuxuryProductPage;
