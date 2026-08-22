import React from 'react';
import { Clock, RefreshCw, Truck, CheckCircle2, XCircle } from 'lucide-react';

const SplitOrderStatusBadge = ({ status = 'Pending', className = '' }) => {
  const normalized = status.toLowerCase();

  const config = {
    pending: {
      label: 'Pending Fulfillment',
      icon: Clock,
      bg: 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10',
      dot: 'bg-amber-400',
    },
    processing: {
      label: 'Processing / Packing',
      icon: RefreshCw,
      bg: 'bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-500/10',
      dot: 'bg-blue-500 animate-pulse',
    },
    shipped: {
      label: 'Dispatched & Shipped',
      icon: Truck,
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-indigo-500/10',
      dot: 'bg-indigo-500',
    },
    delivered: {
      label: 'Delivered',
      icon: CheckCircle2,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      bg: 'bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10',
      dot: 'bg-rose-500',
    },
  };

  const current = config[normalized] || config.pending;
  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ring-1 ${current.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      <IconComponent className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </span>
  );
};

export default SplitOrderStatusBadge;
