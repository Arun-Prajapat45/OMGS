import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // array of productIds
  synced: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist(state, action) {
      state.items = action.payload || [];
      state.synced = true;
    },
    addWishlistItem(state, action) {
      const id = action.payload;
      if (!state.items.includes(id)) {
        state.items.push(id);
      }
    },
    removeWishlistItem(state, action) {
      const id = action.payload;
      state.items = state.items.filter((item) => item !== id);
    },
    clearWishlist(state) {
      state.items = [];
      state.synced = false;
    },
  },
});

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistSynced = (state) => state.wishlist.synced;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.includes(productId);

export const {
  setWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
