import React from 'react';
import { itemStyle } from '../product/themes/productTheme';

/** A thin bar split by each item's value, coloured with that item's theme accent. */
const BagColorStrip = ({ items, className = '' }) => {
  const rows = items.map((i) => ({
    id: i._id,
    accent: itemStyle(i).accent,
    value: (i.discountPrice > 0 ? i.discountPrice : i.price) * i.qty,
  }));
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;

  return (
    <div className={`flex h-1.5 w-full overflow-hidden rounded-full bg-white/10 ${className}`} aria-hidden="true">
      {rows.map((r) => (
        <span key={r.id} className="h-full transition-all duration-500" style={{ width: `${(r.value / total) * 100}%`, backgroundColor: r.accent }} />
      ))}
    </div>
  );
};

export default BagColorStrip;
