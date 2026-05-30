'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineHeart } from 'react-icons/hi';
import { selectWishlistItems } from '@/store/slices/wishlistSlice';
import { ProductCard } from '@/components/products/ProductGrid';

export default function WishlistPage() {
  const wishlistIds = useSelector(selectWishlistItems);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wishlistIds?.length) {
      setProducts([]);
      return;
    }

    const controller = new AbortController();
    const query = wishlistIds.join(',');

    setLoading(true);
    fetch(`/api/wishlist?ids=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Wishlist fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setProducts([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [wishlistIds]);

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
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/80 border border-white/10">
              <HiOutlineHeart className="w-4 h-4 text-red-400" />
              {wishlistIds.length} item{wishlistIds.length === 1 ? '' : 's'}
            </span>
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
