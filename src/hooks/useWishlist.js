'use client';

import { useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist as clearWishlistState,
  selectWishlistItems,
  selectWishlistSynced,
} from '@/store/slices/wishlistSlice';

let wishlistSyncStarted = false;

export function useWishlist() {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const items = useSelector(selectWishlistItems);
  const synced = useSelector(selectWishlistSynced);
  const isLoggedIn = status === 'authenticated';

  useEffect(() => {
    if (status !== 'authenticated') {
      wishlistSyncStarted = false;
      return;
    }

    if (synced || wishlistSyncStarted) return;
    wishlistSyncStarted = true;

    fetch('/api/wishlist', { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Wishlist sync failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.productIds)) {
          dispatch(setWishlist(data.productIds));
        } else if (Array.isArray(data.items)) {
          dispatch(setWishlist(data.items.map((item) => item.productId)));
        } else {
          dispatch(setWishlist([]));
        }
      })
      .catch((error) => {
        console.error('Wishlist sync error:', error);
      });
  }, [dispatch, status, synced]);

  const addToWishlist = useCallback(
    async (productId) => {
      if (!productId) return;
      dispatch(addWishlistItem(productId));

      if (!isLoggedIn) return;

      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      } catch (error) {
        console.error('Wishlist add sync error:', error);
      }
    },
    [dispatch, isLoggedIn]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!productId) return;
      dispatch(removeWishlistItem(productId));

      if (!isLoggedIn) return;

      try {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      } catch (error) {
        console.error('Wishlist remove sync error:', error);
      }
    },
    [dispatch, isLoggedIn]
  );

  const clearWishlist = useCallback(
    async () => {
      dispatch(clearWishlistState());

      if (!isLoggedIn) return;

      try {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Wishlist clear sync error:', error);
      }
    },
    [dispatch, isLoggedIn]
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!productId) return;
      if (items.includes(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    },
    [items, addToWishlist, removeFromWishlist]
  );

  return {
    items,
    isLoggedIn,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    synced,
    session,
  };
}
