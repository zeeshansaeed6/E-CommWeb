import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Clock, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import useCurrency from '../../hooks/useCurrency';
import { toast } from '../../lib/toast';
import { shortId } from '../order/orderTheme';
import { DASH_INPUT, EmptyState, Panel, Pill, SearchField, StatCard, TH } from '../dashboard/DashKit';

/** Escrow ledger: one row per vendor package. Built from GET /orders/admin/all; release via PATCH /admin/orders/:id/payouts/:vendorId. */
const AdminPayoutsPanel = ({ showMetrics = false, onChange }) => {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axiosClient.get('/orders/admin/all');
      setOrders(data.orders);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the escrow ledger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () =>
      orders.flatMap((o) =>
        (o.vendorPayouts || []).map((vp) => ({
          key: `${o._id}-${vp.vendor?._id || vp.vendor}`,
          orderId: o._id,
          orderPaid: o.isPaid,
          customer: o.customer?.name || 'Customer',
          vendorId: vp.vendor?._id || vp.vendor,
          store: vp.vendor?.vendorDetails?.storeName || vp.vendor?.name || 'Vendor',
          gross: vp.grossAmount,
          rate: vp.commissionRate,
          fee: vp.platformFee,
          net: vp.netPayout,
          paid: vp.payoutStatus === 'Paid',
        }))
      ),
    [orders]
  );

  const release = async (row) => {
    setBusy(row.key);
    try {
      await axiosClient.patch(`/admin/orders/${row.orderId}/payouts/${row.vendorId}`);
      toast(`Released ${formatPrice(row.net)} to ${row.store}`);
      await load();
      onChange?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release payout');
    } finally {
      setBusy(null);
    }
  };

  const visible = rows.filter((r) => {
    const term = search.trim().toLowerCase();
    const text = !term || r.orderId.toLowerCase().includes(term) || r.store.toLowerCase().includes(term) || r.customer.toLowerCase().includes(term);
    const state = !status || (status === 'Paid' ? r.paid : !r.paid);
    return text && state;
  });

  const pending = rows.filter((r) => !r.paid && r.orderPaid).reduce((s, r) => s + r.net, 0);
  const settled = rows.filter((r) => r.paid).reduce((s, r) => s + r.net, 0);
  const take = rows.filter((r) => r.orderPaid).reduce((s, r) => s + r.fee, 0);

  if (loading) return <Loader message="Loading escrow ledger..." />;

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {showMetrics && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard dark label="Escrow in flight" value={formatPrice(pending)} hint="Held until you release it" icon={Clock} accent="#f59e0b" />
          <StatCard label="Settled to vendors" value={formatPrice(settled)} hint="Released so far" icon={ShieldCheck} accent="#10b981" />
          <StatCard label="Platform take" value={formatPrice(take)} hint="Commission on paid orders" icon={TrendingUp} accent="#6366f1" />
        </div>
      )}

      <div className="dk-panel flex flex-col gap-3 sm:flex-row">
        <SearchField value={search} onChange={setSearch} placeholder="Search by order, store or customer" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by settlement status" className={`${DASH_INPUT} sm:w-60`}>
          <option value="">All settlements</option>
          <option value="Pending">Pending escrow</option>
          <option value="Paid">Settled</option>
        </select>
      </div>

      <Panel>
        {visible.length === 0 ? (
          <EmptyState icon={Wallet} title="Nothing here yet." text="Escrow entries appear as soon as an order is placed." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className={TH}>Order</th>
                  <th className={TH}>Store</th>
                  <th className={TH}>Gross</th>
                  <th className={TH}>Fee</th>
                  <th className={TH}>Net payout</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((r) => (
                  <tr key={r.key} className="transition hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <Link to={`/orders/${r.orderId}`} target="_blank" className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 hover:underline">
                        #{shortId(r.orderId)} <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      <p className="text-xs text-slate-500">{r.customer}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{r.store}</td>
                    <td className="px-6 py-4 text-slate-700">{formatPrice(r.gross)}</td>
                    <td className="px-6 py-4 font-semibold text-rose-600">−{formatPrice(r.fee)} <span className="text-xs font-normal text-slate-400">({r.rate}%)</span></td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">{formatPrice(r.net)}</td>
                    <td className="px-6 py-4">
                      <Pill tone={r.paid ? 'success' : r.orderPaid ? 'warn' : 'neutral'}>{r.paid ? 'Settled' : r.orderPaid ? 'Escrow' : 'Awaiting payment'}</Pill>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.paid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Done</span>
                      ) : (
                        <button
                          onClick={() => release(r)}
                          disabled={!r.orderPaid || busy === r.key}
                          className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {busy === r.key ? 'Releasing…' : 'Release payout'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default AdminPayoutsPanel;
