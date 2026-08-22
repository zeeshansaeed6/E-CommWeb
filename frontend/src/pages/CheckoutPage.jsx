import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Truck,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { saveShippingAddress, savePaymentMethod, clearCart } from '../redux/slices/cartSlice';
import { createOrder, initiateStripeCheckout } from '../redux/slices/orderSlice';
import Alert from '../components/common/Alert';
import Loader from '../components/common/Loader';
import useCurrency from '../hooks/useCurrency';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems, shippingAddress, itemsPrice, taxPrice, shippingPrice, totalPrice } =
    useSelector((state) => state.cart);
  const { loading: orderLoading, error: orderError } = useSelector((state) => state.order);

  const [street, setStreet] = useState(shippingAddress.street || userInfo?.address?.street || '');
  const [city, setCity] = useState(shippingAddress.city || userInfo?.address?.city || '');
  const [state, setState] = useState(shippingAddress.state || userInfo?.address?.state || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || userInfo?.address?.postalCode || ''
  );
  const [country, setCountry] = useState(
    shippingAddress.country || userInfo?.address?.country || 'United States'
  );
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/checkout');
    }
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [userInfo, cartItems, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!street || !city || !state || !postalCode || !country) {
      setLocalError('Please complete all shipping address fields');
      return;
    }

    const addressPayload = { street, city, state, postalCode, country };
    dispatch(saveShippingAddress(addressPayload));
    dispatch(savePaymentMethod(paymentMethod));

    setProcessing(true);

    try {
      // 1. Create Master Order in DB
      const orderResult = await dispatch(
        createOrder({
          orderItems: cartItems.map((item) => ({
            product: item._id,
            qty: item.qty,
            price: item.discountPrice > 0 ? item.discountPrice : item.price,
            image: item.image,
            title: item.title,
            vendor: item.vendor,
          })),
          shippingAddress: addressPayload,
          paymentMethod,
        })
      ).unwrap();

      // Clear local cart now that order is saved
      dispatch(clearCart());

      // 2. Initiate Stripe Checkout Session
      const stripeResult = await dispatch(initiateStripeCheckout(orderResult._id)).unwrap();

      if (stripeResult.url) {
        // Redirect to Stripe checkout (or simulated success URL)
        window.location.href = stripeResult.url;
      } else {
        navigate(`/orders/${orderResult._id}`);
      }
    } catch (err) {
      setLocalError(err || 'Failed to place order. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cart')}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900">Secure Checkout</h1>
          <p className="text-xs text-slate-500 mt-0.5">Complete your multi-vendor split fulfillment order</p>
        </div>
      </div>

      {(localError || orderError) && (
        <Alert type="error" message={localError || orderError} onClose={() => setLocalError('')} />
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Shipping & Payment Config */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 text-slate-900 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-brand-600" />
              <h2 className="font-display font-bold text-base">1. Shipping Address</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. San Francisco"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. CA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 94102"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 text-slate-900 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-brand-600" />
              <h2 className="font-display font-bold text-base">2. Payment Gateway</h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-2xl border-2 border-brand-500 bg-brand-50/40 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Stripe'}
                    onChange={() => setPaymentMethod('Stripe')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Stripe 3D-Secure (Card / Apple Pay / Google Pay)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Redirects to official Stripe Checkout session with instant webhook fulfillment
                    </span>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-brand-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Order Review & Placement Summary */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-display font-bold text-slate-900 border-b border-slate-100 pb-3">
            Review Split Fulfillment Items
          </h2>

          {/* Cart preview */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const currentPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
              return (
                <div key={item._id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">{item.title}</p>
                      <p className="text-slate-400">Qty: {item.qty} × {formatPrice(currentPrice)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatPrice(currentPrice * item.qty)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span className="font-semibold text-slate-900">{formatPrice(itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (5%)</span>
              <span className="font-semibold text-slate-900">{formatPrice(taxPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-semibold text-slate-900">
                {shippingPrice === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(shippingPrice)}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-display font-black text-slate-900">
              <span>Final Total</span>
              <span className="text-brand-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing || orderLoading}
            className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {processing || orderLoading ? (
              <span>Preparing Stripe Checkout...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay {formatPrice(totalPrice)} with Stripe
              </>
            )}
          </button>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[10px] text-slate-500 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Escrow protected. Vendors are paid only upon split dispatch.</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
