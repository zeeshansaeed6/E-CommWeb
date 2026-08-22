import React, { useState } from 'react';
import { Eye, ZoomIn } from 'lucide-react';

const ImageGallery = ({ images = [], title = 'Product Image' }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const imageList = images && images.length > 0
    ? images.map((img) => (typeof img === 'string' ? { url: img } : img))
    : [{ url: fallbackImage }];

  const currentImage = imageList[selectedIdx]?.url || fallbackImage;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Preview Container */}
      <div 
        className="relative bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm group aspect-square flex items-center justify-center p-4"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <img
          src={currentImage}
          alt={`${title} - View ${selectedIdx + 1}`}
          className={`w-full h-full object-contain object-center transition-transform duration-500 ease-out ${
            isZoomed ? 'scale-110' : 'scale-100'
          }`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />

        {/* Zoom Hint Badge */}
        <div className="absolute bottom-4 right-4 bg-slate-900/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Hover to Zoom</span>
        </div>

        {/* Counter Badge */}
        {imageList.length > 1 && (
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-sm">
            {selectedIdx + 1} / {imageList.length}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white ${
                selectedIdx === idx
                  ? 'border-brand-600 ring-2 ring-brand-600/20 shadow-md scale-105'
                  : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={img.url || fallbackImage}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImage;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
