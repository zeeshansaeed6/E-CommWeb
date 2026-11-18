import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { Truck } from 'lucide-react';
import { DashHeader, DashNav, useDashMotion } from '../../components/dashboard/DashKit';
import VendorOrdersPanel from '../../components/vendor/VendorOrdersPanel';
import { VENDOR_ACCENT, VENDOR_NAV } from '../../components/vendor/vendorNav';

const VendorOrdersPage = () => {
  const root = useRef(null);
  const { userInfo } = useSelector((state) => state.auth);
  useDashMotion(root);

  return (
    <div ref={root} className="max-w-7xl mx-auto space-y-8">
      <DashHeader
        kicker={userInfo?.vendorDetails?.storeName || 'Vendor hub'}
        icon={Truck}
        accent={VENDOR_ACCENT}
        title="Fulfilment."
        subtitle="Dispatch each split package, add couriers and tracking, and follow your payout."
      />
      <DashNav items={VENDOR_NAV} />
      <VendorOrdersPanel />
    </div>
  );
};

export default VendorOrdersPage;
