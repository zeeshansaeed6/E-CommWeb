import React from 'react';

const ProductCardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden" aria-hidden="true">
    <div className="skeleton aspect-square w-full" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-3 w-1/3 rounded-full" />
      <div className="skeleton h-4 w-full rounded-full" />
      <div className="skeleton h-4 w-2/3 rounded-full" />
      <div className="flex justify-between pt-3">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-10 w-10 rounded-2xl" />
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
