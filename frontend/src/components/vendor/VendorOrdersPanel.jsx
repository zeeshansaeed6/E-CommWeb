import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ShoppingBag, MapPin } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import ThemedThumb from '../common/ThemedThumb';
import SplitOrderStatusBadge from '../order/SplitOrderStatusBadge';
import useCurrency from '../../hooks/useCurrency';
import { itemStyle } from '../product/themes/productTheme';
import { toast } from '../../lib/toast';
import { shortId } from '../order/orderTheme';
import { DASH_INPUT, EmptyState, Panel, Pill, SearchField } from '../dashboard/DashKit';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const DARK_ACCENTS = ['#c6ff00', '#ffe600'];

/** Split-order fulfilment for the signed-in vendor. Talks to GET /orders/vendor-orders and PATCH …/fulfillment. */
const VendorOrdersPanel = ({ onChange }) => {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [inputs, setInputs] = useState({});

  const load = useCallback(async () => {
    try {
      const { data } = await axiosClient.get('/orders/vendor-orders');
      setOrders(data.orders);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setInput = (itemId, field, value) => setInputs((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));

  const updateItem = async (orderId, itemId, newStatus) => {
    setBusyId(itemId);
    try {
      const entered = inputs[itemId] || {};
      await axiosClient.patch(`/orders/${orderId}/items/${itemId}/fulfillment`, {
        status: newStatus,
        trackingNumber: entered.trackingNumber,
        carrier: entered.carrier,
      });
      toast(`Item marked ${newStatus.toLowerCase()}`);
      await load();
      onChange?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item status');
    } finally {
      setBusyId(null);
    }
  };

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesText =
        !term || o._id.toLowerCase().includes(term) || o.customer?.name?.toLowerCase().includes(term) || o.customer?.email?.toLowerCase().includes(term);
      const matchesStatus = !status || o.vendorItems.some((i) => i.fulfillmentStatus === status);
      return matchesText && matchesStatus;
    });
  }, [orders, search, status]);

  if (loading) return <Loader message="Loading assigned orders..." />;

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="dk-panel flex flex-col gap-3 sm:flex-row">
        <SearchField value={search} onChange={setSearch} placeholder="Search by order, customer name or email" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={`${DASH_INPUT} sm:w-60`}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <Panel>
          <EmptyState icon={ShoppingBag} title="No orders to fulfil." text={search || status ? 'No orders match your filters.' : 'Customer orders containing your products will appear here.'} />
        </Panel>
      ) : (
        visible.map((order) => (
          <Panel key={order._id}>
            <header className="flex flex-col gap-4 border-b border-slate-100 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-lg font-bold text-slate-900">#{shortId(order._id)}</span>
                  <Pill tone={order.isPaid ? 'success' : 'warn'}>{order.isPaid ? 'Paid' : 'Awaiting payment'}</Pill>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {order.customer?.name || 'Customer'} · {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              {order.vendorPayout && (
                <div className="sm:text-right">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Your net payout</p>
                  <p className="text-2xl font-semibold tracking-tight text-emerald-600">{formatPrice(order.vendorPayout.netPayout)}</p>
                  <p className="text-[11px] text-slate-400">
                    Gross {formatPrice(order.vendorPayout.grossAmount)} · fee {formatPrice(order.vendorPayout.platformFee)}
                  </p>
                </div>
              )}
            </header>

            <ul className="divide-y divide-slate-100">
              {order.vendorItems.map((raw) => {
                const item = { ...raw, _id: raw.product?._id || raw.product || raw._id, category: raw.product?.category, theme: raw.product?.theme };
                const { theme, label, accent } = itemStyle(item);
                const busy = busyId === raw._id;
                return (
                  <li key={raw._id} className="relative flex flex-col gap-5 px-7 py-6 pl-9 lg:flex-row lg:items-center">
                    <span className="absolute inset-y-4 left-0 w-1.5 rounded-r" style={{ backgroundColor: accent }} aria-hidden="true" />
                    <ThemedThumb src={raw.image} theme={theme} accent={accent} size="w-16 h-16" />
                    <div className="min-w-0 flex-1">
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: `${accent}22`, color: DARK_ACCENTS.includes(accent) ? '#3f3f00' : accent }}>
                        {label}
                      </span>
                      <p className="mt-1 truncate font-semibold text-slate-900">{raw.title}</p>
                      <p className="text-sm text-slate-500">
                        {raw.qty} × {formatPrice(raw.price)} = <strong className="text-slate-900">{formatPrice(raw.qty * raw.price)}</strong>
                      </p>
                      <div className="mt-2"><SplitOrderStatusBadge status={raw.fulfillmentStatus || 'Pending'} /></div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3 lg:w-[30rem]">
                      <input type="text" placeholder="Carrier" aria-label="Carrier" defaultValue={raw.carrier || ''} onChange={(e) => setInput(raw._id, 'carrier', e.target.value)} className={DASH_INPUT} />
                      <input type="text" placeholder="Tracking #" aria-label="Tracking number" defaultValue={raw.trackingNumber || ''} onChange={(e) => setInput(raw._id, 'trackingNumber', e.target.value)} className={DASH_INPUT} />
                      <select value={raw.fulfillmentStatus || 'Pending'} disabled={busy} onChange={(e) => updateItem(order._id, raw._id, e.target.value)} aria-label="Fulfilment status" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50">
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="flex flex-col gap-2 bg-slate-50 px-7 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                {[order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode, order.shippingAddress?.country].filter(Boolean).join(', ')}
              </span>
              <Link to={`/orders/${order._id}`} target="_blank" className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:underline">
                Customer receipt <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </footer>
          </Panel>
        ))
      )}
    </div>
  );
};

export default VendorOrdersPanel;
