import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  Store,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  getOrderDetails,
  initiateStripeCheckout,
  simulatePayment,
} from '../redux/slices/orderSlice';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import SplitOrderStatusBadge from '../components/order/SplitOrderStatusBadge';
import useCurrency from '../hooks/useCurrency';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();

  const { order, loading, error } = useSelector((state) => state.order);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getOrderDetails(id));
  }, [dispatch, id]);

  const handlePayStripe = async () => {
    const res = await dispatch(initiateStripeCheckout(order._id)).unwrap();
    if (res.url) {
      window.location.href = res.url;
    }
  };

  const handleSimulatePay = () => {
    dispatch(simulatePayment(order._id));
  };

  if (loading) return <Loader message="Fetching order breakdown..." />;
  if (error) return <Alert type="error" message={error} />;
  if (!order) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-black text-slate-900">
              Order #{order._id.substring(order._id.length - 8).toUpperCase()}
            </h1>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                order.isPaid
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {order.isPaid ? 'PAID' : 'PAYMENT PENDING'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Overall Status:</span>
          <span className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-xl text-xs font-extrabold">
            {order.overallFulfillmentStatus || 'Unfulfilled'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Split Order Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-display font-bold text-slate-900">
                  Split Vendor Items & Live Tracking
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {order.orderItems.length} line item(s)
              </span>
            </div>

            <div className="space-y-6">
              {order.orderItems.map((item) => (
                <div
                  key={item._id}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Item info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0 bg-white"
                      />
                      <div>
                        <Link
                          to={`/product/${item.product}`}
                          className="text-sm font-bold text-slate-900 hover:text-brand-600 line-clamp-1 transition-colors"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Qty: <strong className="text-slate-800">{item.qty}</strong> ×{' '}
                          {formatPrice(item.price)} ={' '}
                          <strong className="text-slate-900">
                            {formatPrice(item.qty * item.price)}
                          </strong>
                        </p>
                      </div>
                    </div>

                    {/* Fulfillment Chip */}
                    <div>
                      <SplitOrderStatusBadge status={item.fulfillmentStatus} />
                    </div>
                  </div>

                  {/* Vendor & Shipping Details */}
                  <div className="pt-3 border-t border-slate-200/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-purple-700 font-semibold">
                      <Store className="w-3.5 h-3.5" />
                      <span>
                        Fulfillment Partner:{' '}
                        <strong>
                          {item.vendor?.vendorDetails?.storeName || item.vendor?.name || 'Vendor'}
                        </strong>
                      </span>
                    </div>

                    {item.trackingNumber ? (
                      <div className="flex items-center gap-2 text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/50">
                        <Truck className="w-3.5 h-3.5" />
                        <span>
                          {item.carrier || 'Carrier'}: <strong>{item.trackingNumber}</strong>
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">
                        Tracking number will be assigned upon dispatch
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Payment & Shipping Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Unpaid Action CTA */}
          {!order.isPaid && (
            <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-6 text-white space-y-4 shadow-glow">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CreditCard className="w-5 h-5 text-brand-200" />
                <span>Payment Outstanding</span>
              </div>
              <p className="text-xs text-brand-100 leading-relaxed">
                Complete your checkout securely with Stripe to instantly dispatch individual split
                orders to vendors.
              </p>

              <button
                onClick={handlePayStripe}
                className="w-full py-3 rounded-2xl bg-white hover:bg-brand-50 text-brand-700 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Pay {formatPrice(order.totalPrice)} Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleSimulatePay}
                className="w-full py-2.5 rounded-xl bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 transition-colors"
              >
                [Dev Test] Simulate Instant Stripe Webhook
              </button>
            </div>
          )}

          {/* Shipping Address Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Delivery Destination</span>
            </div>
            <p className="font-semibold text-slate-800">{order.customer?.name}</p>
            <p className="text-slate-600">{order.shippingAddress?.street}</p>
            <p className="text-slate-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.postalCode}
            </p>
            <p className="text-slate-600">{order.shippingAddress?.country}</p>
          </div>

          {/* Cost breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Financial Summary
            </h3>
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (5%)</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.taxPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-display font-extrabold text-slate-900">
              <span>Total Paid</span>
              <span className="text-brand-600">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
