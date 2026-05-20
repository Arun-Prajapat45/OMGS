import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],       // Each item: { id, key, productId, designId, size, thickness, quantity, price, name, image, customData }
  coupon: null,
  deliveryFee: 0,
  synced: false,   // Whether we've loaded from DB at least once
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Set entire cart from DB (replaces local state)
    setCart(state, action) {
      state.items = action.payload;
      state.synced = true;
    },
    addToCart(state, action) {
      const { id, productId, designId, size, thickness, quantity = 1, price, name, image, customData } = action.payload;
      const key = `${productId}-${size || 'no-size'}-${thickness || 'no-thickness'}-${designId || 'no-design'}`;
      const existing = state.items.find((i) => i.key === key);
      if (existing) {
        existing.quantity += quantity;
        // Update DB id if we got one back from server
        if (id) existing.id = id;
      } else {
        state.items.push({ id: id || null, key, productId, designId, size, thickness, quantity, price, name, image, customData });
      }
    },
    // Called after server responds with the real DB id
    updateCartItemId(state, action) {
      const { key, id } = action.payload;
      const item = state.items.find((i) => i.key === key);
      if (item) item.id = id;
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.key !== action.payload);
    },
    updateQuantity(state, action) {
      const { key, quantity } = action.payload;
      const item = state.items.find((i) => i.key === key);
      if (item) item.quantity = Math.max(1, quantity);
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
      state.synced = false;
    },
    applyCoupon(state, action) {
      state.coupon = action.payload;
    },
    removeCoupon(state) {
      state.coupon = null;
    },
    setDeliveryFee(state, action) {
      state.deliveryFee = action.payload;
    },
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((acc, i) => acc + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
export const selectCoupon = (state) => state.cart.coupon;
export const selectDeliveryFee = (state) => state.cart.deliveryFee;
export const selectCartSynced = (state) => state.cart.synced;
export const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state);
  const coupon = selectCoupon(state);
  const delivery = selectDeliveryFee(state);
  let discount = 0;
  if (coupon) {
    discount = coupon.type === 'percentage'
      ? (subtotal * coupon.value) / 100
      : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  }
  return subtotal - discount + delivery;
};

export const {
  setCart,
  addToCart,
  updateCartItemId,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  setDeliveryFee,
} = cartSlice.actions;

export default cartSlice.reducer;
