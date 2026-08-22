import { createSlice } from '@reduxjs/toolkit';

export const SUPPORTED_CURRENCIES = {
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    rate: 83.5, // 1 USD = 83.5 INR
    decimals: 2,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    rate: 1.0,
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    rate: 0.92,
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    rate: 0.79,
    decimals: 2,
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED ',
    flag: '🇦🇪',
    rate: 3.67,
    decimals: 2,
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    flag: '🇨🇦',
    rate: 1.36,
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'AU$',
    flag: '🇦🇺',
    rate: 1.52,
    decimals: 2,
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR ',
    flag: '🇸🇦',
    rate: 3.75,
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    rate: 155.0,
    decimals: 0,
  },
};

const savedCurrency = localStorage.getItem('omnimarket_currency');
const defaultCode = savedCurrency && SUPPORTED_CURRENCIES[savedCurrency] ? savedCurrency : 'INR';

const initialState = {
  selectedCurrency: defaultCode,
  currencyInfo: SUPPORTED_CURRENCIES[defaultCode],
  allCurrencies: SUPPORTED_CURRENCIES,
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      const code = action.payload;
      if (SUPPORTED_CURRENCIES[code]) {
        state.selectedCurrency = code;
        state.currencyInfo = SUPPORTED_CURRENCIES[code];
        localStorage.setItem('omnimarket_currency', code);
      }
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
