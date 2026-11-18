import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, DollarSign, Package, Plus, ShoppingBag, Store } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import useCurrency from '../../hooks/useCurrency';
import { DashHeader, DashNav, PrimaryButton, SegTabs, StatCard, useDashMotion } from '../../components/dashboard/DashKit';
import VendorOrdersPanel from '../../components/vendor/VendorOrdersPanel';
import VendorCatalogPanel from '../../components/vendor/VendorCatalogPanel';
import { VENDOR_ACCENT, VENDOR_NAV } from '../../components/vendor/vendorNav';

const VendorDashboardPage = () => {
  const root = useRef(null);
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('orders');
  const [createSignal, setCreateSignal] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await axiosClient.get('/vendors/stats');
      setStats(data.stats);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendor dashboard');
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useDashMotion(root, [stats === null]);

  if (!stats && !error) return <Loader message="Loading your store..." />;

  return (
    <div ref={root} className="max-w-7xl mx-auto space-y-8">
      <DashHeader
        kicker="Vendor hub"
        icon={Store}
        accent={VENDOR_ACCENT}
        title="Your store."
        subtitle="Fulfil split orders, manage inventory and watch your net earnings."
        actions={
          <PrimaryButton
            onClick={() => {
              setTab('products');
              setCreateSignal((n) => n + 1);
            }}
          >
            <Plus className="h-4 w-4" /> Add product
          </PrimaryButton>
        }
      />
      <DashNav items={VENDOR_NAV} />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard dark label="Net earnings" value={formatPrice(stats.totalEarnings)} hint={`Platform fee ${stats.commissionRate}%`} icon={DollarSign} accent="#34d399" />
          <StatCard label="Pending escrow" value={formatPrice(stats.pendingPayouts)} hint="Released after delivery" icon={Clock} accent="#f59e0b" />
          <StatCard label="Active products" value={stats.totalProducts} hint="In your catalogue" icon={Package} accent={VENDOR_ACCENT} />
          <StatCard label="Split orders" value={stats.totalOrders} hint={`${stats.pendingOrders} to fulfil · ${stats.completedOrders} done`} icon={ShoppingBag} accent="#a855f7" />
        </div>
      )}

      <SegTabs
        value={tab}
        onChange={setTab}
        tabs={[
          ['orders', 'Split orders', stats?.totalOrders],
          ['products', 'Catalogue', stats?.totalProducts],
        ]}
      />

      {tab === 'orders' ? <VendorOrdersPanel onChange={loadStats} /> : <VendorCatalogPanel onChange={loadStats} createSignal={createSignal} />}
    </div>
  );
};

export default VendorDashboardPage;
