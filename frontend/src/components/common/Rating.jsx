import React from 'react';
import { Star } from 'lucide-react';

const Rating = ({ value = 0, text = '', showNumber = true, size = 'w-4 h-4' }) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              value >= star
                ? 'fill-amber-400 text-amber-400'
                : value >= star - 0.5
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700">
          {Number(value).toFixed(1)}
        </span>
      )}
      {text && <span className="text-xs text-slate-500">({text})</span>}
    </div>
  );
};

export default Rating;
