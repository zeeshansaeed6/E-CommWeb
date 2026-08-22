import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (queryParams.keyword) params.append('keyword', queryParams.keyword);
      if (queryParams.category && queryParams.category !== 'All') params.append('category', queryParams.category);
      if (queryParams.sort) params.append('sort', queryParams.sort);
      if (queryParams.page) params.append('page', queryParams.page);
      if (queryParams.minPrice) params.append('minPrice', queryParams.minPrice);
      if (queryParams.maxPrice) params.append('maxPrice', queryParams.maxPrice);

      const { data } = await axiosClient.get(`/products?${params.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/products/featured');
      return data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/products/${id}`);
      return data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createProductReview = createAsyncThunk(
  'products/createProductReview',
  async ({ productId, rating, comment }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post(`/products/${productId}/reviews`, {
        rating,
        comment,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    featuredProducts: [],
    product: null,
    loading: false,
    error: null,
    page: 1,
    pages: 1,
    totalProducts: 0,
    reviewSuccess: false,
  },
  reducers: {
    resetProductDetails: (state) => {
      state.product = null;
      state.reviewSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Featured Products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })
      // Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Review
      .addCase(createProductReview.fulfilled, (state) => {
        state.reviewSuccess = true;
      });
  },
});

export const { resetProductDetails } = productSlice.actions;
export default productSlice.reducer;
