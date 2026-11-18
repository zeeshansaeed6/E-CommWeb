import { toSnapshot } from '../redux/slices/wishlistSlice';

const KEY = 'recentlyViewed';
const MAX = 8;

export const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

export const recordRecentlyViewed = (product) => {
  try {
    const rest = getRecentlyViewed().filter((p) => p._id !== product._id);
    localStorage.setItem(KEY, JSON.stringify([toSnapshot(product), ...rest].slice(0, MAX)));
  } catch {
    // storage unavailable: skip
  }
};
