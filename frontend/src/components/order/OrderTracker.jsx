import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Check, XCircle } from 'lucide-react';
import { TRACKER_STEPS } from './orderTheme';

gsap.registerPlugin(useGSAP);

/**
 * Order progress. full = labelled timeline whose line fills on mount; compact = thin segmented bar.
 * stage: -1 cancelled, else the index of the furthest reached step.
 */
const OrderTracker = ({ stage, accent = '#0f172a', compact = false }) => {
  const root = useRef(null);
  const pct = stage <= 0 ? 0 : (stage / (TRACKER_STEPS.length - 1)) * 100;

  useGSAP(
    () => {
      if (compact) return;
      gsap.fromTo('.trk-fill', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 1.4, ease: 'power3.out', delay: 0.3 });
      gsap.from('.trk-dot', { scale: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(2.4)', delay: 0.2 });
    },
    { scope: root, dependencies: [stage, compact] }
  );

  if (stage === -1) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600">
        <XCircle className="h-4 w-4" /> Cancelled
      </p>
    );
  }

  if (compact) {
    return (
      <div className="flex gap-1" role="img" aria-label={`Order progress: ${TRACKER_STEPS[stage]}`}>
        {TRACKER_STEPS.map((s, i) => (
          <span key={s} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: i <= stage ? accent : '#e2e8f0' }} />
        ))}
      </div>
    );
  }

  return (
    <ol ref={root} className="relative flex items-start justify-between" aria-label="Order progress">
      <span className="absolute left-[10%] right-[10%] top-4 h-0.5 rounded bg-slate-200" aria-hidden="true" />
      <span className="absolute left-[10%] top-4 h-0.5 rounded" style={{ width: '80%' }} aria-hidden="true">
        <span className="trk-fill block h-full rounded" style={{ width: `${pct}%`, backgroundColor: accent }} />
      </span>
      {TRACKER_STEPS.map((label, i) => {
        const done = i <= stage;
        return (
          <li key={label} className="relative z-10 flex w-1/5 flex-col items-center gap-2 text-center">
            <span
              className="trk-dot grid h-8 w-8 place-items-center rounded-full text-xs font-bold ring-4 ring-white transition-colors"
              style={{ backgroundColor: done ? accent : '#e2e8f0', color: done ? '#fff' : '#64748b' }}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`text-xs ${done ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
};

export default OrderTracker;
