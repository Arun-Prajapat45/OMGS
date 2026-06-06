'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { HiX, HiOutlineMinus, HiOutlinePlus, HiOutlineTrash, HiOutlineShoppingBag, HiOutlineExternalLink, HiOutlinePencilAlt } from 'react-icons/hi';
import { toggleCart } from '@/store/slices/uiSlice';
import { selectCartItems, selectCartSubtotal, selectCartTotal } from '@/store/slices/cartSlice';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector((s) => s.ui.isCartOpen);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);

  const { removeFromCart, updateQuantity } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(toggleCart())}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass-dark z-50 flex flex-col shadow-premium"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <HiOutlineShoppingBag className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-display font-bold">Your Cart</h2>
                {items.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary-600/30 text-primary-300 text-xs font-semibold">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => dispatch(toggleCart())}
                className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-white/40">
                  <HiOutlineShoppingBag className="w-16 h-16" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm text-center">Add some beautiful products to get started!</p>
                  <button
                    onClick={() => dispatch(toggleCart())}
                    className="mt-4 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="glass rounded-2xl p-4 flex gap-4"
                    >
                      {item.image ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                          <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          <HiOutlineShoppingBag className="w-8 h-8 text-white/20" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-white truncate">{item.name}</h3>
                        {item.customData?.variant ? (
                          <div className="text-xs text-white/50 mt-0.5 space-y-0.5">
                            {item.customData.variant.name && <p>Option: {item.customData.variant.name}</p>}
                            {(item.customData.variant.size || item.customData.variant.dim) && <p>Size: {item.customData.variant.size || item.customData.variant.dim}</p>}
                            {(item.customData.variant.thickness || item.customData.variant.thick) && <p>Thickness: {item.customData.variant.thickness || item.customData.variant.thick}</p>}
                            {item.customData.selectedFrame && <p>Frame: Premium Frame</p>}
                            {item.customData.hasStuds && <p className="text-white/80">+ Studs</p>}
                          </div>
                        ) : (
                          <div className="text-xs text-white/50 mt-0.5 space-y-0.5">
                            {item.size && <p>Size: {item.size}</p>}
                            {item.thickness && <p>Thickness: {item.thickness}</p>}
                            {item.customData?.selectedFrame && <p>Frame: Premium Frame</p>}
                            {item.customData?.hasStuds && <p className="text-white/80">+ Studs</p>}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                            >
                              <HiOutlineMinus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                            >
                              <HiOutlinePlus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                            {item.productSlug && (
                              <Link
                                href={`/products/${item.productSlug}?designId=${item.designId || ''}`}
                                onClick={() => dispatch(toggleCart())}
                                className="p-1.5 rounded-lg text-white/50 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                                title="Edit item"
                              >
                                <HiOutlinePencilAlt className="w-6 h-6" />
                              </Link>
                            )}
                            <button
                              onClick={() => removeFromCart(item.key)}
                              className="p-1.5 rounded-lg text-red-400 bg-red-500/10 transition-all"
                            >
                              <HiOutlineTrash className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2">
                    <span>Total</span>
                    <span className="text-gradient-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Primary CTA — Checkout */}
                <Link
                  href="/checkout"
                  onClick={() => dispatch(toggleCart())}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl gradient-primary text-white font-bold text-base hover:opacity-90 transition-all glow"
                >
                  Proceed to Checkout
                </Link>

                {/* Secondary CTA — View Cart dashboard */}
                <Link
                  href="/cart"
                  onClick={() => dispatch(toggleCart())}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/30 text-white/70 hover:text-white text-sm font-semibold transition-all"
                >
                  <HiOutlineExternalLink className="w-4 h-4" />
                  View Full Cart
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-primary-600/30 text-primary-300 text-xs">
                    {items.length}
                  </span>
                </Link>

                {/* Ghost — Continue Shopping */}
                <button
                  onClick={() => dispatch(toggleCart())}
                  className="w-full py-2.5 rounded-2xl text-white/40 hover:text-white/60 text-sm font-medium transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
