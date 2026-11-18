import React, { useRef } from 'react';
import { Users } from 'lucide-react';
import { DashHeader, DashNav, useDashMotion } from '../../components/dashboard/DashKit';
import AdminUsersPanel from '../../components/admin/AdminUsersPanel';
import { ADMIN_ACCENT, ADMIN_NAV } from '../../components/admin/adminNav';

const AdminUsersPage = () => {
  const root = useRef(null);
  useDashMotion(root);

  return (
    <div ref={root} className="max-w-7xl mx-auto space-y-8">
      <DashHeader
        kicker="Platform governance"
        icon={Users}
        accent={ADMIN_ACCENT}
        title="Directory."
        subtitle="Everyone on the marketplace: admins, vendors and customers."
      />
      <DashNav items={ADMIN_NAV} />
      <AdminUsersPanel />
    </div>
  );
};

export default AdminUsersPage;
