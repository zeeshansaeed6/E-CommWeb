import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShieldCheck,
  Truck,
  Store,
  Check,
  ShoppingCart,
  Star,
  Package,
  RotateCcw,
} from 'lucide-react';
import {
  fetchProductDetails,
  createProductReview,
  resetProductDetails,
} from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import LuxuryProductPage from '../components/product/LuxuryProductPage';
import EditorialProductPage from '../components/product/themes/EditorialProductPage';
import EnergyProductPage from '../components/product/themes/EnergyProductPage';
import SoftProductPage from '../components/product/themes/SoftProductPage';
import CozyProductPage from '../components/product/themes/CozyProductPage';
import { themeFor } from '../components/product/themes/productTheme';
import TechProductPage from '../components/product/themes/TechProductPage';
import Rating from '../components/common/Rating';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import useCurrency from '../hooks/useCurrency';
import { toast } from '../lib/toast';
import RecentlyViewed from '../components/product/RecentlyViewed';
import { recordRecentlyViewed } from '../hooks/useRecentlyViewed';

// Themes with their own page experience; anything else uses the cinematic tech layout below
const THEME_PAGES = {
  luxury: LuxuryProductPage,
  editorial: EditorialProductPage,
  energy: EnergyProductPage,
  soft: SoftProductPage,
  cozy: CozyProductPage,
  tech: TechProductPage,
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();

  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedAlert, setAddedAlert] = useState(false);

  // Review Form state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');

  const { product, loading, error, reviewSuccess } = useSelector((state) => state.products);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProductDetails(id));

    return () => {
      dispatch(resetProductDetails());
    };
  }, [dispatch, id, reviewSuccess]);

  useEffect(() => {
    if (product?._id === id) recordRecentlyViewed(product);
  }, [product, id]);

  const handleAddToCart = (forcedQty) => {
    if (!product) return;
    const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    dispatch(
      addToCart({
        _id: product._id,
        title: product.title,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.images?.[0]?.url || '',
        stock: product.stock,
        category: product.category,
        theme: product.theme,
        vendor: product.vendor?._id || product.vendor,
        qty: Number(typeof forcedQty === 'number' ? forcedQty : qty),
      })
    );

    setAddedAlert(true);
    toast(`Added ${typeof forcedQty === 'number' ? forcedQty : qty} × “${product.title}” to your cart`);
    setTimeout(() => setAddedAlert(false), 2500);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    dispatch(
      createProductReview({
        productId: id,
        rating: ratingInput,
        comment: commentInput,
      })
    );
    setCommentInput('');
  };

  if (loading) return <Loader message="Fetching product details..." />;
  if (error) return <Alert type="error" message={error} />;
  if (!product) return null;

  const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPercent =
    product.discountPrice > 0
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const activeImage =
    product.images?.[selectedImageIndex]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="space-y-12">
      {(() => {
        const ThemePage = THEME_PAGES[themeFor(product)] || TechProductPage;
        return <ThemePage product={product} onAdd={(n) => handleAddToCart(n)} />;
      })()}

      {/* Vendor Profile Spotlight Card */}
      {product.vendor && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src={
                product.vendor?.vendorDetails?.storeLogo ||
                product.vendor?.avatar ||
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80'
              }
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  {product.vendor?.vendorDetails?.storeName || product.vendor?.name}
                </h3>
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  VERIFIED STORE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                {product.vendor?.vendorDetails?.storeDescription || 'Official platform certified partner.'}
              </p>
            </div>
          </div>

          <Link
            to={`/?vendor=${product.vendor?._id}`}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold backdrop-blur-sm transition-all whitespace-nowrap"
          >
            Explore Store Catalog
          </Link>
        </div>
      )}

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-10 border border-[#d2d2d7]/60 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">
              Customer Reviews ({product.numReviews})
            </h2>
            <p className="text-xs text-slate-500">Verified buyer ratings and authentic feedback</p>
          </div>
        </div>

        {/* Add Review Box */}
        {userInfo ? (
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 rounded-2xl p-6 border border-slate-200/70 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Write a Review</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Score Rating</label>
              <select
                value={ratingInput}
                onChange={(e) => setRatingInput(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="5">5 - Excellent ★★★★★</option>
                <option value="4">4 - Very Good ★★★★☆</option>
                <option value="3">3 - Average ★★★☆☆</option>
                <option value="2">2 - Fair ★★☆☆☆</option>
                <option value="1">1 - Poor ★☆☆☆☆</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your Feedback</label>
              <textarea
                rows="3"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share details of your experience with this item..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
            Please <Link to="/login" className="font-bold underline">Sign In</Link> to post a review.
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {rev.name?.[0] || 'U'}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{rev.name}</span>
                  </div>
                  <Rating value={rev.rating} showNumber={false} size="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-9">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic py-4">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>

      <RecentlyViewed excludeId={product._id} />
    </div>
  );
};

export default ProductDetailsPage;
