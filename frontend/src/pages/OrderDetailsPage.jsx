import React, { useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MapPin, Truck, Store, ExternalLink, ArrowLeft } from 'lucide-react';
import { getOrderDetails, initiateStripeCheckout, simulatePayment } from '../redux/slices/orderSlice';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import SplitOrderStatusBadge from '../components/order/SplitOrderStatusBadge';
import OrderTracker from '../components/order/OrderTracker';
import ThemedThumb from '../components/common/ThemedThumb';
import BagColorStrip from '../components/common/BagColorStrip';
import useCurrency from '../hooks/useCurrency';
import { itemStyle } from '../components/product/themes/productTheme';
import { shortId, themedOrderItems, trackerStage } from '../components/order/orderTheme';

gsap.registerPlugin(useGSAP);

const DARK_ACCENTS = ['#c6ff00', '#ffe600'];

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const root = useRef(null);
  const { formatPrice } = useCurrency();

  const { order, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getOrderDetails(id));
  }, [dispatch, id]);

  // One package per vendor: this is how split fulfilment ships
  const packages = useMemo(() => {
    if (!order) return [];
    const groups = new Map();
    themedOrderItems(order).forEach((item) => {
      const key = item.vendor?._id || item.vendor || 'unknown';
      if (!groups.has(key)) groups.set(key, { vendor: item.vendor, items: [] });
      groups.get(key).items.push(item);
    });
    return [...groups.values()];
  }, [order]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.od-head > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
        gsap.from('.od-card', { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.15 });
        gsap.from('.od-side', { x: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.25 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [loading, order?._id] }
  );

  const handlePayStripe = async () => {
    const res = await dispatch(initiateStripeCheckout(order._id)).unwrap();
    if (res.url) {
      window.location.href = res.url;
    }
  };

  const handleSimulatePay = () => {
    dispatch(simulatePayment(order._id));
  };

  if (loading) return <Loader message="Fetching order breakdown..." />;
  if (error) return <Alert type="error" message={error} />;
  if (!order) return null;

  const items = themedOrderItems(order);
  const stage = trackerStage(order);
  const lead = itemStyle(items[0]);
  const trackerAccent = DARK_ACCENTS.includes(lead.accent) ? '#0f172a' : lead.accent;

  return (
    <div ref={root} className="max-w-6xl mx-auto space-y-8">
      <div className="od-head space-y-5">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> All orders
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl sm:text-6xl font-sans font-semibold tracking-[-0.045em] text-slate-900">Order #{shortId(order._id)}.</h1>
            <p className="mt-2 text-slate-500">
              Placed {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })} at{' '}
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${order.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {order.isPaid ? 'Paid' : 'Payment pending'}
          </span>
        </div>
      </div>

      <section className="od-card rounded-[2rem] bg-white p-7 sm:p-9 ring-1 ring-slate-200/70">
        <OrderTracker stage={stage} accent={trackerAccent} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Packages, one per vendor */}
        <div className="lg:col-span-8 space-y-6">
          {packages.map((pkg, pi) => {
            const storeName = pkg.vendor?.vendorDetails?.storeName || pkg.vendor?.name || 'Vendor';
            const subtotal = pkg.items.reduce((s, i) => s + i.price * i.qty, 0);
            return (
              <section key={pi} className="od-card overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-200/70">
                <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-7 py-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
                      <Store className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{storeName}</h2>
                      <p className="text-xs text-slate-500">
                        Package {pi + 1} of {packages.length} · {pkg.items.length} {pkg.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold tracking-tight text-slate-900">{formatPrice(subtotal)}</p>
                </header>

                <ul className="divide-y divide-slate-100">
                  {pkg.items.map((item) => {
                    const { theme, label, accent } = itemStyle(item);
                    return (
                      <li key={item._id + item.title} className="relative flex flex-col gap-4 px-7 py-6 pl-9 sm:flex-row sm:items-center">
                        <span className="absolute inset-y-4 left-0 w-1.5 rounded-r" style={{ backgroundColor: accent }} aria-hidden="true" />
                        <ThemedThumb src={item.image} alt="" theme={theme} accent={accent} size="w-20 h-20" />

                        <div className="min-w-0 flex-1">
                          <span
                            className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                            style={{ backgroundColor: `${accent}22`, color: DARK_ACCENTS.includes(accent) ? '#3f3f00' : accent }}
                          >
                            {label}
                          </span>
                          {item.productId ? (
                            <Link to={`/product/${item.productId}`} className="mt-1 block truncate text-base font-semibold text-slate-900 hover:underline">
                              {item.title}
                            </Link>
                          ) : (
                            <p className="mt-1 truncate text-base font-semibold text-slate-900">{item.title}</p>
                          )}
                          <p className="mt-0.5 text-sm text-slate-500">
                            {item.qty} × {formatPrice(item.price)} = <strong className="text-slate-900">{formatPrice(item.qty * item.price)}</strong>
                          </p>
                          {item.trackingNumber ? (
                            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                              <Truck className="h-3.5 w-3.5" /> {item.carrier || 'Carrier'} · <strong>{item.trackingNumber}</strong>
                            </p>
                          ) : (
                            <p className="mt-2 text-xs italic text-slate-400">Tracking number appears once the vendor dispatches.</p>
                          )}
                        </div>

                        <SplitOrderStatusBadge status={item.fulfillmentStatus} />
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="od-side lg:col-span-4 lg:sticky lg:top-28 space-y-5">
          <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Summary</p>
            <BagColorStrip items={items} className="mt-4" />

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between text-white/70">
                <dt>Items</dt>
                <dd className="font-medium text-white">{formatPrice(order.itemsPrice)}</dd>
              </div>
              <div className="flex justify-between text-white/70">
                <dt>Tax (5%)</dt>
                <dd className="font-medium text-white">{formatPrice(order.taxPrice)}</dd>
              </div>
              <div className="flex justify-between text-white/70">
                <dt>Shipping</dt>
                <dd className="font-medium text-white">{order.shippingPrice === 0 ? <span className="text-emerald-400">Free</span> : formatPrice(order.shippingPrice)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-white/10 pt-4">
                <dt className="text-base font-semibold">{order.isPaid ? 'Total paid' : 'Total due'}</dt>
                <dd className="text-3xl font-semibold tracking-tight">{formatPrice(order.totalPrice)}</dd>
              </div>
            </dl>

            {!order.isPaid && (
              <div className="mt-6 space-y-3">
                <button onClick={handlePayStripe} className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-slate-950 transition hover:scale-[1.02] active:scale-95">
                  Pay {formatPrice(order.totalPrice)} now <ExternalLink className="h-4 w-4" />
                </button>
                <button onClick={handleSimulatePay} className="w-full rounded-full border border-amber-300/40 py-2.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-300/10">
                  [Dev test] Simulate instant Stripe webhook
                </button>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-7 ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Delivering to</h3>
            </div>
            <address className="mt-4 space-y-0.5 text-sm not-italic text-slate-600">
              <p className="font-semibold text-slate-900">{order.customer?.name}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
            </address>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
