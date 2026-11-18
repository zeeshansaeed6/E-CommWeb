import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import useCurrency from '../../../hooks/useCurrency';
import { toast } from '../../../lib/toast';
import { toggleWishlist } from '../../../redux/slices/wishlistSlice';

const PERKS = [
  [ShieldCheck, 'Escrow protected', 'Your payment is held until delivery.'],
  [Truck, 'Direct from the vendor', 'Ships straight from the seller.'],
  [RotateCcw, '30-day returns', 'Changed your mind? Send it back.'],
];

/**
 * Shared purchase block used by every themed product page.
 * bg / fg set the section colours, accent drives the primary button,
 * square switches pill shapes to sharp corners (used by the energetic theme).
 */
const ProductBuyPanel = ({ product, onAdd, accent, bg, fg, muted, btnText = '#fff', square = false, headingClass = '' }) => {
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const wished = useSelector((s) => s.wishlist.items.some((x) => x._id === product._id));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const store = product.vendor?.vendorDetails?.storeName || product.vendor?.name || 'Verified vendor';
  const round = square ? 'rounded-none' : 'rounded-full';

  const handleAdd = () => {
    onAdd(qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section id="buy" className="relative w-screen ml-[calc(50%-50vw)] px-5 py-24 scroll-mt-24" style={{ backgroundColor: bg, color: fg }}>
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: accent }}>Make it yours</p>
        <h2 className={`mt-4 text-4xl sm:text-6xl ${headingClass}`}>{product.title}</h2>
        <p className={`mt-4 text-4xl ${headingClass}`}>
          {formatPrice(price)}
          {product.discountPrice > 0 && (
            <span className="ml-3 text-lg line-through" style={{ color: muted }}>{formatPrice(product.price)}</span>
          )}
        </p>
        <p className="mt-2 text-sm" style={{ color: muted }}>
          {product.stock > 0 ? `${product.stock} in stock · sold by ${store}` : 'Currently unavailable'}
        </p>

        {product.stock > 0 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
            <div className={`flex items-center ${round} border`} style={{ borderColor: `${fg}33` }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className={`w-12 h-12 grid place-items-center ${round} hover:bg-black/5`}>
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Increase quantity" className={`w-12 h-12 grid place-items-center ${round} hover:bg-black/5`}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              style={{ backgroundColor: added ? '#16a34a' : accent, color: added ? '#fff' : btnText }}
              className={`flex-1 w-full h-12 ${round} text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[.98] transition`}
            >
              {added && <Check className="w-4 h-4" />}
              {added ? 'Added to cart' : `Add to cart · ${formatPrice(price * qty)}`}
            </button>
            <button
              onClick={() => {
                dispatch(toggleWishlist(product));
                toast(wished ? 'Removed from wishlist' : 'Saved to your wishlist', 'wish');
              }}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`w-12 h-12 ${round} border grid place-items-center hover:scale-105 active:scale-95 transition flex-shrink-0`}
              style={{ borderColor: `${fg}33` }}
            >
              <Heart className={`w-5 h-5 ${wished ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        )}

        <ul className="mt-16 grid sm:grid-cols-3 gap-10 text-left sm:text-center">
          {PERKS.map(([Icon, t, d]) => (
            <li key={t} className="flex sm:flex-col items-start sm:items-center gap-4">
              <Icon className="w-6 h-6 flex-shrink-0" style={{ color: accent }} />
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-sm mt-1" style={{ color: muted }}>{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ProductBuyPanel;
