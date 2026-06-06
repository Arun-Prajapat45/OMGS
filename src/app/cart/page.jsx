'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineMinus,
  HiOutlinePlus,
  HiArrowLeft,
  HiOutlineTag,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiX,
  HiCheck,
  HiOutlineRefresh,
} from 'react-icons/hi';
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartTotal,
  selectCoupon,
  applyCoupon,
  removeCoupon,
} from '@/store/slices/cartSlice';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

/* ─── Animation variants ─────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─── Coupon presets (demo) ──────────────────────────────────── */
const DEMO_COUPONS = {
  SAVE10: { type: 'percentage', value: 10, maxDiscount: 200, label: '10% OFF' },
  FLAT50: { type: 'fixed', value: 50, label: '₹50 OFF' },
};

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-32 gap-6 text-center"
    >
      {/* Floating bag icon */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 70%)' }}>
          <HiOutlineShoppingCart className="w-16 h-16 text-primary-400" />
        </div>
        {/* Floating sparkles */}
        {['top-0 right-4', 'bottom-4 left-0', 'top-8 -left-4'].map((pos, i) => (
          <motion.div key={i} className={`absolute ${pos} w-2.5 h-2.5 rounded-full bg-primary-400/60`}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </motion.div>

      <div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">
          Looks like you haven&apos;t added any beautiful products yet. Let&apos;s fix that!
        </p>
      </div>

      <Link
        href="/products"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-all glow"
      >
        <HiOutlineLightningBolt className="w-4 h-4" />
        Browse Products
      </Link>
    </motion.div>
  );
}

/* ─── Cart item card ──────────────────────────────────────────── */
function CartItemCard({ item, onRemove, onUpdateQty }) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      exit={{ opacity: 0, x: 80, transition: { duration: 0.25 } }}
      className="group glass rounded-2xl p-5 flex gap-5 border border-white/5 hover:border-primary-500/20 transition-all duration-300"
    >
      {/* Product image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 relative">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiOutlineShoppingCart className="w-10 h-10 text-white/20" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white text-sm leading-tight truncate pr-8">{item.name}</h3>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {item.customData?.variant ? (
              <>
                {item.customData.variant.name && (
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">
                    {item.customData.variant.name}
                  </span>
                )}
                {(item.customData.variant.size || item.customData.variant.dim) && (
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">
                    {item.customData.variant.size || item.customData.variant.dim}
                  </span>
                )}
                {(item.customData.variant.thickness || item.customData.variant.thick) && (
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">
                    {item.customData.variant.thickness || item.customData.variant.thick}
                  </span>
                )}
              </>
            ) : (
              <>
                {item.size && (
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">
                    {item.size}
                  </span>
                )}
                {item.thickness && (
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">
                    {item.thickness}
                  </span>
                )}
              </>
            )}
            {item.customData?.selectedFrame && (
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">
                Frame: Premium Frame
              </span>
            )}
            {item.customData?.hasStuds && (
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-xs">
                + Studs
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Qty controls */}
          <div className="flex items-center gap-1 glass rounded-xl p-1">
            <button
              onClick={() => onUpdateQty(item.key, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 rounded-lg hover:bg-white/10 disabled:opacity-30 flex items-center justify-center transition-all"
            >
              <HiOutlineMinus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
            <button
              onClick={() => onUpdateQty(item.key, item.quantity + 1)}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all"
            >
              <HiOutlinePlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Price + delete */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-white text-base">{formatPrice(item.price * item.quantity)}</p>
              {item.quantity > 1 && (
                <p className="text-white/30 text-xs">{formatPrice(item.price)} each</p>
              )}
            </div>

            {item.productSlug && (
              <Link
                href={`/products/${item.productSlug}?designId=${item.designId || ''}`}
                className="p-2 rounded-xl text-white/30 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                title="Edit item"
              >
                <HiOutlinePencilAlt className="w-4 h-4" />
              </Link>
            )}

            <button
              onClick={() => onRemove(item.key)}
              className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Remove item"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);
  const appliedCoupon = useSelector(selectCoupon);

  const { removeFromCart, updateQuantity, clearCart } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const deliveryFee = subtotal >= 499 ? 0 : 99;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.min((subtotal * appliedCoupon.value) / 100, appliedCoupon.maxDiscount || Infinity)
      : appliedCoupon.value
    : 0;

  /* Apply coupon */
  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate fetch
    const found = DEMO_COUPONS[code];
    if (found) {
      dispatch(applyCoupon({ ...found, code }));
      toast.success(`Coupon applied: ${found.label}`);
      setCouponInput('');
    } else {
      toast.error('Invalid or expired coupon code');
    }
    setCouponLoading(false);
  };

  /* Remove coupon */
  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast('Coupon removed', { icon: '✕' });
  };

  /* Clear all */
  const handleClearCart = async () => {
    await clearCart();
    toast('Cart cleared', { icon: '🗑️' });
  };

  return (
    <div className="pt-20 min-h-screen">
      {/* ── Background glow ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-32 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute bottom-32 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl glass border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-3xl font-bold text-white">
                Shopping Cart
              </h1>
              {items.length > 0 && (
                <p className="text-white/40 text-sm mt-0.5">
                  {items.length} item{items.length !== 1 ? 's' : ''} in your cart
                </p>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 text-sm transition-all"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Clear all
            </button>
          )}
        </motion.div>

        {/* ── Empty state ── */}
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-5 gap-8 items-start">

            {/* ── LEFT: Items ── */}
            <div className="lg:col-span-3 space-y-4">
              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-3 mb-2"
              >
                {[
                  { icon: HiOutlineShieldCheck, label: 'Secure Checkout' },
                  { icon: HiOutlineTruck, label: 'Free Shipping ₹499+' },
                  { icon: HiOutlineRefresh, label: 'Quality Guarantee' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-white/40">
                    <Icon className="w-3.5 h-3.5 text-primary-400" />
                    {label}
                  </div>
                ))}
              </motion.div>

              {/* Item list */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.key}
                      item={item}
                      onRemove={removeFromCart}
                      onUpdateQty={updateQuantity}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Continue shopping */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mt-2"
                >
                  <HiArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </motion.div>
            </div>

            {/* ── RIGHT: Summary ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-4 lg:sticky lg:top-24"
            >
              {/* Coupon */}
              <div className="glass rounded-2xl p-5 border border-white/8">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <HiOutlineTag className="w-4 h-4 text-primary-400" />
                  Apply Coupon
                </h3>

                {appliedCoupon ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30"
                  >
                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                      <HiCheck className="w-4 h-4" />
                      <span>{appliedCoupon.code}</span>
                      <span className="text-green-300/70 font-normal">— {appliedCoupon.label}</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-green-400/50 hover:text-green-300 transition-colors">
                      <HiX className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Enter code (e.g. SAVE10)"
                      className="flex-1 px-4 py-2.5 glass rounded-xl text-white placeholder:text-white/25 text-sm border border-white/10 focus:border-primary-500/50 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all min-w-[80px] flex items-center justify-center"
                    >
                      {couponLoading ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : 'Apply'}
                    </button>
                  </div>
                )}

                <p className="text-white/25 text-xs mt-2">Try: SAVE10 or FLAT50</p>
              </div>

              {/* Order summary */}
              <div className="glass rounded-2xl p-5 border border-white/8">
                <h3 className="text-sm font-semibold text-white mb-4">Order Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Shipping</span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-400 font-medium">Free</span>
                    ) : (
                      <span className="text-white">{formatPrice(deliveryFee)}</span>
                    )}
                  </div>

                  {deliveryFee > 0 && (
                    <div className="text-xs text-primary-400/70 bg-primary-500/10 rounded-lg px-3 py-2 border border-primary-500/20">
                      Add {formatPrice(499 - subtotal)} more for free shipping
                    </div>
                  )}

                  {discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex justify-between text-sm text-green-400"
                    >
                      <span>Coupon Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </motion.div>
                  )}

                  <div className="h-px bg-white/8 my-2" />

                  <div className="flex justify-between">
                    <span className="font-bold text-white text-lg">Total</span>
                    <span className="font-black text-xl text-gradient-primary">
                      {formatPrice(subtotal - discount + deliveryFee)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <p className="text-green-400/70 text-xs text-right">
                      You save {formatPrice(discount)} 🎉
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href="/checkout"
                  className="mt-5 flex items-center justify-center gap-2 w-full py-4 rounded-2xl gradient-primary text-white font-bold text-base hover:opacity-90 transition-all glow"
                >
                  <HiOutlineLightningBolt className="w-5 h-5" />
                  Proceed to Checkout
                </Link>

                {/* Security note */}
                <div className="flex items-center justify-center gap-2 mt-3 text-white/25 text-xs">
                  <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                  Secured by 256-bit SSL encryption
                </div>
              </div>

              {/* Payment methods */}
              <div className="glass rounded-2xl p-4 border border-white/8">
                <p className="text-white/30 text-xs text-center mb-3">We accept</p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {['Visa', 'Mastercard', 'UPI', 'Razorpay', 'NetBanking'].map((method) => (
                    <span
                      key={method}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-white/40 text-xs font-medium"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
