import { createSlice } from '@reduxjs/toolkit';

const KEY = 'wishlist';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

const save = (items) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode or quota): the wishlist just will not persist
  }
};

// Keep a small snapshot so the wishlist renders without refetching
export const toSnapshot = (p) => ({
  _id: p._id,
  title: p.title,
  price: p.price,
  discountPrice: p.discountPrice,
  category: p.category,
  theme: p.theme,
  images: p.images?.slice(0, 1) || [],
  vendor:
    p.vendor && typeof p.vendor === 'object'
      ? { _id: p.vendor._id, name: p.vendor.name, vendorDetails: { storeName: p.vendor.vendorDetails?.storeName } }
      : p.vendor,
  rating: p.rating,
  numReviews: p.numReviews,
  stock: p.stock,
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: load() },
  reducers: {
    toggleWishlist: (state, { payload }) => {
      const i = state.items.findIndex((x) => x._id === payload._id);
      if (i >= 0) state.items.splice(i, 1);
      else state.items.unshift(toSnapshot(payload));
      save(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      save([]);
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
