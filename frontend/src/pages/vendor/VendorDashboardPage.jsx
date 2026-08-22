import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Clock,
  Plus,
  Trash2,
  Edit,
  Truck,
  CheckCircle,
  ExternalLink,
  Store,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import useCurrency from '../../hooks/useCurrency';

const CATEGORIES = [
  'Electronics',
  'Fashion & Apparel',
  'Home & Kitchen',
  'Beauty & Health',
  'Sports & Outdoors',
  'Books & Stationery',
  'Toys & Games',
  'Automotive',
  'Other',
];

const VendorDashboardPage = () => {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Add/Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Fulfillment update inputs map (keyed by item _id)
  const [fulfillmentInputs, setFulfillmentInputs] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, prodRes, ordersRes] = await Promise.all([
        axiosClient.get('/vendors/stats'),
        axiosClient.get('/vendors/products'),
        axiosClient.get('/orders/vendor-orders'),
      ]);

      setStats(statsRes.data.stats);
      setProducts(prodRes.data.products);
      setOrders(ordersRes.data.orders);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendor dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Product Form Submit
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formTitle,
        description: formDesc,
        category: formCategory,
        price: Number(formPrice),
        discountPrice: formDiscountPrice ? Number(formDiscountPrice) : 0,
        stock: Number(formStock),
        images: formImageUrl ? [{ url: formImageUrl }] : undefined,
      };

      if (modalMode === 'create') {
        await axiosClient.post('/products', payload);
        setSuccess('Product listed successfully!');
      } else {
        await axiosClient.put(`/products/${editingId}`, payload);
        setSuccess('Product updated successfully!');
      }

      setIsModalOpen(false);
      resetModalForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleOpenEdit = (prod) => {
    setModalMode('edit');
    setEditingId(prod._id);
    setFormTitle(prod.title);
    setFormDesc(prod.description);
    setFormCategory(prod.category);
    setFormPrice(prod.price);
    setFormDiscountPrice(prod.discountPrice || '');
    setFormStock(prod.stock);
    setFormImageUrl(prod.images?.[0]?.url || '');
    setIsModalOpen(true);
  };

  const resetModalForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormCategory('Electronics');
    setFormPrice('');
    setFormDiscountPrice('');
    setFormStock('');
    setFormImageUrl('');
    setEditingId(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      setSuccess('Product deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Update Item Fulfillment
  const handleUpdateFulfillment = async (orderId, itemId, newStatus) => {
    try {
      const inputs = fulfillmentInputs[itemId] || {};
      await axiosClient.patch(`/orders/${orderId}/items/${itemId}/fulfillment`, {
        status: newStatus,
        trackingNumber: inputs.trackingNumber,
        carrier: inputs.carrier,
      });

      setSuccess(`Item status changed to ${newStatus}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item status');
    }
  };

  const handleInputChange = (itemId, field, value) => {
    setFulfillmentInputs((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  if (loading) return <Loader message="Loading Vendor Operations Hub..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-2">
            <Store className="w-3.5 h-3.5" />
            Vendor Fulfillment & Escrow Hub
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900">
            Vendor Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your store inventory, track split order dispatches, and monitor net earnings
          </p>
        </div>

        <button
          onClick={() => {
            setModalMode('create');
            resetModalForm();
            setIsModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-glow flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Net Settled Earnings</p>
              <h3 className="text-2xl font-display font-black text-slate-900">
                {formatPrice(stats.totalEarnings)}
              </h3>
              <span className="text-[10px] text-emerald-600 font-bold">
                Platform Cut: {stats.commissionRate}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Pending Escrow Payouts</p>
              <h3 className="text-2xl font-display font-black text-slate-900">
                {formatPrice(stats.pendingPayouts)}
              </h3>
              <span className="text-[10px] text-amber-600 font-bold">Upon split delivery</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Active Inventory</p>
              <h3 className="text-2xl font-display font-black text-slate-900">
                {stats.totalProducts}
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Catalog items</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Split Orders</p>
              <h3 className="text-2xl font-display font-black text-slate-900">
                {stats.totalOrders}
              </h3>
              <span className="text-[10px] text-blue-600 font-bold">Fulfilled & pending</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Split Order Items ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Product Catalog ({products.length})
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No orders received yet</h3>
              <p className="text-xs text-slate-500">
                Customer purchases involving your products will appear here.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        Order #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          ord.isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.isPaid ? 'PAID' : 'PAYMENT PENDING'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Customer: <strong>{ord.customer?.name}</strong> •{' '}
                      {ord.shippingAddress?.street}, {ord.shippingAddress?.city},{' '}
                      {ord.shippingAddress?.state} {ord.shippingAddress?.postalCode}
                    </p>
                  </div>

                  {ord.vendorPayout && (
                    <div className="sm:text-right">
                      <span className="text-xs text-slate-400 block">Your Net Split Payout</span>
                      <span className="text-lg font-display font-black text-emerald-600">
                        {formatPrice(ord.vendorPayout.netPayout)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Gross: {formatPrice(ord.vendorPayout.grossAmount)} - Fee:{' '}
                        {formatPrice(ord.vendorPayout.platformFee)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Items to Fulfill */}
                <div className="space-y-4">
                  {ord.vendorItems.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            Qty: <strong className="text-slate-800">{item.qty}</strong> ×{' '}
                            {formatPrice(item.price)}
                          </p>
                          <span className="text-[11px] font-bold text-brand-600 mt-0.5 inline-block">
                            Current: {item.fulfillmentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Fulfillment Action Controls */}
                      <div className="flex flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
                        <input
                          type="text"
                          placeholder="Carrier (e.g. FedEx)"
                          defaultValue={item.carrier}
                          onChange={(e) =>
                            handleInputChange(item._id, 'carrier', e.target.value)
                          }
                          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs w-28"
                        />
                        <input
                          type="text"
                          placeholder="Tracking #"
                          defaultValue={item.trackingNumber}
                          onChange={(e) =>
                            handleInputChange(item._id, 'trackingNumber', e.target.value)
                          }
                          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs w-36"
                        />

                        <select
                          value={item.fulfillmentStatus}
                          onChange={(e) =>
                            handleUpdateFulfillment(ord._id, item._id, e.target.value)
                          }
                          className="px-3 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Mark as Shipped</option>
                          <option value="Delivered">Mark as Delivered</option>
                          <option value="Cancelled">Cancel Item</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Product Inventory Table */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 pl-6">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                        <p className="text-slate-400 text-[11px]">{p.brand}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{p.category}</td>
                    <td className="p-4 font-display font-bold text-slate-900">
                      {formatPrice(p.discountPrice > 0 ? p.discountPrice : p.price)}
                      {p.discountPrice > 0 && (
                        <span className="text-[10px] text-slate-400 line-through block">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full ${
                          p.stock > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="p-4 font-bold text-amber-500">★ {p.rating.toFixed(1)}</td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-display font-bold text-slate-900">
                {modalMode === 'create' ? 'List New Product' : 'Edit Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Wireless Pro Earbuds"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="99.99"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Discount Price ($) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    placeholder="79.99"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe technical specs, materials, and features..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm"
                >
                  {modalMode === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboardPage;
