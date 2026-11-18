import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MapPin, CreditCard, Lock, ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import { saveShippingAddress, savePaymentMethod, clearCart } from '../redux/slices/cartSlice';
import { createOrder, initiateStripeCheckout } from '../redux/slices/orderSlice';
import Alert from '../components/common/Alert';
import useCurrency from '../hooks/useCurrency';
import ThemedThumb from '../components/common/ThemedThumb';
import BagColorStrip from '../components/common/BagColorStrip';
import { itemStyle } from '../components/product/themes/productTheme';

gsap.registerPlugin(useGSAP);

const INPUT =
  'w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-sm text-slate-900 ring-1 ring-slate-200 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900';

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</span>
    {children}
  </label>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const root = useRef(null);
  const { formatPrice } = useCurrency();

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems, shippingAddress, itemsPrice, taxPrice, shippingPrice, totalPrice } = useSelector((state) => state.cart);
  const { loading: orderLoading, error: orderError } = useSelector((state) => state.order);

  const [street, setStreet] = useState(shippingAddress.street || userInfo?.address?.street || '');
  const [city, setCity] = useState(shippingAddress.city || userInfo?.address?.city || '');
  const [state, setState] = useState(shippingAddress.state || userInfo?.address?.state || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || userInfo?.address?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || userInfo?.address?.country || 'United States');
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState('');

  const addressDone = Boolean(street && city && state && postalCode && country);

  useEffect(() => {
    if (!userInfo) navigate('/login?redirect=/checkout');
    if (cartItems.length === 0) navigate('/cart');
  }, [userInfo, cartItems, navigate]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.co-head > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
        gsap.from('.co-card', { y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.1 });
        gsap.from('.co-summary', { x: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!addressDone) {
      setLocalError('Please complete all shipping address fields');
      return;
    }

    const addressPayload = { street, city, state, postalCode, country };
    dispatch(saveShippingAddress(addressPayload));
    dispatch(savePaymentMethod(paymentMethod));

    setProcessing(true);

    try {
      // 1. Create Master Order in DB
      const orderResult = await dispatch(
        createOrder({
          orderItems: cartItems.map((item) => ({
            product: item._id,
            qty: item.qty,
            price: item.discountPrice > 0 ? item.discountPrice : item.price,
            image: item.image,
            title: item.title,
            vendor: item.vendor,
          })),
          shippingAddress: addressPayload,
          paymentMethod,
        })
      ).unwrap();

      // Clear local cart now that order is saved
      dispatch(clearCart());

      // 2. Initiate Stripe Checkout Session
      const stripeResult = await dispatch(initiateStripeCheckout(orderResult._id)).unwrap();

      if (stripeResult.url) {
        // Redirect to Stripe checkout (or simulated success URL)
        window.location.href = stripeResult.url;
      } else {
        navigate(`/orders/${orderResult._id}`);
      }
    } catch (err) {
      setLocalError(err || 'Failed to place order. Please try again.');
      setProcessing(false);
    }
  };

  const steps = [
    ['Shipping', addressDone],
    ['Payment', addressDone && Boolean(paymentMethod)],
    ['Review', false],
  ];

  return (
    <div ref={root} className="max-w-6xl mx-auto space-y-10">
      <div className="co-head space-y-6">
        <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to bag
        </button>
        <h1 className="text-5xl sm:text-6xl font-sans font-semibold tracking-[-0.045em] text-slate-900">Check out.</h1>

        <ol className="flex items-center gap-3 text-sm" aria-label="Checkout progress">
          {steps.map(([name, done], i) => (
            <React.Fragment key={name}>
              <li className="flex items-center gap-2">
                <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-colors ${done ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={done ? 'font-semibold text-slate-900' : 'text-slate-500'}>{name}</span>
              </li>
              {i < steps.length - 1 && <span className="h-px w-8 bg-slate-300 sm:w-14" aria-hidden="true" />}
            </React.Fragment>
          ))}
        </ol>
      </div>

      {(localError || orderError) && <Alert type="error" message={localError || orderError} onClose={() => setLocalError('')} />}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping */}
          <section className="co-card rounded-[2rem] bg-white p-7 sm:p-9 ring-1 ring-slate-200/70 space-y-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Where should we send it?</h2>
            </div>

            <Field label="Street address">
              <input type="text" required value={street} onChange={(e) => setStreet(e.target.value)} placeholder="742 Evergreen Terrace, Apt 4B" autoComplete="street-address" className={INPUT} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City">
                <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="San Francisco" autoComplete="address-level2" className={INPUT} />
              </Field>
              <Field label="State / Province">
                <input type="text" required value={state} onChange={(e) => setState(e.target.value)} placeholder="CA" autoComplete="address-level1" className={INPUT} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Postal code">
                <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="94102" autoComplete="postal-code" className={INPUT} />
              </Field>
              <Field label="Country">
                <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" autoComplete="country-name" className={INPUT} />
              </Field>
            </div>
          </section>

          {/* Payment */}
          <section className="co-card rounded-[2rem] bg-white p-7 sm:p-9 ring-1 ring-slate-200/70 space-y-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
                <CreditCard className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">How would you like to pay?</h2>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-5 ring-2 ring-slate-900 bg-slate-50">
              <div className="flex items-center gap-4">
                <input type="radio" name="payment" checked={paymentMethod === 'Stripe'} onChange={() => setPaymentMethod('Stripe')} className="h-4 w-4 accent-slate-900" />
                <div>
                  <span className="block text-sm font-semibold text-slate-900">Card, Apple Pay or Google Pay</span>
                  <span className="text-xs text-slate-500">Secure Stripe Checkout with instant confirmation.</span>
                </div>
              </div>
              <Lock className="h-4 w-4 flex-shrink-0 text-slate-700" />
            </label>
          </section>
        </div>

        {/* Summary */}
        <aside className="co-summary lg:col-span-5 lg:sticky lg:top-28 rounded-[2rem] bg-slate-950 p-7 sm:p-8 text-white shadow-2xl space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Your order</p>
            <BagColorStrip items={cartItems} className="mt-4" />
          </div>

          <ul className="max-h-72 space-y-4 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const price = item.discountPrice > 0 ? item.discountPrice : item.price;
              const { theme, label, accent } = itemStyle(item);
              return (
                <li key={item._id} className="flex items-center gap-4">
                  <ThemedThumb src={item.image} theme={theme} accent={accent} size="w-14 h-14" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-white/50">
                      <span style={{ color: accent }}>●</span> {label} · Qty {item.qty}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(price * item.qty)}</span>
                </li>
              );
            })}
          </ul>

          <dl className="space-y-3 border-t border-white/10 pt-5 text-sm">
            <div className="flex justify-between text-white/70">
              <dt>Subtotal</dt>
              <dd className="font-medium text-white">{formatPrice(itemsPrice)}</dd>
            </div>
            <div className="flex justify-between text-white/70">
              <dt>Tax (5%)</dt>
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
            type="submit"
            disabled={processing || orderLoading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-slate-950 transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing || orderLoading ? (
              'Preparing secure checkout…'
            ) : (
              <>
                <Lock className="h-4 w-4" /> Pay {formatPrice(totalPrice)}
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-2 text-[11px] text-white/50">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Escrow protected. Vendors are paid when they ship.
          </p>
        </aside>
      </form>
    </div>
  );
};

export default CheckoutPage;
