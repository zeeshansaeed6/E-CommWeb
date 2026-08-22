import { createSlice } from '@reduxjs/toolkit';

const cartFromStorage = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : { cartItems: [], shippingAddress: {}, paymentMethod: 'Stripe' };

const calculateTotals = (cartItems) => {
  const itemsPrice = Number(
    cartItems
      .reduce((acc, item) => acc + (item.discountPrice > 0 ? item.discountPrice : item.price) * item.qty, 0)
      .toFixed(2)
  );

  // 5% tax
  const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
  // Free shipping over $100, else $10 flat
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0.0 : 10.0;
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  return { itemsPrice, taxPrice, shippingPrice, totalPrice };
};

const initialState = {
  cartItems: cartFromStorage.cartItems || [],
  shippingAddress: cartFromStorage.shippingAddress || {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  paymentMethod: cartFromStorage.paymentMethod || 'Stripe',
  ...calculateTotals(cartFromStorage.cartItems || []),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems.push(item);
      }

      const totals = calculateTotals(state.cartItems);
      Object.assign(state, totals);

      localStorage.setItem(
        'cart',
        JSON.stringify({
          cartItems: state.cartItems,
          shippingAddress: state.shippingAddress,
          paymentMethod: state.paymentMethod,
        })
      );
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      const totals = calculateTotals(state.cartItems);
      Object.assign(state, totals);

      localStorage.setItem(
        'cart',
        JSON.stringify({
          cartItems: state.cartItems,
          shippingAddress: state.shippingAddress,
          paymentMethod: state.paymentMethod,
        })
      );
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem(
        'cart',
        JSON.stringify({
          cartItems: state.cartItems,
          shippingAddress: state.shippingAddress,
          paymentMethod: state.paymentMethod,
        })
      );
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem(
        'cart',
        JSON.stringify({
          cartItems: state.cartItems,
          shippingAddress: state.shippingAddress,
          paymentMethod: state.paymentMethod,
        })
      );
    },
    clearCart: (state) => {
      state.cartItems = [];
      const totals = calculateTotals([]);
      Object.assign(state, totals);
      localStorage.removeItem('cart');
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
