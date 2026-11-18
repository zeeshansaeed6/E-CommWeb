import React, { useCallback, useEffect, useState } from 'react';
import { Check, Store, X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { toast } from '../../lib/toast';
import { DASH_INPUT, EmptyState, Panel, Pill, TH } from '../dashboard/DashKit';

const FALLBACK_LOGO = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=120&q=80';

/** Vendor partners: approval and commission. Uses GET /admin/users and PATCH /admin/vendors/:id. */
const AdminVendorsPanel = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [rate, setRate] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await axiosClient.get('/admin/users');
      setVendors(data.users.filter((u) => u.role === 'Vendor'));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id, body, message) => {
    try {
      await axiosClient.patch(`/admin/vendors/${id}`, body);
      toast(message);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update vendor');
    }
  };

  // A button click doesn't trigger the input's min/max, so validate here (the API enforces it too)
  const saveRate = (id) => {
    const value = Number(rate);
    if (rate === '' || !Number.isFinite(value) || value < 0 || value > 100) {
      setError('Commission must be a number between 0 and 100.');
      return;
    }
    patch(id, { commissionRate: value }, 'Commission updated');
  };

  if (loading) return <Loader message="Loading vendor partners..." />;

  return (
    <div className="space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Panel>
        {vendors.length === 0 ? (
          <EmptyState icon={Store} title="No vendors yet." text="Vendor stores appear here once they register." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className={TH}>Store</th>
                  <th className={TH}>Commission</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((v) => {
                  const approved = v.vendorDetails?.isApproved !== false;
                  const current = v.vendorDetails?.commissionRate ?? 10;
                  const editing = editingId === v._id;
                  return (
                    <tr key={v._id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={v.vendorDetails?.storeLogo || v.avatar || FALLBACK_LOGO} alt="" className="h-12 w-12 rounded-2xl bg-slate-100 object-cover" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{v.vendorDetails?.storeName || v.name}</p>
                            <p className="truncate text-xs text-slate-500">{v.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editing ? (
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" max="100" value={rate} onChange={(e) => setRate(e.target.value)} aria-label="Commission rate percent" className={`${DASH_INPUT} !w-24 !py-2`} />
                            <span className="text-slate-500">%</span>
                            <button onClick={() => saveRate(v._id)} aria-label="Save commission" className="rounded-full bg-emerald-600 p-2 text-white transition hover:bg-emerald-700"><Check className="h-4 w-4" /></button>
                            <button onClick={() => setEditingId(null)} aria-label="Cancel" className="rounded-full p-2 text-slate-400 ring-1 ring-slate-200 transition hover:bg-slate-50"><X className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <div className="w-40">
                            <p className="font-semibold text-slate-900">{current}% fee</p>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                              <span className="block h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, current * 2)}%` }} />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4"><Pill tone={approved ? 'success' : 'warn'}>{approved ? 'Approved' : 'Suspended'}</Pill></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!editing && (
                            <button onClick={() => { setEditingId(v._id); setRate(String(current)); }} className="rounded-full px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">Adjust rate</button>
                          )}
                          <button
                            onClick={() => patch(v._id, { isApproved: !approved }, approved ? 'Vendor suspended' : 'Vendor approved')}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${approved ? 'text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                          >
                            {approved ? 'Suspend' : 'Approve'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default AdminVendorsPanel;
