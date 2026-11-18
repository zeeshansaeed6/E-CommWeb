import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck, Minus, Plus, Truck } from 'lucide-react';
import { addToCart, removeFromCart } from '../redux/slices/cartSlice';
import useCurrency from '../hooks/useCurrency';
import ThemedThumb from '../components/common/ThemedThumb';
import BagColorStrip from '../components/common/BagColorStrip';
import { itemStyle } from '../components/product/themes/productTheme';

gsap.registerPlugin(useGSAP);

// Matches the free-shipping rule in cartSlice / the order API (base currency)
const FREE_SHIPPING_FROM = 100;

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const root = useRef(null);
  const { formatPrice } = useCurrency();
  const { cartItems, itemsPrice, taxPrice, shippingPrice, totalPrice } = useSelector((state) => state.cart);

  const count = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const progress = Math.min(100, (itemsPrice / FREE_SHIPPING_FROM) * 100);
  const remaining = Math.max(0, FREE_SHIPPING_FROM - itemsPrice);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.cart-head > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
        gsap.from('.cart-line', { y: 36, opacity: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out', delay: 0.15 });
        gsap.from('.cart-summary', { x: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.25 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [cartItems.length === 0] }
  );

  // Animate the shipping progress whenever the subtotal changes
  useGSAP(
    () => {
      gsap.to('.ship-fill', { width: `${progress}%`, duration: 0.9, ease: 'power3.out' });
    },
    { scope: root, dependencies: [progress] }
  );

  const handleQtyChange = (item, newQty) => {
    if (newQty < 1 || newQty > item.stock) return;
    dispatch(addToCart({ ...item, qty: newQty }));
  };

  // Slide the line out first, then remove it from the store
  const handleRemove = contextSafe((id, el) => {
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dispatch(removeFromCart(id));
      return;
    }
    gsap.to(el, { x: -60, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => dispatch(removeFromCart(id)) });
  });

  if (cartItems.length === 0) {
    return (
      <div ref={root} className="max-w-2xl mx-auto text-center py-24 space-y-6">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] bg-slate-900 text-white">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <h1 className="text-4xl font-sans font-semibold tracking-[-0.04em] text-slate-900">Your bag is empty.</h1>
        <p className="text-slate-500 max-w-sm mx-auto">Browse the marketplace and save something you love. It will show up here in its own style.</p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 active:scale-95 transition">
          <ArrowLeft className="h-4 w-4" /> Explore the marketplace
        </Link>
      </div>
    );
  }

  return (
    <div ref={root} className="max-w-7xl mx-auto space-y-10">
      <div className="cart-head flex items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl sm:text-6xl font-sans font-semibold tracking-[-0.045em] text-slate-900">Your bag.</h1>
          <p className="mt-2 text-slate-500">
            {count} {count === 1 ? 'item' : 'items'} · {formatPrice(itemsPrice)}
          </p>
        </div>
        <Link to="/" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>
      </div>

      {/* Free shipping progress */}
      <div className="cart-head rounded-3xl bg-white p-5 ring-1 ring-slate-200/70">
        <div className="flex items-center gap-3 text-sm">
          <Truck className="h-5 w-5 text-slate-700" />
          <p className="font-semibold text-slate-900">
            {remaining === 0 ? 'You’ve unlocked free shipping.' : `Add ${formatPrice(remaining)} more for free shipping.`}
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="ship-fill h-full w-0 rounded-full bg-gradient-to-r from-slate-900 to-slate-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <ul className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => {
            const price = item.discountPrice > 0 ? item.discountPrice : item.price;
            const { theme, label, accent } = itemStyle(item);
            return (
              <li
                key={item._id}
                className="cart-line relative flex flex-col sm:flex-row sm:items-center gap-5 overflow-hidden rounded-[1.75rem] bg-white p-5 pl-7 ring-1 ring-slate-200/70 transition-shadow hover:shadow-xl"
              >
                <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: accent }} aria-hidden="true" />

                <ThemedThumb src={item.image} alt={item.title} theme={theme} accent={accent} size="w-24 h-24" />

                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: `${accent}22`, color: accent === '#c6ff00' || accent === '#ffe600' ? '#3f3f00' : accent }}>
                    {label}
                  </span>
                  <Link to={`/product/${item._id}`} className="mt-1.5 block truncate text-lg font-semibold tracking-tight text-slate-900 hover:underline">
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {formatPrice(price)}
                    {item.discountPrice > 0 && <span className="ml-2 text-xs line-through opacity-60">{formatPrice(item.price)}</span>}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="flex items-center rounded-full ring-1 ring-slate-200">
                    <button onClick={() => handleQtyChange(item, item.qty - 1)} aria-label="Decrease quantity" className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 disabled:opacity-30" disabled={item.qty <= 1}>
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => handleQtyChange(item, item.qty + 1)} aria-label="Increase quantity" className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 disabled:opacity-30" disabled={item.qty >= item.stock}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="w-28 text-right text-lg font-semibold tracking-tight text-slate-900">{formatPrice(price * item.qty)}</span>

                  <button
                    onClick={(e) => handleRemove(item._id, e.currentTarget.closest('.cart-line'))}
                    aria-label={`Remove ${item.title}`}
                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Summary */}
        <aside className="cart-summary lg:col-span-4 lg:sticky lg:top-28 rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Order summary</p>
          <BagColorStrip items={cartItems} className="mt-4" />
          <p className="mt-2 text-[11px] text-white/40">Colours show how your bag splits across item styles.</p>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between text-white/70">
              <dt>Subtotal</dt>
              <dd className="font-medium text-white">{formatPrice(itemsPrice)}</dd>
            </div>
            <div className="flex justify-between text-white/70">
              <dt>Estimated tax (5%)</dt>
              <dd className="font-medium text-white">{formatPrice(taxPrice)}</dd>
            </div>
            <div className="flex justify-between text-white/70">
              <dt>Shipping</dt>
              <dd className="font-medium text-white">{shippingPrice === 0 ? <span className="text-emerald-400">Free</span> : formatPrice(shippingPrice)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-white/10 pt-4">
              <dt className="text-base font-semibold">Total</dt>
              <dd className="text-3xl font-semibold tracking-tight">{formatPrice(totalPrice)}</dd>
            </div>
          </dl>

          <button
            onClick={() => navigate('/checkout')}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-slate-950 transition hover:scale-[1.02] active:scale-95"
          >
            Check out <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-white/50">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> 256-bit encryption · Stripe escrow
          </p>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
