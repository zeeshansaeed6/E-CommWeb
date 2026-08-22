import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShieldCheck,
  Store,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard,
  Users,
  AlertCircle
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import useCurrency from '../../hooks/useCurrency';

const AdminPayoutsPage = () => {
  const { formatPrice } = useCurrency();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axiosClient.get('/admin/payouts');
      setPayouts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load escrow settlements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleReleasePayout = async (orderId, vendorId) => {
    try {
      setActionInProgress(`${orderId}-${vendorId}`);
      setError('');
      setSuccessMsg('');

      await axiosClient.put(`/admin/payouts/${orderId}/vendor/${vendorId}/pay`);
      setSuccessMsg('Escrow payout released successfully');
      fetchPayouts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release escrow payout');
    } finally {
      setActionInProgress(null);
    }
  };

  // Metrics
  const totalEscrowPending = payouts
    .filter((p) => p.status === 'Pending')
    .reduce((acc, p) => acc + (p.netPayout || 0), 0);

  const totalPaidOut = payouts
    .filter((p) => p.status === 'Paid')
    .reduce((acc, p) => acc + (p.netPayout || 0), 0);

  const totalPlatformCommissions = payouts.reduce((acc, p) => acc + (p.commission || 0), 0);

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      p.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? p.status?.toLowerCase() === statusFilter.toLowerCase() : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Financial Settlement Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vendor Escrow Payouts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit item-level split fulfillments, verify deliveries, and release vendor net earnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
          </Link>
        </div>
      </div>

      {successMsg && <Alert type="success" message={successMsg} />}
      {error && <Alert type="error" message={error} />}

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Escrow In-Flight</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{formatPrice(totalEscrowPending)}</p>
          <p className="text-xs text-slate-400">Held safely until package delivery</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Settled Out</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{formatPrice(totalPaidOut)}</p>
          <p className="text-xs text-slate-400">Released to vendor accounts</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Take (GMV Cut)</span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600">{formatPrice(totalPlatformCommissions)}</p>
          <p className="text-xs text-slate-400">Retained revenue from commission</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, merchant or store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
        >
          <option value="">All Settlement Statuses</option>
          <option value="Pending">Pending Escrow</option>
          <option value="Paid">Settled / Paid Out</option>
        </select>
      </div>

      {/* Settlements Table */}
      {loading ? (
        <Loader message="Loading escrow ledger..." />
      ) : filteredPayouts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No payout records found</h3>
          <p className="text-xs text-slate-400">Escrow ledger entries will generate when orders are placed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Merchant Partner</th>
                  <th className="py-4 px-6">Package GMV</th>
                  <th className="py-4 px-6">Platform Fee</th>
                  <th className="py-4 px-6">Net Vendor Payout</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPayouts.map((p, idx) => {
                  const isPaid = p.status === 'Paid';
                  const isProcessing = actionInProgress === `${p.orderId}-${p.vendorId}`;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <Link
                          to={`/orders/${p.orderId}`}
                          target="_blank"
                          className="font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                        >
                          <span>#{p.orderId?.substring(0, 10)}...</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <Store className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-900">{p.storeName || p.vendorName || 'Vendor'}</p>
                            <p className="text-xs text-slate-400">{p.vendorEmail || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {formatPrice(p.subtotal)}
                      </td>
                      <td className="py-4 px-6 font-bold text-rose-600">
                        -{formatPrice(p.commission)}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-emerald-600">
                        {formatPrice(p.netPayout)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {isPaid ? 'Settled & Paid' : 'Escrow Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!isPaid ? (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleReleasePayout(p.orderId, p.vendorId)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isProcessing ? 'Releasing...' : 'Release Escrow'}</span>
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutsPage;
