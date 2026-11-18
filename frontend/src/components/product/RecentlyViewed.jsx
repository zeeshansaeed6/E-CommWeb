import React, { useMemo } from 'react';
import { History } from 'lucide-react';
import ProductCard from './ProductCard';
import { getRecentlyViewed } from '../../hooks/useRecentlyViewed';

// excludeId hides the product currently being viewed
const RecentlyViewed = ({ excludeId }) => {
  const items = useMemo(() => getRecentlyViewed().filter((p) => p._id !== excludeId).slice(0, 4), [excludeId]);
  if (items.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-600">
          <History className="w-5 h-5" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">Recently viewed</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
