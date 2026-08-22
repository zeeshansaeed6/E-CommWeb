import React from 'react';
import { Store, DollarSign, Percent, ShieldCheck, Truck } from 'lucide-react';
import SplitOrderStatusBadge from './SplitOrderStatusBadge';
import useCurrency from '../../hooks/useCurrency';

const VendorOrderSummary = ({ 
  vendorName = 'Vendor Store', 
  items = [], 
  vendorTotal = 0, 
  commission = 0, 
  netPayout = 0, 
  payoutStatus = 'Escrow Pending',
  trackingNumber = '',
  carrier = '',
  onUpdateStatus,
  isVendorView = false
}) => {
  const { formatPrice } = useCurrency();

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{vendorName}</h4>
            <p className="text-xs text-slate-500">{items.length} {items.length === 1 ? 'item' : 'items'} in this package</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            Payout: {payoutStatus}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                alt={item.title || 'Product item'}
                className="w-14 h-14 object-cover rounded-xl border border-slate-200 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{item.title || item.name}</p>
                <p className="text-xs text-slate-500">Qty: {item.qty} × {formatPrice(item.price)}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm text-slate-900">{formatPrice(item.qty * item.price)}</p>
              <div className="mt-1">
                <SplitOrderStatusBadge status={item.fulfillmentStatus || 'Pending'} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tracking info if available */}
      {(trackingNumber || carrier) && (
        <div className="flex items-center gap-2 p-3 bg-brand-50/50 border border-brand-100 rounded-2xl text-xs text-brand-900">
          <Truck className="w-4 h-4 text-brand-600 flex-shrink-0" />
          <span className="font-medium">Carrier: <strong>{carrier || 'Standard'}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="font-medium">Tracking Code: <strong>{trackingNumber || 'Pending'}</strong></span>
        </div>
      )}

      {/* Financial Breakdown (if vendor view or admin) */}
      {(isVendorView || commission > 0) && (
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Subtotal</span>
            <span className="text-sm font-bold text-slate-900">{formatPrice(vendorTotal)}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Platform Take</span>
            <span className="text-sm font-bold text-rose-600">-{formatPrice(commission)}</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-medium text-emerald-700 block">Net Payout</span>
            <span className="text-sm font-bold text-emerald-700">{formatPrice(netPayout)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrderSummary;
