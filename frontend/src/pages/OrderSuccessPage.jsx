import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Clock, Package, Send, Truck } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import useCurrency from '../hooks/useCurrency';
import ThemedThumb from '../components/common/ThemedThumb';
import BagColorStrip from '../components/common/BagColorStrip';
import OrderTracker from '../components/order/OrderTracker';
import { itemStyle } from '../components/product/themes/productTheme';
import { shortId, themedOrderItems, trackerStage } from '../components/order/orderTheme';

gsap.registerPlugin(useGSAP);

const MAX_POLLS = 5;
const POLL_MS = 3000;
const FALLBACK_COLORS = ['#0071e3', '#f97316', '#00e5ff', '#e8a0b4', '#c1583a', '#c9b27c'];

const NEXT_STEPS = [
  [Send, 'Vendors are notified', 'Each store gets only its own part of your order.'],
  [Package, 'Packed separately', 'Items ship in independent packages, so they may arrive on different days.'],
  [Truck, 'Tracking appears', 'Carrier and tracking numbers show up on your order page.'],
];

/** A short confetti burst from the middle of the screen, coloured by the items in the order. */
const confetti = (colors) => {
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:80;overflow:hidden';
  document.body.appendChild(layer);

  const pieces = Array.from({ length: 70 }, (_, i) => {
    const el = document.createElement('span');
    const size = 6 + Math.random() * 8;
    el.style.cssText = `position:absolute;left:50%;top:38%;width:${size}px;height:${size * (Math.random() > 0.5 ? 1 : 0.45)}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.6 ? '50%' : '2px'}`;
    layer.appendChild(el);
    return el;
  });

  gsap.to(pieces, {
    x: () => (Math.random() - 0.5) * window.innerWidth * 0.9,
    y: () => -120 - Math.random() * 280,
    rotation: () => (Math.random() - 0.5) * 900,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.004,
  });
  gsap.to(pieces, {
    y: `+=${window.innerHeight}`,
    opacity: 0,
    duration: 1.8,
    delay: 0.8,
    ease: 'power1.in',
    stagger: 0.004,
    onComplete: () => layer.remove(),
  });
  return () => layer.remove();
};

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { sessionId } = useParams();
  const orderId = searchParams.get('order_id');
  const root = useRef(null);
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState(null);
  const [state, setState] = useState(orderId ? 'loading' : 'unknown'); // loading | paid | pending | unknown
  const [polls, setPolls] = useState(0);

  const load = useCallback(async () => {
    try {
      const { data } = await axiosClient.get(`/orders/${orderId}`);
      setOrder(data.order);
      setState(data.order.isPaid ? 'paid' : 'pending');
    } catch {
      setState('unknown');
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) load();
  }, [orderId, load]);

  // A real Stripe webhook can land a moment after the redirect, so re-check a few times
  useEffect(() => {
    if (state !== 'pending' || polls >= MAX_POLLS) return undefined;
    const t = setTimeout(() => {
      setPolls((n) => n + 1);
      load();
    }, POLL_MS);
    return () => clearTimeout(t);
  }, [state, polls, load]);

  const items = useMemo(() => (order ? themedOrderItems(order) : []), [order]);
  const accents = useMemo(() => (items.length ? [...new Set(items.map((i) => itemStyle(i).accent))] : FALLBACK_COLORS), [items]);
  const stage = order ? trackerStage(order) : 1;
  const lead = items.length ? itemStyle(items[0]) : { accent: '#10b981' };
  const trackerAccent = ['#c6ff00', '#ffe600'].includes(lead.accent) ? '#0f172a' : lead.accent;

  useGSAP(
    () => {
      if (state === 'loading') return undefined;
      const mm = gsap.matchMedia();
      let stopConfetti;
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tick = root.current.querySelector('.ok-tick');
        const ring = root.current.querySelector('.ok-ring');
        if (state === 'paid' && tick && ring) {
          const rl = ring.getTotalLength();
          const tl = tick.getTotalLength();
          gsap.set(ring, { strokeDasharray: rl, strokeDashoffset: rl });
          gsap.set(tick, { strokeDasharray: tl, strokeDashoffset: tl });
          gsap
            .timeline({ defaults: { ease: 'power2.out' } })
            .to(ring, { strokeDashoffset: 0, duration: 0.8 })
            .to(tick, { strokeDashoffset: 0, duration: 0.5 }, '-=0.1')
            .fromTo('.ok-badge', { scale: 0.85 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, '<');
          stopConfetti = confetti(accents);
        }
        gsap.from('.ok-in > *', { y: 28, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.2 });
        gsap.from('.ok-step', { y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.7 });
      });
      return () => {
        stopConfetti?.();
        mm.revert();
      };
    },
    { scope: root, dependencies: [state] }
  );

  const paid = state === 'paid';

  if (state === 'loading') {
    return (
      <div className="py-32 text-center text-slate-500" role="status">
        Confirming your order…
      </div>
    );
  }

  return (
    <div ref={root} className="max-w-3xl mx-auto py-8 space-y-10">
      <div className="ok-in text-center space-y-5">
        <span className={`ok-badge mx-auto grid h-28 w-28 place-items-center rounded-full ${paid ? 'bg-emerald-50' : 'bg-amber-50'}`}>
          {paid ? (
            <svg viewBox="0 0 52 52" className="h-24 w-24" aria-hidden="true">
              <circle className="ok-ring" cx="26" cy="26" r="23" fill="none" stroke="#10b981" strokeWidth="3" />
              <path className="ok-tick" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" d="M15 27l8 8 15-17" />
            </svg>
          ) : (
            <Clock className="h-12 w-12 text-amber-500" />
          )}
        </span>

        <p className={`text-xs font-bold uppercase tracking-[0.3em] ${paid ? 'text-emerald-600' : 'text-amber-600'}`}>
          {paid ? 'Payment confirmed' : state === 'pending' ? 'Order received' : 'Thanks for shopping'}
        </p>
        <h1 className="text-5xl sm:text-6xl font-sans font-semibold tracking-[-0.045em] text-slate-900">{paid ? 'Thank you.' : state === 'pending' ? 'Almost there.' : 'Order placed.'}</h1>
        <p className="mx-auto max-w-lg text-slate-500">
          {paid
            ? 'Your payment went through. Every vendor has been notified and will prepare and ship their part of your order.'
            : state === 'pending'
            ? polls >= MAX_POLLS
              ? 'We have not received payment for this order yet. You can finish paying from your order page.'
              : 'We are waiting for your payment to be confirmed. This usually takes a few seconds.'
            : 'We could not load the order details here, but you can find your order in your account.'}
        </p>
      </div>

      {order && (
        <section className="ok-step rounded-[2rem] bg-white p-7 ring-1 ring-slate-200/70 sm:p-9 space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <div className="flex -space-x-3">
                {items.slice(0, 4).map((it, i) => {
                  const st = itemStyle(it);
                  return <ThemedThumb key={i} src={it.image} theme={st.theme} accent={st.accent} size="w-14 h-14" />;
                })}
              </div>
              <div>
                <p className="font-mono text-lg font-bold text-slate-900">#{shortId(order._id)}</p>
                <p className="text-sm text-slate-500">
                  {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-slate-400">{paid ? 'Total paid' : 'Total due'}</p>
              <p className="text-3xl font-semibold tracking-tight text-slate-900">{formatPrice(order.totalPrice)}</p>
            </div>
          </div>

          <BagColorStrip items={items} className="!bg-slate-100" />
          <OrderTracker stage={stage} accent={trackerAccent} />
        </section>
      )}

      {paid && (
        <div className="grid gap-4 sm:grid-cols-3">
          {NEXT_STEPS.map(([Icon, title, text]) => (
            <div key={title} className="ok-step rounded-3xl bg-white p-6 ring-1 ring-slate-200/70">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold tracking-tight text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="ok-step flex flex-col items-center justify-center gap-3 sm:flex-row">
        {orderId && (
          <Link to={`/orders/${orderId}`} className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95 sm:w-auto">
            {paid ? 'Track your order' : 'View order & pay'} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link to="/" className="w-full rounded-full px-8 py-4 text-center text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 sm:w-auto">
          Continue shopping
        </Link>
      </div>

      {sessionId && <p className="text-center font-mono text-[11px] text-slate-400">Session {sessionId}</p>}
    </div>
  );
};

export default OrderSuccessPage;
