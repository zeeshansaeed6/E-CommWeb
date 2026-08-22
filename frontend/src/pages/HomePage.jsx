import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Store,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { fetchProducts, fetchFeaturedProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion & Apparel',
  'Home & Kitchen',
  'Beauty & Health',
  'Sports & Outdoors',
  'Books & Stationery',
];

const HomePage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSort = searchParams.get('sort') || 'newest';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  const { products, featuredProducts, loading, error, page, pages, totalProducts } =
    useSelector((state) => state.products);

  useEffect(() => {
    dispatch(
      fetchProducts({
        keyword,
        category: selectedCategory,
        sort: selectedSort,
        page: 1,
      })
    );
    dispatch(fetchFeaturedProducts());
  }, [dispatch, keyword, selectedCategory, selectedSort]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const sortVal = e.target.value;
    setSelectedSort(sortVal);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortVal);
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-16">
      {/* Hero Banner */}
      {!keyword && selectedCategory === 'All' && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-900 via-brand-950 to-slate-900 text-white shadow-2xl border border-slate-800 p-8 sm:p-12 lg:p-16">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Direct-from-Vendor Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight leading-tight mb-6">
              Discover Curated Gear From <span className="gradient-text">Top Independent Stores</span>.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl">
              Experience seamless multi-vendor shopping with split fulfillment, guaranteed escrow protection, and instant Stripe-powered checkout.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-sm shadow-glow flex items-center gap-2 transition-all hover:scale-105"
              >
                Browse Catalog
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Spotlight */}
      {!keyword && selectedCategory === 'All' && featuredProducts?.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-extrabold text-slate-900">
                  Trending & Featured
                </h2>
                <p className="text-xs text-slate-500">Highest rated products across verified vendors</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Main Catalog & Filter Section */}
      <section id="catalog" className="space-y-8 scroll-mt-24">
        {/* Category Pills & Sorting Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-glow'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 self-end lg:self-auto flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Sort by:</span>
              <select
                value={selectedSort}
                onChange={handleSortChange}
                className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Search result indicator if search is active */}
          {keyword && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span>
                Search results for: <strong className="text-slate-900">"{keyword}"</strong> ({totalProducts} items)
              </span>
              <button
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('keyword');
                  setSearchParams(newParams);
                }}
                className="text-brand-600 font-semibold hover:underline"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Product Grid State Handling */}
        {loading ? (
          <Loader message="Loading curated products..." />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No products found</h3>
            <p className="text-sm text-slate-500 mt-1">Try selecting another category or clearing search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
