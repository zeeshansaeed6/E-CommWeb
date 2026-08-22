import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { getMyOrders } from '../redux/slices/orderSlice';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import useCurrency from '../hooks/useCurrency';

const OrderHistoryPage = () => {
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  if (loading) return <Loader message="Fetching your order history..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-900">My Orders & Tracking</h1>
        <p className="text-xs text-slate-500 mt-1">Track individual split deliveries across all vendors</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500">You haven't placed any marketplace orders yet.</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand-200 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      ord.isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {ord.isPaid ? 'PAID' : 'UNPAID'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {ord.overallFulfillmentStatus || 'Unfulfilled'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.orderItems.length} item(s)
                </p>
                <div className="flex items-center gap-2 overflow-hidden pt-1">
                  {ord.orderItems.slice(0, 4).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-slate-100 bg-slate-50"
                    />
                  ))}
                  {ord.orderItems.length > 4 && (
                    <span className="text-xs font-bold text-slate-400">
                      +{ord.orderItems.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-xs text-slate-400 block">Total Amount</span>
                  <span className="text-lg font-display font-extrabold text-slate-900">
                    {formatPrice(ord.totalPrice)}
                  </span>
                </div>

                <Link
                  to={`/orders/${ord._id}`}
                  className="px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  View Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
