'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { HiLockClosed, HiShieldCheck } from 'react-icons/hi';
import { selectCartItems, selectCartSubtotal, selectCartTotal } from '@/store/slices/cartSlice';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { load } from '@cashfreepayments/cashfree-js';

const addressSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).max(10),
  address: z.string().min(10),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
});

export default function CheckoutPage() {
  const { clearCart } = useCart();
  const router = useRouter();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);
  const [processing, setProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema),
  });

  const handlePayment = async (addressData) => {
    setProcessing(true);
    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingAddress: addressData }),
      });

      if (!orderRes.ok) throw new Error('Order creation failed');
      const { orderId, paymentSessionId } = await orderRes.json();

      // Clear cart before redirecting
      await clearCart();

      // Initialize Cashfree
      const cashfree = await load({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox',
      });

      // Redirect to Cashfree checkout
      cashfree.checkout({
        paymentSessionId: paymentSessionId,
      });

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center text-white/40">
          <p className="text-xl mb-4">Your cart is empty</p>
          <button onClick={() => router.push('/products')} className="px-6 py-3 gradient-primary text-white rounded-xl font-semibold">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 border border-white/10">
              <h2 className="font-semibold text-white mb-5">Shipping Address</h2>
              <form id="checkout-form" onSubmit={handleSubmit(handlePayment)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: 'fullName', label: 'Full Name', placeholder: 'Your full name', type: 'text', colSpan: false },
                    { name: 'email', label: 'Email', placeholder: 'email@example.com', type: 'email', colSpan: false },
                    { name: 'phone', label: 'Phone', placeholder: '10-digit mobile', type: 'tel', colSpan: false },
                  ].map(({ name, label, placeholder, type }) => (
                    <div key={name}>
                      <label className="block text-sm font-medium text-white/70 mb-1">{label}</label>
                      <input
                        {...register(name)}
                        type={type}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/30 border border-white/10 focus:border-primary-500 focus:outline-none text-sm"
                      />
                      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name].message}</p>}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Address</label>
                  <textarea
                    {...register('address')}
                    placeholder="Flat/House No., Street, Area"
                    rows={3}
                    className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/30 border border-white/10 focus:border-primary-500 focus:outline-none text-sm resize-none"
                  />
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: 'city', label: 'City', placeholder: 'City' },
                    { name: 'state', label: 'State', placeholder: 'State' },
                    { name: 'pincode', label: 'Pincode', placeholder: '6-digit' },
                  ].map(({ name, label, placeholder }) => (
                    <div key={name}>
                      <label className="block text-sm font-medium text-white/70 mb-1">{label}</label>
                      <input
                        {...register(name)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/30 border border-white/10 focus:border-primary-500 focus:outline-none text-sm"
                      />
                      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name].message}</p>}
                    </div>
                  ))}
                </div>
              </form>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6 border border-white/10 sticky top-24">
              <h2 className="font-semibold text-white mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.key} className="flex justify-between text-sm">
                    <div className="text-white/70">
                      <div className="font-medium text-white">{item.name}</div>
                      {item.customData?.variant ? (
                        <div className="text-white/40 text-xs space-y-0.5">
                          {item.customData.variant.name && <span>{item.customData.variant.name} • </span>}
                          {(item.customData.variant.size || item.customData.variant.dim) && <span>Size: {item.customData.variant.size || item.customData.variant.dim} • </span>}
                          {(item.customData.variant.thickness || item.customData.variant.thick) && <span>Thick: {item.customData.variant.thickness || item.customData.variant.thick} • </span>}
                          {item.customData.selectedFrame && <span>Frame: Premium Frame • </span>}
                          {item.customData.hasStuds && <span className="text-white/80">+ Studs • </span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                      ) : (
                        <div className="text-white/40 text-xs space-y-0.5">
                          {item.size && <span>Size: {item.size} • </span>}
                          {item.thickness && <span>Thick: {item.thickness} • </span>}
                          {item.customData?.selectedFrame && <span>Frame: Premium Frame • </span>}
                          {item.customData?.hasStuds && <span className="text-white/80">+ Studs • </span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-white/60">
                  <span>Shipping</span><span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10 text-white">
                  <span>Total</span><span className="text-gradient-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                form="checkout-form"
                type="submit"
                disabled={processing}
                className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-2xl gradient-primary text-white font-bold hover:opacity-90 transition-all glow disabled:opacity-60"
              >
                <HiLockClosed className="w-5 h-5" />
                {processing ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </button>

              <div className="flex items-center justify-center gap-2 mt-3 text-white/30 text-xs">
                <HiShieldCheck className="w-4 h-4" />
                <span>100% Secure Payment via Cashfree</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
