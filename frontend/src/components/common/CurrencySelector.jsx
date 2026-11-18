import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import useCurrency from '../../hooks/useCurrency';

// Flag emoji don't render on Windows, so every currency gets a symbol badge instead
const Badge = ({ symbol, active }) => (
  <span
    className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-sm font-bold ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
    aria-hidden="true"
  >
    {symbol.trim().slice(0, 3)}
  </span>
);

const rateLabel = (curr) => (curr.rate === 1 ? 'Base currency' : `1 USD = ${curr.rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);

/** Currency picker: keyboard accessible listbox (arrows, Enter, Escape) with fixed, clearly labelled rates. */
const CurrencySelector = ({ className = '' }) => {
  const { selectedCurrency, currencyInfo, allCurrencies, changeCurrency } = useCurrency();
  const list = Object.values(allCurrencies);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const trigger = useRef(null);
  const listbox = useRef(null);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    setActive(Math.max(0, list.findIndex((c) => c.code === selectedCurrency)));
    listbox.current?.focus();
    const onDown = (e) => root.current && !root.current.contains(e.target) && close();
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
    // list is derived from a constant map, so it is stable for the lifetime of the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedCurrency, close]);

  const choose = (code) => {
    changeCurrency(code);
    close(true);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % list.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + list.length) % list.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(list.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(list[active].code);
    } else if (e.key === 'Tab') {
      close();
    }
  };

  return (
    <div ref={root} className={`relative inline-block text-left ${className}`}>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${currencyInfo.name}. Change currency`}
        className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-95"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-[11px] font-bold text-white" aria-hidden="true">
          {currencyInfo.symbol.trim().slice(0, 3)}
        </span>
        {currencyInfo.code}
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right animate-pop overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
          <div
            ref={listbox}
            role="listbox"
            tabIndex={-1}
            aria-label="Currency"
            aria-activedescendant={`cur-${list[active]?.code}`}
            onKeyDown={onKeyDown}
            className="max-h-80 overflow-y-auto p-2 outline-none"
          >
            {list.map((curr, i) => {
              const selected = curr.code === selectedCurrency;
              return (
                <button
                  key={curr.code}
                  id={`cur-${curr.code}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  onClick={() => choose(curr.code)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${i === active ? 'bg-slate-100' : ''}`}
                >
                  <Badge symbol={curr.symbol} active={selected} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{curr.code}</span>
                    <span className="block truncate text-xs text-slate-500">{curr.name}</span>
                  </span>
                  <span className="flex-shrink-0 text-right">
                    <span className="block text-[11px] font-medium text-slate-500">{rateLabel(curr)}</span>
                    {selected && <Check className="ml-auto mt-0.5 h-4 w-4 text-slate-900" />}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
            Prices are converted for display using fixed estimates. Checkout is charged in USD.
          </p>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
