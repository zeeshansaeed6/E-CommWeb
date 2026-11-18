import React, { useEffect, useMemo, useState } from 'react';
import { Shield, Store, Users } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { DASH_INPUT, EmptyState, Panel, Pill, SearchField, TH } from '../dashboard/DashKit';

const ROLE_TONE = { Admin: 'warn', Vendor: 'info', Customer: 'neutral' };

/** Read-only user directory. The API exposes listing only (GET /admin/users); vendor changes live in the Vendors tab. */
const AdminUsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    let alive = true;
    axiosClient
      .get('/admin/users')
      .then(({ data }) => alive && setUsers(data.users))
      .catch((err) => alive && setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!term || u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term) || u.vendorDetails?.storeName?.toLowerCase().includes(term)) &&
        (!role || u.role === role)
    );
  }, [users, search, role]);

  if (loading) return <Loader message="Loading registered users..." />;

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="dk-panel flex flex-col gap-3 sm:flex-row">
        <SearchField value={search} onChange={setSearch} placeholder="Search by name, email or store" />
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role" className={`${DASH_INPUT} sm:w-56`}>
          <option value="">All roles</option>
          <option value="Admin">Admins</option>
          <option value="Vendor">Vendors</option>
          <option value="Customer">Customers</option>
        </select>
      </div>

      <Panel>
        {visible.length === 0 ? (
          <EmptyState icon={Users} title="No users found." text="Nobody matches your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className={TH}>User</th>
                  <th className={TH}>Role</th>
                  <th className={TH}>Store</th>
                  <th className={TH}>Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((u) => (
                  <tr key={u._id} className="transition hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="h-11 w-11 rounded-full bg-slate-100 object-cover" />
                        ) : (
                          <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-900 font-semibold text-white">{u.name?.[0]?.toUpperCase() || 'U'}</span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{u.name}</p>
                          <p className="truncate text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Pill tone={ROLE_TONE[u.role]}>
                        {u.role === 'Admin' && <Shield className="h-3 w-3" />}
                        {u.role === 'Vendor' && <Store className="h-3 w-3" />}
                        {u.role}
                      </Pill>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {u.role === 'Vendor' ? (
                        <>
                          <p className="font-semibold text-slate-900">{u.vendorDetails?.storeName || 'Unnamed store'}</p>
                          <p className="text-xs">{u.vendorDetails?.commissionRate ?? 10}% platform fee</p>
                        </>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
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

export default AdminUsersPanel;
