import React from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, ShieldCheck } from 'lucide-react';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { sessionId } = useParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="max-w-2xl mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
          Payment Confirmed
        </span>
        <h1 className="text-3xl font-display font-extrabold text-slate-900">
          Thank you for your order!
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Your payment was processed securely via Stripe. Vendors have been notified and will independently prepare and dispatch your split packages.
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 space-y-1.5 text-left">
        {orderId && (
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Order ID:</span>
            <span className="font-mono font-bold text-slate-900">{orderId}</span>
          </div>
        )}
        {sessionId && (
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Stripe Session:</span>
            <span className="font-mono text-slate-700 truncate max-w-xs">{sessionId}</span>
          </div>
        )}
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        {orderId && (
          <Link
            to={`/orders/${orderId}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
          >
            <Package className="w-4 h-4" />
            Track Split Order Items
          </Link>
        )}
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
