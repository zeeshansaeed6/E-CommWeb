import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Store, Check, Heart } from 'lucide-react';
import Rating from '../common/Rating';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { toast } from '../../lib/toast';
import useCurrency from '../../hooks/useCurrency';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const [added, setAdded] = React.useState(false);
  const wished = useSelector((state) => state.wishlist.items.some((x) => x._id === product._id));

  const mainImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const discountPercent =
    product.discountPrice > 0
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(
      addToCart({
        _id: product._id,
        title: product.title,
        price: product.price,
        discountPrice: product.discountPrice,
        image: mainImage,
        stock: product.stock,
        vendor: product.vendor?._id || product.vendor,
        qty: 1,
      })
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    toast(`Added “${product.title}” to your cart`);
  };

  return (
    <div className="group relative h-full bg-white rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-2xl hover:shadow-brand-900/10 hover:border-brand-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
          <Link to={`/product/${product._id}`}>
            <img
              src={mainImage}
              alt={product.title}
              className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </Link>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
              -{discountPercent}% OFF
            </span>
          )}

          {/* Wishlist heart */}
          <button
            onClick={(e) => {
              e.preventDefault();
              dispatch(toggleWishlist(product));
              toast(wished ? 'Removed from wishlist' : 'Saved to your wishlist', 'wish');
            }}
            aria-pressed={wished}
            aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-md hover:scale-110 active:scale-90 transition-transform"
          >
            <Heart className={`w-4 h-4 transition-colors ${wished ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
          </button>

          {/* Category Chip */}
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Content Details */}
        <div className="p-5">
          {/* Vendor Identifier */}
          <div className="flex items-center gap-1.5 text-xs text-brand-700 font-semibold mb-1.5">
            <Store className="w-3.5 h-3.5" />
            <span className="truncate">
              {product.vendor?.vendorDetails?.storeName || product.vendor?.name || 'Verified Partner'}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product._id}`}>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[2.5rem] leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-2.5">
            <Rating value={product.rating} text={`${product.numReviews}`} />
          </div>
        </div>
      </div>

      {/* Footer: Pricing & Add to Cart */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-50 mt-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-display font-extrabold text-slate-900">
              {formatPrice(currentPrice)}
            </span>
            {product.discountPrice > 0 && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold block ${product.stock === 0 ? 'text-rose-600' : product.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`p-2.5 rounded-2xl flex items-center justify-center transition-all ${
            added
              ? 'bg-emerald-600 text-white shadow-glow-emerald scale-95'
              : product.stock === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-glow active:scale-95'
          }`}
          title="Add to Cart" aria-label={`Add ${product.title} to cart`}
        >
          {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
