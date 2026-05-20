import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // array of productIds
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action) {
      const id = action.payload;
      const idx = state.items.indexOf(id);
      if (idx === -1) state.items.push(id);
      else state.items.splice(idx, 1);
    },
    clearWishlist(state) { state.items = []; },
  },
});

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.includes(productId);

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
