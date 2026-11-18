import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Package, ArrowRight } from 'lucide-react';
import { getMyOrders } from '../redux/slices/orderSlice';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import useCurrency from '../hooks/useCurrency';
import ThemedThumb from '../components/common/ThemedThumb';
import BagColorStrip from '../components/common/BagColorStrip';
import OrderTracker from '../components/order/OrderTracker';
import { itemStyle } from '../components/product/themes/productTheme';
import { shortId, stageLabel, themedOrderItems, trackerStage } from '../components/order/orderTheme';

gsap.registerPlugin(useGSAP);

const FILTERS = [
  ['all', 'All', () => true],
  ['unpaid', 'Unpaid', (o) => !o.isPaid],
  ['active', 'In progress', (o) => o.isPaid && trackerStage(o) >= 0 && trackerStage(o) < 4],
  ['done', 'Delivered', (o) => trackerStage(o) === 4],
];

const OrderHistoryPage = () => {
  const dispatch = useDispatch();
  const root = useRef(null);
  const { formatPrice } = useCurrency();
  const { orders, loading, error } = useSelector((state) => state.order);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  const stats = useMemo(
    () => ({
      count: orders.length,
      active: orders.filter((o) => o.isPaid && trackerStage(o) >= 0 && trackerStage(o) < 4).length,
      delivered: orders.filter((o) => trackerStage(o) === 4).length,
      spent: orders.filter((o) => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0),
    }),
    [orders]
  );

  const visible = orders.filter(FILTERS.find(([id]) => id === filter)[2]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.oh-head > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
        gsap.from('.oh-stat', { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.1 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [loading] }
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.oh-card', { y: 36, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [filter, loading, orders.length] }
  );

  if (loading) return <Loader message="Fetching your order history..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div ref={root} className="max-w-6xl mx-auto space-y-10">
      <div className="oh-head">
        <h1 className="text-5xl sm:text-6xl font-sans font-semibold tracking-[-0.045em] text-slate-900">Your orders.</h1>
        <p className="mt-2 text-slate-500">Track every split delivery, across every vendor.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[2rem] bg-white py-20 px-8 text-center ring-1 ring-slate-200/70 space-y-5">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] bg-slate-900 text-white">
            <Package className="h-9 w-9" />
          </div>
          <h2 className="text-3xl font-sans font-semibold tracking-tight text-slate-900">No orders yet.</h2>
          <p className="text-slate-500">When you place an order, you can follow it here.</p>
          <Link to="/" className="inline-flex rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 active:scale-95 transition">
            Start shopping
          </Link>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Orders', stats.count],
              ['In progress', stats.active],
              ['Delivered', stats.delivered],
              ['Total spent', formatPrice(stats.spent)],
            ].map(([k, v]) => (
              <div key={k} className="oh-stat rounded-3xl bg-white p-6 ring-1 ring-slate-200/70">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">{k}</dt>
                <dd className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter orders">
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={filter === id}
                onClick={() => setFilter(id)}
                className={`rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition active:scale-95 ${filter === id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="rounded-3xl bg-white p-10 text-center text-slate-500 ring-1 ring-slate-200/70">No orders match this filter.</p>
          ) : (
            <ul className="space-y-5">
              {visible.map((ord) => {
                const items = themedOrderItems(ord);
                const stage = trackerStage(ord);
                const lead = itemStyle(items[0]);
                return (
                  <li key={ord._id} className="oh-card relative overflow-hidden rounded-[2rem] bg-white p-6 pl-8 ring-1 ring-slate-200/70 transition-shadow hover:shadow-xl">
                    <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: lead.accent }} aria-hidden="true" />

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="flex -space-x-3 flex-shrink-0">
                          {items.slice(0, 4).map((it, i) => {
                            const st = itemStyle(it);
                            return <ThemedThumb key={i} src={it.image} theme={st.theme} accent={st.accent} size="w-14 h-14" />;
                          })}
                          {items.length > 4 && (
                            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-500">+{items.length - 4}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-base font-bold text-slate-900">#{shortId(ord._id)}</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ord.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {ord.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {new Date(ord.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} · {ord.orderItems.length}{' '}
                            {ord.orderItems.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-6 md:justify-end">
                        <div className="md:text-right">
                          <p className="text-xs uppercase tracking-widest text-slate-400">Total</p>
                          <p className="text-2xl font-semibold tracking-tight text-slate-900">{formatPrice(ord.totalPrice)}</p>
                        </div>
                        <Link to={`/orders/${ord._id}`} className="flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95">
                          Details <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <OrderTracker stage={stage} accent={lead.accent === '#c6ff00' || lead.accent === '#ffe600' ? '#0f172a' : lead.accent} compact />
                      <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
                        <span>{stageLabel(ord)}</span>
                        <BagColorStrip items={items} className="!w-40 !bg-slate-100" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistoryPage;
