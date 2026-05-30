'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineHeart } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductCard } from '@/components/products/ProductGrid';

export default function WishlistPage() {
  const { items: wishlistIds, clearWishlist } = useWishlist();
  const { status } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const queryIds = wishlistIds.length > 0 ? wishlistIds.join(',') : '';

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = status === 'authenticated'
      ? '/api/wishlist'
      : queryIds
        ? `/api/wishlist?ids=${encodeURIComponent(queryIds)}`
        : '/api/wishlist';

    setLoading(true);
    fetch(apiUrl, { signal: controller.signal, credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Wishlist fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data.products) ? data.products : Array.isArray(data.items)
          ? data.items.map((item) => item.product)
          : []);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setProducts([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [status, wishlistIds.length, queryIds]);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Wishlist</h1>
            <p className="text-white/50 mt-2 max-w-2xl">
              Keep all your favorite products in one place. Add items from the product page and revisit them anytime.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/80 border border-white/10">
              <HiOutlineHeart className="w-4 h-4 text-red-400" />
              {wishlistIds.length} item{wishlistIds.length === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={async () => {
                await clearWishlist();
                toast.success('Wishlist cleared');
              }}
              disabled={wishlistIds.length === 0}
              className={`inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm transition-all ${wishlistIds.length === 0 ? 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed' : 'bg-red-500/10 border-red-500/20 text-red-100 hover:bg-red-500/20'}`}
            >
              Clear wishlist
            </button>
            <Link href="/products" className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10 transition-all">
              Browse Products
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="glass rounded-3xl p-12 text-center text-white/60">
            Loading wishlist products...
          </div>
        ) : wishlistIds.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-white/60">
            <div className="text-4xl mb-3">💖</div>
            <h2 className="text-xl font-semibold text-white mb-2">Your wishlist is empty</h2>
            <p className="max-w-md mx-auto text-sm text-white/50 leading-relaxed">
              Add products to your wishlist from the product detail page, then come back here to view them in a nice grid.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
