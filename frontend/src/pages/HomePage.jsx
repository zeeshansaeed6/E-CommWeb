import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Store,
  SlidersHorizontal,
  ShieldCheck,
  Truck,
  BadgeDollarSign,
  Headphones,
  Laptop,
  Shirt,
  Home,
  HeartPulse,
  Dumbbell,
  Watch,
  BookOpen,
  LayoutGrid,
  X,
} from 'lucide-react';
import { fetchProducts, fetchFeaturedProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import Reveal from '../components/common/Reveal';
import Alert from '../components/common/Alert';
import useCurrency from '../hooks/useCurrency';

const CATEGORIES = [
  { name: 'All', icon: LayoutGrid },
  { name: 'Electronics', icon: Laptop },
  { name: 'Fashion & Apparel', icon: Shirt },
  { name: 'Home & Kitchen', icon: Home },
  { name: 'Beauty & Health', icon: HeartPulse },
  { name: 'Sports & Outdoors', icon: Dumbbell },
  { name: 'Books & Stationery', icon: BookOpen },
  { name: 'Watches & Jewelry', icon: Watch },
];

const TRUST = [
  { icon: ShieldCheck, title: 'Buyer protection', text: 'Every order is escrow-secured' },
  { icon: Truck, title: 'Split fulfillment', text: 'Each vendor ships independently' },
  { icon: BadgeDollarSign, title: 'Multi-currency', text: 'Shop and pay in your currency' },
  { icon: Headphones, title: 'Verified vendors', text: 'Hand-approved independent stores' },
];

// Price bands in the store's base currency; labels are converted by formatPrice
const PRICE_BANDS = [
  { id: 'any', min: undefined, max: undefined },
  { id: 'low', min: undefined, max: 50 },
  { id: 'mid', min: 50, max: 200 },
  { id: 'high', min: 200, max: undefined },
];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

const HomePage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const keyword = searchParams.get('keyword') || '';
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  const [priceBand, setPriceBand] = useState('any');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);

  const { products, featuredProducts, loading, error, totalProducts } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    const band = PRICE_BANDS.find((b) => b.id === priceBand);
    dispatch(fetchProducts({ keyword, category: selectedCategory, sort: selectedSort, page: 1, minPrice: band.min, maxPrice: band.max }));
    dispatch(fetchFeaturedProducts());
  }, [dispatch, keyword, selectedCategory, selectedSort, priceBand]);

  const updateParam = (key, value, drop) => {
    const next = new URLSearchParams(searchParams);
    if (drop) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    updateParam('category', cat, cat === 'All');
  };

  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
    updateParam('sort', e.target.value);
  };

  const visibleProducts = products.filter((p) => (!inStockOnly || p.stock > 0) && (!topRated || p.rating >= 4));

  const showLanding = !keyword && selectedCategory === 'All';
  const hero = featuredProducts?.slice(0, 3) || [];

  return (
    <div className="space-y-20">
      {showLanding && (
        <>
          {/* ───────── Hero ───────── */}
          <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl ring-1 ring-white/10 px-6 py-14 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
            <div className="absolute inset-0 bg-grid" aria-hidden="true" />
            <div className="absolute -top-32 -right-24 w-[34rem] h-[34rem] rounded-full bg-brand-600/40 blur-[110px] animate-aurora" aria-hidden="true" />
            <div className="absolute -bottom-40 left-1/4 w-[30rem] h-[30rem] rounded-full bg-fuchsia-500/25 blur-[110px] animate-aurora [animation-delay:-6s]" aria-hidden="true" />
            <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-sky-500/20 blur-[100px] animate-aurora [animation-delay:-3s]" aria-hidden="true" />

            <div className="relative z-10 grid lg:grid-cols-[1.15fr_1fr] gap-14 items-center">
              <div className="animate-fade-up">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20 text-brand-200 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                  <Sparkles className="w-3.5 h-3.5" /> Direct-from-vendor marketplace
                </span>

                <h1 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-display font-black tracking-tight leading-[1.05]">
                  Shop the world's{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-fuchsia-300 to-sky-300">
                    best independent
                  </span>{' '}
                  stores.
                </h1>

                <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                  One cart, many vendors. Split fulfillment, escrow protection and instant checkout in your own currency.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <a
                    href="#catalog"
                    className="group px-7 py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-[0_10px_40px_-10px_rgba(255,255,255,.5)] flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
                  >
                    Start shopping
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                  <Link
                    to="/register"
                    className="px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 ring-1 ring-white/25 text-white font-semibold text-sm backdrop-blur-md transition-all"
                  >
                    Become a vendor
                  </Link>
                </div>

                <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md">
                  {[
                    ['10%', 'Flat commission'],
                    ['24/7', 'Vendor payouts'],
                    ['∞', 'Stores to explore'],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <dt className="text-2xl sm:text-3xl font-display font-extrabold">{v}</dt>
                      <dd className="text-xs text-slate-400 mt-1">{l}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Floating product stack (desktop) */}
              <div className="relative hidden lg:block h-[30rem]" aria-hidden="true">
                {hero.map((p, i) => (
                  <Link
                    key={p._id}
                    to={`/product/${p._id}`}
                    tabIndex={-1}
                    style={{
                      '--r': `${[-6, 5, -3][i]}deg`,
                      top: ['0%', '28%', '56%'][i],
                      left: ['4%', '34%', '8%'][i],
                      animationDelay: `${i * -2}s`,
                    }}
                    className="absolute w-64 flex items-center gap-4 p-3 rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20 shadow-2xl animate-float hover:ring-white/50 transition"
                  >
                    <img src={p.images?.[0]?.url || FALLBACK_IMG} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{p.title}</p>
                      <p className="text-xs text-slate-300 truncate">{p.vendor?.vendorDetails?.storeName || 'Verified vendor'}</p>
                      <p className="mt-1 text-sm font-extrabold text-brand-200">
                        {formatPrice(p.discountPrice > 0 ? p.discountPrice : p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
                {hero.length === 0 && (
                  <div className="absolute inset-0 m-auto w-72 h-72 rounded-[2.5rem] bg-gradient-to-br from-brand-500/40 to-fuchsia-500/30 ring-1 ring-white/20 animate-float" />
                )}
              </div>
            </div>
          </section>

          {/* ───────── Trust strip ───────── */}
          <section aria-label="Why OmniMarket" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="h-full flex items-start gap-3.5 p-5 rounded-3xl bg-white border border-slate-200/70 hover:border-brand-300 hover:shadow-card transition-all">
                  <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </section>

          {/* ───────── Category tiles ───────── */}
          <section className="space-y-6">
            <Reveal>
              <h2 className="text-3xl font-display font-black text-slate-900">Shop by category</h2>
              <p className="text-sm text-slate-500 mt-1">Jump straight into what you're after</p>
            </Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.filter((c) => c.name !== 'All').map(({ name, icon: Icon }, i) => (
                <Reveal key={name} delay={i * 60}>
                  <button
                    onClick={() => {
                      handleCategoryClick(name);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group w-full aspect-[4/3] p-4 rounded-3xl bg-white border border-slate-200/70 flex flex-col items-start justify-between text-left hover:bg-slate-900 hover:border-slate-900 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    <span className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-white/10 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-white transition-colors leading-tight">
                      {name}
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ───────── Featured ───────── */}
          {featuredProducts?.length > 0 && (
            <section className="space-y-6">
              <Reveal className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black text-slate-900">Trending &amp; featured</h2>
                  <p className="text-sm text-slate-500">Highest rated across verified vendors</p>
                </div>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 4).map((product, i) => (
                  <Reveal key={product._id} delay={i * 90}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ───────── Catalog ───────── */}
      <section id="catalog" className="space-y-8 scroll-mt-28">
        <div className="sticky top-[5.25rem] md:top-20 z-30 bg-white/85 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-slate-200/70 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Categories">
              {CATEGORIES.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  role="tab"
                  aria-selected={selectedCategory === name}
                  onClick={() => handleCategoryClick(name)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                    selectedCategory === name
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {name}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2.5 self-end lg:self-auto flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="sr-only">Sort by</span>
              <select
                value={selectedSort}
                onChange={handleSortChange}
                className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="newest">Newest arrivals</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Customer rating</option>
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-slate-100" role="group" aria-label="Price range">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Price</span>
            {PRICE_BANDS.map((b) => {
              const label =
                b.id === 'any' ? 'Any' : b.id === 'low' ? `Under ${formatPrice(b.max)}` : b.id === 'mid' ? `${formatPrice(b.min)} – ${formatPrice(b.max)}` : `Over ${formatPrice(b.min)}`;
              return (
                <button
                  key={b.id}
                  onClick={() => setPriceBand(b.id)}
                  aria-pressed={priceBand === b.id}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                    priceBand === b.id ? 'bg-brand-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
            <span className="mx-1 h-5 w-px flex-shrink-0 bg-slate-200" aria-hidden="true" />
            {[
              ['In stock', inStockOnly, () => setInStockOnly((v) => !v)],
              ['4★ & up', topRated, () => setTopRated((v) => !v)],
            ].map(([label, on, toggle]) => (
              <button
                key={label}
                onClick={toggle}
                aria-pressed={on}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  on ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {keyword && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
              <span>
                Results for <strong className="text-slate-900">"{keyword}"</strong>
                {typeof totalProducts === 'number' && ` · ${totalProducts} items`}
              </span>
              <button
                onClick={() => updateParam('keyword', '', true)}
                className="inline-flex items-center gap-1 text-brand-600 font-semibold hover:underline"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <Alert type="error" message={error} />
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No products found</h3>
            <p className="text-sm text-slate-500 mt-1">Try another category or clear your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product, i) => (
              <Reveal key={product._id} delay={(i % 4) * 70}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ───────── Vendor CTA ───────── */}
      {showLanding && (
        <Reveal>
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-indigo-600 to-fuchsia-600 text-white p-10 sm:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
            <div className="relative max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-display font-black leading-tight">Run a store? Sell to thousands.</h2>
              <p className="mt-3 text-white/80">Open your storefront in minutes. We handle payments, split payouts and the checkout — you ship the goods.</p>
            </div>
            <Link
              to="/register"
              className="relative px-7 py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm flex items-center gap-2 hover:-translate-y-0.5 transition-all shadow-xl flex-shrink-0"
            >
              Open your store <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </Reveal>
      )}
    </div>
  );
};

export default HomePage;
