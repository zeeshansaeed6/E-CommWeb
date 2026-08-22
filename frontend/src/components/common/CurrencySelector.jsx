import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import useCurrency from '../../hooks/useCurrency';

const CurrencySelector = ({ compact = false, className = '' }) => {
  const { selectedCurrency, currencyInfo, allCurrencies, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    changeCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 rounded-xl transition-all shadow-sm active:scale-95 focus:outline-none"
        title="Change Currency"
      >
        <span className="text-sm">{currencyInfo.flag}</span>
        <span className="font-bold text-slate-800">{currencyInfo.code}</span>
        <span className="text-slate-500 font-medium">({currencyInfo.symbol.trim()})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
              <Globe className="w-3.5 h-3.5 text-brand-600" />
              <span>Select Currency</span>
            </div>
            <span className="text-[10px] text-slate-400">Live Rates</span>
          </div>

          <div className="max-h-64 overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
            {Object.values(allCurrencies).map((curr) => {
              const isSelected = curr.code === selectedCurrency;
              return (
                <button
                  key={curr.code}
                  onClick={() => handleSelect(curr.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{curr.flag}</span>
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">
                        {curr.code} <span className="text-slate-500 font-normal">({curr.symbol.trim()})</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{curr.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
