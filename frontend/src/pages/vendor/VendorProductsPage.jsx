import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Package, Plus } from 'lucide-react';
import { DashHeader, DashNav, PrimaryButton, useDashMotion } from '../../components/dashboard/DashKit';
import VendorCatalogPanel from '../../components/vendor/VendorCatalogPanel';
import { VENDOR_ACCENT, VENDOR_NAV } from '../../components/vendor/vendorNav';

const VendorProductsPage = () => {
  const root = useRef(null);
  const { userInfo } = useSelector((state) => state.auth);
  const [createSignal, setCreateSignal] = useState(0);
  useDashMotion(root);

  return (
    <div ref={root} className="max-w-7xl mx-auto space-y-8">
      <DashHeader
        kicker={userInfo?.vendorDetails?.storeName || 'Vendor hub'}
        icon={Package}
        accent={VENDOR_ACCENT}
        title="Catalogue."
        subtitle="Every listing gets its own storefront page, styled by its category."
        actions={
          <PrimaryButton onClick={() => setCreateSignal((n) => n + 1)}>
            <Plus className="h-4 w-4" /> Add product
          </PrimaryButton>
        }
      />
      <DashNav items={VENDOR_NAV} />
      <VendorCatalogPanel createSignal={createSignal} />
    </div>
  );
};

export default VendorProductsPage;
