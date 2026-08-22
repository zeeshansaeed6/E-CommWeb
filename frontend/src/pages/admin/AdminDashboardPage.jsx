import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Store,
  DollarSign,
  Package,
  CheckCircle,
  Percent,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import useCurrency from '../../hooks/useCurrency';

const AdminDashboardPage = () => {
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' | 'orders' | 'users'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Commission edit state
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        axiosClient.get('/admin/stats'),
        axiosClient.get('/admin/users'),
        axiosClient.get('/orders/admin/all'),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setOrders(ordersRes.data.orders);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load platform admin panel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateCommission = async (vendorId) => {
    try {
      await axiosClient.patch(`/admin/vendors/${vendorId}`, {
        commissionRate: Number(newCommissionRate),
      });
      setSuccess('Vendor commission rate updated successfully');
      setEditingVendorId(null);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update commission');
    }
  };

  const handleMarkPayoutPaid = async (orderId, vendorId) => {
    try {
      await axiosClient.patch(`/admin/orders/${orderId}/payouts/${vendorId}`);
      setSuccess('Vendor payout marked as paid');
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to settle payout');
    }
  };

  if (loading) return <Loader message="Loading Platform Master Console..." />;

  const vendorUsers = users.filter((u) => u.role === 'Vendor');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Master Platform Governance
        </div>
        <h1 className="text-3xl font-display font-extrabold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time gross merchandise volume (GMV), platform fee cuts, vendor escrow, and multi-vendor oversight
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* High-Level Platform KPIs */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Gross Merchandise Vol.</p>
              <h3 className="text-2xl font-display font-black text-slate-900">
                {formatPrice(stats.grossVolume)}
              </h3>
              <span className="text-[10px] text-indigo-600 font-bold">Processed via Stripe</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Platform Revenue (Fees)</p>
              <h3 className="text-2xl font-display font-black text-emerald-600">
                {formatPrice(stats.totalPlatformRevenue)}
              </h3>
              <span className="text-[10px] text-emerald-700 font-bold">Net platform margin</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Vendor Escrow Payable</p>
              <h3 className="text-2xl font-display font-black text-slate-900">
                {formatPrice(stats.totalVendorPayoutsOwed)}
              </h3>
              <span className="text-[10px] text-amber-600 font-bold">Pending distribution</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Platform Accounts</p>
              <h3 className="text-2xl font-display font-black text-slate-900">
                {stats.totalUsers}
              </h3>
              <span className="text-[10px] text-purple-600 font-bold">
                {stats.totalVendors} Vendors • {stats.totalCustomers} Buyers
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'vendors'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Vendor Partners & Rates ({vendorUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Master Orders & Payout Escrow ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Users ({users.length})
        </button>
      </div>

      {/* TAB 1: Vendors & Commission Rate Configuration */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 pl-6">Vendor Store</th>
                <th className="p-4">Owner Email</th>
                <th className="p-4">Commission Take</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendorUsers.map((v) => (
                <tr key={v._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <img
                      src={v.vendorDetails?.storeLogo || v.avatar}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900">
                        {v.vendorDetails?.storeName || v.name}
                      </p>
                      <p className="text-[11px] text-slate-400">{v.name}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{v.email}</td>
                  <td className="p-4">
                    {editingVendorId === v._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newCommissionRate}
                          onChange={(e) => setNewCommissionRate(e.target.value)}
                          className="w-16 p-1 border rounded-lg text-xs"
                          placeholder="%"
                        />
                        <button
                          onClick={() => handleUpdateCommission(v._id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingVendorId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg">
                        {v.vendorDetails?.commissionRate || 10}% Fee
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                      APPROVED
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {editingVendorId !== v._id && (
                      <button
                        onClick={() => {
                          setEditingVendorId(v._id);
                          setNewCommissionRate(v.vendorDetails?.commissionRate || 10);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Adjust Rate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Orders & Payouts Escrow */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="font-mono font-bold text-xs text-slate-900">
                    Order #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    Customer: {ord.customer?.name} ({ord.customer?.email})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span>Gross: {formatPrice(ord.totalPrice)}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                      ord.isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {ord.isPaid ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
              </div>

              {/* Vendor Payout Settlement Sub-cards */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Vendor Payout Calculations & Settlement
                </p>
                {ord.vendorPayouts.map((vp) => (
                  <div
                    key={vp._id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-purple-900">
                        {vp.vendor?.vendorDetails?.storeName || vp.vendor?.name || 'Vendor'}
                      </span>
                      <span className="text-slate-500 ml-2">
                        Gross: {formatPrice(vp.grossAmount)} | Fee ({vp.commissionRate}%):{' '}
                        {formatPrice(vp.platformFee)} |{' '}
                        <strong className="text-emerald-700">Net: {formatPrice(vp.netPayout)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          vp.payoutStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {vp.payoutStatus.toUpperCase()}
                      </span>

                      {vp.payoutStatus !== 'Paid' && ord.isPaid && (
                        <button
                          onClick={() => handleMarkPayoutPaid(ord._id, vp.vendor._id || vp.vendor)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                        >
                          Release Payout
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: All Users Table */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 pr-6">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <span className="font-bold text-slate-900">{u.name}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'Admin'
                          ? 'bg-amber-100 text-amber-800'
                          : u.role === 'Vendor'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
