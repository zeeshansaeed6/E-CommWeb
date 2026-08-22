import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, Store, ShieldCheck } from 'lucide-react';
import { addToCart, removeFromCart } from '../redux/slices/cartSlice';
import useCurrency from '../hooks/useCurrency';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const { cartItems, itemsPrice, taxPrice, shippingPrice, totalPrice } = useSelector(
    (state) => state.cart
  );

  const handleQtyChange = (item, newQty) => {
    if (newQty < 1 || newQty > item.stock) return;
    dispatch(
      addToCart({
        ...item,
        qty: newQty,
      })
    );
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleProceedCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Explore independent vendor stores and add items to your cart to get started.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-glow transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            {cartItems.reduce((acc, item) => acc + item.qty, 0)} total item(s) selected
          </p>
        </div>
        <Link to="/" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Line Items */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => {
            const currentPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-brand-200 transition-colors"
              >
                {/* Product info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded-2xl object-cover bg-slate-100 border border-slate-100 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      to={`/product/${item._id}`}
                      className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-display font-extrabold text-slate-900">
                        {formatPrice(currentPrice)}
                      </span>
                      {item.discountPrice > 0 && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                    <button
                      onClick={() => handleQtyChange(item, item.qty - 1)}
                      className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg transition-colors text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">{item.qty}</span>
                    <button
                      onClick={() => handleQtyChange(item, item.qty + 1)}
                      className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg transition-colors text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="text-sm font-display font-bold text-slate-900 w-24 text-right">
                    {formatPrice(currentPrice * item.qty)}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-lg font-display font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900">{formatPrice(itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (5%)</span>
              <span className="font-semibold text-slate-900">{formatPrice(taxPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-semibold text-slate-900">
                {shippingPrice === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  formatPrice(shippingPrice)
                )}
              </span>
            </div>
            {shippingPrice > 0 && itemsPrice < 100 && (
              <p className="text-[10px] text-brand-600 italic">
                Add {formatPrice(100 - itemsPrice)} more for FREE shipping!
              </p>
            )}
            <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-display font-extrabold text-slate-900">
              <span>Total</span>
              <span className="text-brand-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <button
            onClick={handleProceedCheckout}
            className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-[11px] text-slate-500">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Secured with 256-bit encryption & Stripe Escrow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
