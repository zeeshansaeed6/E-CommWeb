import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DollarSign, ShieldCheck, Store, TrendingUp, Users } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import useCurrency from '../../hooks/useCurrency';
import { DashHeader, DashNav, SegTabs, StatCard, useDashMotion } from '../../components/dashboard/DashKit';
import AdminVendorsPanel from '../../components/admin/AdminVendorsPanel';
import AdminPayoutsPanel from '../../components/admin/AdminPayoutsPanel';
import AdminUsersPanel from '../../components/admin/AdminUsersPanel';
import { ADMIN_ACCENT, ADMIN_NAV } from '../../components/admin/adminNav';

const AdminDashboardPage = () => {
  const root = useRef(null);
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('vendors');

  const loadStats = useCallback(async () => {
    try {
      const { data } = await axiosClient.get('/admin/stats');
      setStats(data.stats);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the platform console');
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useDashMotion(root, [stats === null]);

  if (!stats && !error) return <Loader message="Loading the control room..." />;

  return (
    <div ref={root} className="max-w-7xl mx-auto space-y-8">
      <DashHeader
        kicker="Platform governance"
        icon={ShieldCheck}
        accent={ADMIN_ACCENT}
        title="Control room."
        subtitle="Marketplace volume, platform revenue, vendor escrow and every account in one place."
      />
      <DashNav items={ADMIN_NAV} />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard dark label="Gross volume" value={formatPrice(stats.grossVolume)} hint="Paid orders" icon={TrendingUp} accent="#818cf8" />
          <StatCard label="Platform revenue" value={formatPrice(stats.totalPlatformRevenue)} hint="Commission earned" icon={DollarSign} accent="#10b981" />
          <StatCard label="Escrow payable" value={formatPrice(stats.totalVendorPayoutsOwed)} hint="Owed to vendors" icon={Store} accent={ADMIN_ACCENT} />
          <StatCard label="Accounts" value={stats.totalUsers} hint={`${stats.totalVendors} vendors · ${stats.totalCustomers} buyers`} icon={Users} accent="#a855f7" />
        </div>
      )}

      <SegTabs
        value={tab}
        onChange={setTab}
        tabs={[
          ['vendors', 'Vendors', stats?.totalVendors],
          ['escrow', 'Escrow'],
          ['users', 'Users', stats?.totalUsers],
        ]}
      />

      {tab === 'vendors' && <AdminVendorsPanel />}
      {tab === 'escrow' && <AdminPayoutsPanel onChange={loadStats} />}
      {tab === 'users' && <AdminUsersPanel />}
    </div>
  );
};

export default AdminDashboardPage;
