import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Trash2 } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { clearWishlist } from '../redux/slices/wishlistSlice';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.wishlist.items);

  if (items.length === 0) {
    return (
      <div className="text-center py-24 animate-fade-up">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-display font-black text-slate-900">Your wishlist is empty</h1>
        <p className="mt-2 text-slate-500">Tap the heart on any product to save it for later.</p>
        <Link to="/" className="mt-8 inline-flex px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors">
          Discover products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900">Wishlist</h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.length} saved {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          onClick={() => dispatch(clearWishlist())}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Clear all
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
