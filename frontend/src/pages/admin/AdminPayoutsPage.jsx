import React, { useRef } from 'react';
import { DollarSign } from 'lucide-react';
import { DashHeader, DashNav, useDashMotion } from '../../components/dashboard/DashKit';
import AdminPayoutsPanel from '../../components/admin/AdminPayoutsPanel';
import { ADMIN_ACCENT, ADMIN_NAV } from '../../components/admin/adminNav';

const AdminPayoutsPage = () => {
  const root = useRef(null);
  useDashMotion(root);

  return (
    <div ref={root} className="max-w-7xl mx-auto space-y-8">
      <DashHeader
        kicker="Financial settlement"
        icon={DollarSign}
        accent={ADMIN_ACCENT}
        title="Escrow."
        subtitle="Audit every vendor package and release net earnings once it has shipped."
      />
      <DashNav items={ADMIN_NAV} />
      <AdminPayoutsPanel showMetrics />
    </div>
  );
};

export default AdminPayoutsPage;
