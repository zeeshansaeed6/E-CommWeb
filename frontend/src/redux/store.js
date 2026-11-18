import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import currencyReducer from './slices/currencySlice';
import wishlistReducer from './slices/wishlistSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    order: orderReducer,
    currency: currencyReducer,
    wishlist: wishlistReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
