import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import useCurrency from '../../hooks/useCurrency';

const MIN_CHARS = 2;
const MAX_RESULTS = 5;
const DEBOUNCE_MS = 250;

/**
 * Search input with live product suggestions (debounced, cancellable),
 * keyboard navigation (arrows / enter / escape) and outside-click close.
 * variant: 'desktop' (with button) | 'mobile' (compact).
 */
const SearchBox = ({ variant = 'desktop' }) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const boxRef = useRef(null);

  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const term = query.trim();

  useEffect(() => {
    if (term.length < MIN_CHARS) {
      setItems([]);
      setLoading(false);
      return undefined;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await axiosClient.get(`/products?keyword=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        setItems((data.products || []).slice(0, MAX_RESULTS));
        setActive(-1);
      } catch {
        if (!ctrl.signal.aborted) setItems([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [term]);

  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  const goToProduct = (p) => {
    setOpen(false);
    setQuery('');
    navigate(`/product/${p._id}`);
  };

  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return goToProduct(items[active]);
    setOpen(false);
    navigate(term ? `/?keyword=${encodeURIComponent(term)}` : '/');
    return undefined;
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown' && items.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp' && items.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    }
  };

  const showPanel = open && term.length >= MIN_CHARS;
  const desktop = variant === 'desktop';

  return (
    <form
      ref={boxRef}
      onSubmit={submit}
      role="search"
      className={desktop ? 'hidden md:flex flex-1 max-w-xl relative items-center' : 'md:hidden px-4 pb-3 relative'}
    >
      <div className="relative w-full flex items-center">
        <Search className={`w-4 h-4 text-slate-400 absolute pointer-events-none ${desktop ? 'left-4' : 'left-4'}`} />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products, brands, stores..."
          aria-label="Search products"
          aria-expanded={showPanel}
          aria-controls="search-suggestions"
          autoComplete="off"
          className={`w-full bg-slate-100/80 border border-slate-200 rounded-full pl-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all ${
            desktop ? 'pr-24 py-2.5' : 'pr-4 py-2.5'
          }`}
        />
        {desktop && (
          <button type="submit" className="absolute right-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-xs font-semibold tracking-wide transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        )}
      </div>

      {showPanel && (
        <div
          id="search-suggestions"
          role="listbox"
          className={`absolute top-full z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${desktop ? 'left-0 right-0 mt-2' : 'left-4 right-4 mt-0'}`}
        >
          {items.length === 0 && !loading && <p className="px-4 py-4 text-sm text-slate-500">No matches for “{term}”.</p>}
          {items.map((p, i) => (
            <button
              type="button"
              role="option"
              aria-selected={i === active}
              key={p._id}
              onMouseEnter={() => setActive(i)}
              onClick={() => goToProduct(p)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${i === active ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
            >
              <img src={p.images?.[0]?.url} alt="" className="h-11 w-11 flex-shrink-0 rounded-xl bg-slate-100 object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900">{p.title}</span>
                <span className="block truncate text-xs text-slate-500">{p.category}</span>
              </span>
              <span className="flex-shrink-0 text-sm font-bold text-slate-900">{formatPrice(p.discountPrice > 0 ? p.discountPrice : p.price)}</span>
            </button>
          ))}
          {items.length > 0 && (
            <button type="submit" className="w-full border-t border-slate-100 px-4 py-3 text-left text-xs font-semibold text-brand-600 hover:bg-slate-50">
              See all results for “{term}”
            </button>
          )}
        </div>
      )}
    </form>
  );
};

export default SearchBox;
