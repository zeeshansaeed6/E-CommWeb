import React from 'react';

// Frame each product photo in the visual language of its product page theme.
const FRAMES = {
  editorial: { wrap: '', img: 'rounded-none', extra: (a) => <span className="absolute -right-1.5 -bottom-1.5 h-full w-full -z-10" style={{ backgroundColor: a }} /> },
  energy: { wrap: '', img: '', clip: 'polygon(14% 0, 100% 0, 86% 100%, 0 100%)', extra: (a) => <span className="absolute inset-x-0 bottom-0 h-1 -skew-x-12" style={{ backgroundColor: a }} /> },
  soft: { wrap: '', img: 'rounded-full ring-4 ring-white shadow-lg' },
  cozy: { wrap: '-rotate-2', img: 'rounded-2xl border-[5px] border-[#fffaf1] shadow-md' },
  luxury: { wrap: '', img: 'rounded-t-full rounded-b-xl ring-1 ring-black/10' },
  tech: { wrap: '', img: 'rounded-2xl ring-1 ring-black/10' },
};

/** Product thumbnail framed to match the item's theme. size is a Tailwind size class pair, e.g. "w-20 h-20". */
const ThemedThumb = ({ src, alt = '', theme = 'tech', accent = '#0071e3', size = 'w-20 h-20' }) => {
  const f = FRAMES[theme] || FRAMES.tech;
  return (
    <span className={`relative inline-block flex-shrink-0 ${size} ${f.wrap}`} style={{ isolation: 'isolate' }}>
      {f.extra?.(accent)}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full bg-slate-100 object-cover ${f.img}`}
        style={f.clip ? { clipPath: f.clip } : undefined}
      />
    </span>
  );
};

export default ThemedThumb;
