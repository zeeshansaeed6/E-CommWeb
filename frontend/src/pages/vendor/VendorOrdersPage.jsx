import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  LayoutDashboard,
  Package,
  Store,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import SplitOrderStatusBadge from '../../components/order/SplitOrderStatusBadge';
import useCurrency from '../../hooks/useCurrency';

const VendorOrdersPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { formatPrice } = useCurrency();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status update modal / inline tracking state
  const [updatingId, setUpdatingId] = useState(null);
  const [trackingData, setTrackingData] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axiosClient.get('/orders/vendor/myorders');
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vendor orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateFulfillment = async (orderId, itemId, newStatus) => {
    try {
      setUpdatingId(`${orderId}-${itemId}`);
      setError('');
      setSuccessMsg('');

      const trackingNumber = trackingData[`${orderId}-${itemId}-tracking`] || '';
      const carrier = trackingData[`${orderId}-${itemId}-carrier`] || '';

      await axiosClient.put(`/orders/${orderId}/items/${itemId}/fulfillment`, {
        fulfillmentStatus: newStatus,
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
      });

      setSuccessMsg(`Fulfillment status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update fulfillment state');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTrackingInput = (key, val) => {
    setTrackingData((prev) => ({ ...prev, [key]: val }));
  };

  // Filter vendor orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const hasMatchingStatus = statusFilter
      ? o.orderItems?.some(
          (item) =>
            item.vendor?._id === userInfo?._id || item.vendor === userInfo?._id
              ? item.fulfillmentStatus?.toLowerCase() === statusFilter.toLowerCase()
              : false
        )
      : true;

    return matchesSearch && hasMatchingStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            <span>{userInfo?.storeName || 'Vendor Portal'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fulfillment & Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage item-level split dispatches, couriers, tracking IDs, and escrow settlement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/vendor/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/vendor/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <Package className="w-4 h-4" />
            <span>Catalog</span>
          </Link>
        </div>
      </div>

      {successMsg && <Alert type="success" message={successMsg} />}
      {error && <Alert type="error" message={error} />}

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
        >
          <option value="">All Fulfillment Statuses</option>
          <option value="pending">Pending Fulfillment</option>
          <option value="processing">Processing / Packing</option>
          <option value="shipped">Dispatched & Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Stream */}
      {loading ? (
        <Loader message="Loading assigned orders..." />
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter ? 'No orders match your active search filters.' : 'You have no customer orders requiring fulfillment at this time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            // Find items belonging to this vendor
            const vendorItems = order.orderItems?.filter(
              (item) =>
                (item.vendor?._id || item.vendor) === userInfo?._id ||
                item.vendor?.toString() === userInfo?._id?.toString()
            ) || [];

            // Vendor financials for this order
            const vendorSubtotal = vendorItems.reduce((acc, item) => acc + item.qty * item.price, 0);
            const vendorEscrow = order.vendorPayouts?.find(
              (vp) => (vp.vendor?._id || vp.vendor)?.toString() === userInfo?._id?.toString()
            );

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6"
              >
                {/* Order Meta Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-900">
                        Order #{order._id.substring(0, 10)}...
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          order.isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} by{' '}
                      <strong>{order.user?.name || 'Customer'}</strong> ({order.user?.email || 'N/A'})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Your Package Escrow</span>
                    <span className="text-lg font-extrabold text-emerald-600">
                      {formatPrice(vendorEscrow ? vendorEscrow.netPayout : vendorSubtotal * 0.9)}
                    </span>
                  </div>
                </div>

                {/* Vendor Items & Status Controls */}
                <div className="space-y-4">
                  {vendorItems.map((item) => {
                    const itemKey = `${order._id}-${item._id}`;
                    const isBusy = updatingId === itemKey;

                    return (
                      <div
                        key={item._id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 truncate">{item.title}</h4>
                            <p className="text-xs text-slate-500">
                              Qty: {item.qty} × {formatPrice(item.price)} = {formatPrice(item.qty * item.price)}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <SplitOrderStatusBadge status={item.fulfillmentStatus || 'Pending'} />
                            </div>
                          </div>
                        </div>

                        {/* Fulfillment Action Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                          <input
                            type="text"
                            placeholder="Courier (e.g. FedEx)"
                            defaultValue={item.carrier || ''}
                            onChange={(e) => handleTrackingInput(`${itemKey}-carrier`, e.target.value)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          <input
                            type="text"
                            placeholder="Tracking #"
                            defaultValue={item.trackingNumber || ''}
                            onChange={(e) => handleTrackingInput(`${itemKey}-tracking`, e.target.value)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          <select
                            value={item.fulfillmentStatus || 'Pending'}
                            onChange={(e) => handleUpdateFulfillment(order._id, item._id, e.target.value)}
                            disabled={isBusy}
                            className="px-3 py-1.5 bg-brand-600 text-white font-bold rounded-xl text-xs focus:outline-none hover:bg-brand-700 transition disabled:opacity-50"
                          >
                            <option value="Pending" className="text-slate-900 bg-white">Pending</option>
                            <option value="Processing" className="text-slate-900 bg-white">Processing</option>
                            <option value="Shipped" className="text-slate-900 bg-white">Shipped</option>
                            <option value="Delivered" className="text-slate-900 bg-white">Delivered</option>
                            <option value="Cancelled" className="text-slate-900 bg-white">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Shipping Destination */}
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800">Ship To: </span>
                    {order.shippingAddress?.address}, {order.shippingAddress?.city},{' '}
                    {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                  </div>
                  <Link
                    to={`/orders/${order._id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>View Customer Receipt</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorOrdersPage;
