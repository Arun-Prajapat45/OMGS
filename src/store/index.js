'use client';

import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import editorReducer from './slices/editorSlice';
import uiReducer from './slices/uiSlice';
import wishlistReducer from './slices/wishlistSlice';
import templateBuilderReducer from './slices/templateBuilderSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    editor: editorReducer,
    ui: uiReducer,
    wishlist: wishlistReducer,
    templateBuilder: templateBuilderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['editor/setStageRef'],
        ignoredPaths: ['editor.stageRef'],
      },
    }),
});

export default store;
