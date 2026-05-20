import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMenuOpen: false,
  isMegaMenuOpen: false,
  megaMenuCategory: null,
  isCartOpen: false,
  isSearchOpen: false,
  isAuthModalOpen: false,
  authModalView: 'login', // 'login' | 'register'
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMenu(state) { state.isMenuOpen = !state.isMenuOpen; },
    closeMenu(state) { state.isMenuOpen = false; },
    openMegaMenu(state, action) {
      state.isMegaMenuOpen = true;
      state.megaMenuCategory = action.payload;
    },
    closeMegaMenu(state) {
      state.isMegaMenuOpen = false;
      state.megaMenuCategory = null;
    },
    toggleCart(state) { state.isCartOpen = !state.isCartOpen; },
    closeCart(state) { state.isCartOpen = false; },
    toggleSearch(state) { state.isSearchOpen = !state.isSearchOpen; },
    openAuthModal(state, action) {
      state.isAuthModalOpen = true;
      state.authModalView = action.payload || 'login';
    },
    closeAuthModal(state) { state.isAuthModalOpen = false; },
    setToast(state, action) { state.toast = action.payload; },
    clearToast(state) { state.toast = null; },
  },
});

export const {
  toggleMenu, closeMenu, openMegaMenu, closeMegaMenu,
  toggleCart, closeCart, toggleSearch,
  openAuthModal, closeAuthModal, setToast, clearToast,
} = uiSlice.actions;
export default uiSlice.reducer;
