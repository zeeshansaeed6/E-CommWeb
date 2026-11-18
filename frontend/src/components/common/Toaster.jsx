import React, { useEffect, useState } from 'react';
import { Check, Heart, AlertCircle, X } from 'lucide-react';

const LIFETIME = 3000;
const MAX_VISIBLE = 3;

const STYLES = {
  success: { Icon: Check, tone: 'bg-emerald-500' },
  wish: { Icon: Heart, tone: 'bg-rose-500' },
  error: { Icon: AlertCircle, tone: 'bg-amber-500' },
};

const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timers = new Set();
    const dismiss = (id) => setToasts((list) => list.filter((t) => t.id !== id));

    const onToast = (e) => {
      const t = e.detail;
      setToasts((list) => [...list, t].slice(-MAX_VISIBLE));
      const timer = setTimeout(() => {
        dismiss(t.id);
        timers.delete(timer);
      }, LIFETIME);
      timers.add(timer);
    };

    window.addEventListener('app:toast', onToast);
    return () => {
      window.removeEventListener('app:toast', onToast);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-24 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-3"
    >
      {toasts.map((t) => {
        const { Icon, tone } = STYLES[t.type] || STYLES.success;
        return (
          <div
            key={t.id}
            className="pointer-events-auto animate-fade-up flex items-center gap-3 rounded-2xl bg-slate-900/95 px-4 py-3 text-sm font-medium text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
          >
            <span className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 truncate">{t.message}</span>
            <button
              onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
              aria-label="Dismiss notification"
              className="text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toaster;
