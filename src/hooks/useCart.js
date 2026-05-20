'use client';

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import {
  setCart,
  addToCart,
  updateCartItemId,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartSynced,
} from '@/store/slices/cartSlice';
import { toggleCart } from '@/store/slices/uiSlice';
import toast from 'react-hot-toast';

/**
 * useCart — unified cart hook.
 *
 * - For authenticated users: keeps Redux state in sync with the DB.
 *   Every add/remove/update calls the API in the background.
 * - For guests: works purely with Redux (in-memory).
 */
export function useCart() {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const items = useSelector(selectCartItems);
  const synced = useSelector(selectCartSynced);
  const isLoggedIn = status === 'authenticated';

  // ── Load cart from DB on login ──────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && !synced) {
      fetch('/api/cart')
        .then((res) => res.json())
        .then(({ items: dbItems }) => {
          if (Array.isArray(dbItems)) {
            dispatch(setCart(dbItems));
          }
        })
        .catch(() => {
          // Silently fail – local Redux state is still usable
        });
    }
  }, [isLoggedIn, synced, dispatch]);

  // ── Add to cart ─────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    async ({ productId, designId, size, thickness, quantity = 1, price, name, image, customData }) => {
      // Optimistically update Redux
      dispatch(addToCart({ productId, designId, size, thickness, quantity, price, name, image, customData }));

      if (isLoggedIn) {
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId,
              designId,
              size,
              thickness,
              quantity,
              customData: { price, image, ...customData },
            }),
          });

          if (res.ok) {
            const { item } = await res.json();
            // Store the DB id so we can PATCH/DELETE it later
            const key = `${productId}-${size || 'no-size'}-${thickness || 'no-thickness'}-${designId || 'no-design'}`;
            dispatch(updateCartItemId({ key, id: item.id }));
          } else {
            console.error('Failed to persist cart item to DB');
          }
        } catch (err) {
          console.error('Cart sync error:', err);
        }
      }
    },
    [dispatch, isLoggedIn]
  );

  // ── Remove from cart ────────────────────────────────────────────────────
  const handleRemoveFromCart = useCallback(
    async (key) => {
      const item = items.find((i) => i.key === key);
      dispatch(removeFromCart(key));

      if (isLoggedIn && item?.id) {
        try {
          await fetch(`/api/cart/${item.id}`, { method: 'DELETE' });
        } catch (err) {
          console.error('Cart remove sync error:', err);
        }
      }
    },
    [dispatch, isLoggedIn, items]
  );

  // ── Update quantity ─────────────────────────────────────────────────────
  const handleUpdateQuantity = useCallback(
    async (key, quantity) => {
      const item = items.find((i) => i.key === key);
      dispatch(updateQuantity({ key, quantity }));

      if (isLoggedIn && item?.id) {
        try {
          await fetch(`/api/cart/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: Math.max(1, quantity) }),
          });
        } catch (err) {
          console.error('Cart quantity sync error:', err);
        }
      }
    },
    [dispatch, isLoggedIn, items]
  );

  // ── Clear cart ──────────────────────────────────────────────────────────
  const handleClearCart = useCallback(async () => {
    dispatch(clearCart());

    if (isLoggedIn) {
      try {
        await fetch('/api/cart', { method: 'DELETE' });
      } catch (err) {
        console.error('Cart clear sync error:', err);
      }
    }
  }, [dispatch, isLoggedIn]);

  // ── Add to cart + open drawer ───────────────────────────────────────────
  const addAndOpenCart = useCallback(
    async (payload) => {
      await handleAddToCart(payload);
      dispatch(toggleCart());
      toast.success('Added to cart! 🛒');
    },
    [handleAddToCart, dispatch]
  );

  return {
    items,
    isLoggedIn,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    addAndOpenCart,
  };
}
