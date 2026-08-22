import { useSelector, useDispatch } from 'react-redux';
import { setCurrency, SUPPORTED_CURRENCIES } from '../redux/slices/currencySlice';

export const formatPriceValue = (amount, currencyInfo) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    const symbol = currencyInfo?.symbol || '₹';
    return `${symbol}0.00`;
  }

  const rate = currencyInfo?.rate || 1;
  const decimals = currencyInfo?.decimals !== undefined ? currencyInfo.decimals : 2;
  const symbol = currencyInfo?.symbol || '₹';

  const converted = Number(amount) * rate;

  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formatted}`;
};

export const useCurrency = () => {
  const dispatch = useDispatch();
  const currencyState = useSelector((state) => state.currency);

  const selectedCurrency = currencyState?.selectedCurrency || 'INR';
  const currencyInfo =
    currencyState?.currencyInfo || SUPPORTED_CURRENCIES[selectedCurrency] || SUPPORTED_CURRENCIES.INR;
  const allCurrencies = currencyState?.allCurrencies || SUPPORTED_CURRENCIES;

  const formatPrice = (amount) => {
    return formatPriceValue(amount, currencyInfo);
  };

  const convertNumber = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 0;
    return Number(amount) * (currencyInfo?.rate || 1);
  };

  const changeCurrency = (code) => {
    dispatch(setCurrency(code));
  };

  return {
    selectedCurrency,
    currencyInfo,
    allCurrencies,
    formatPrice,
    convertNumber,
    changeCurrency,
  };
};

export default useCurrency;
