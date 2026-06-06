'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineCog, 
  HiOutlineTruck, HiOutlineHome, HiArrowLeft, HiOutlineMap
} from 'react-icons/hi';

const TRACKING_STEPS = [
  { id: 'PENDING', label: 'Order Placed', icon: HiOutlineClipboardList },
  { id: 'CONFIRMED', label: 'Confirmed', icon: HiOutlineCheckCircle },
  { id: 'PROCESSING', label: 'Processing', icon: HiOutlineCog },
  { id: 'SHIPPED', label: 'Shipped', icon: HiOutlineTruck },
  { id: 'DELIVERED', label: 'Delivered', icon: HiOutlineHome },
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      toast.success('Payment successful! Your order has been placed.', { id: 'order-success' });
      // Remove query param without reload
      window.history.replaceState(null, '', `/orders/${id}`);
    }
    fetchOrder();
  }, [id, searchParams]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        if (res.status === 401) router.push('/auth/login');
        if (res.status === 404) router.push('/orders');
        throw new Error('Failed to fetch order');
      }
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (currentStatus) => {
    if (currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED') return -1;
    const index = TRACKING_STEPS.findIndex(step => step.id === currentStatus);
    // If PAID/CONFIRMED, it's index 1
    if (currentStatus === 'PAID') return 1;
    return index >= 0 ? index : 0; // Default to pending
  };

  const getOrderItemImage = (item) => {
    if (item.customData?.cartImage) return item.customData.cartImage;
    if (item.customData?.previewImage) return item.customData.previewImage;
    if (item.customData?.previewDataUrl) return item.customData.previewDataUrl;
    if (item.customData?.image) return item.customData.image;
    let images = item.product?.images;
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch (e) { images = []; }
    }
    if (Array.isArray(images) && images.length > 0) {
      const img = images[0];
      return typeof img === 'string' ? img : img.url;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';

  return (
    <div className="pt-24 min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/orders" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm">
          <HiArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              Order #{order.orderNumber}
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy h:mm a')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-white/50 text-sm">Total Amount</div>
            <div className="text-2xl font-bold text-gradient-primary">{formatPrice(Number(order.total))}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Tracking & Items */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tracking Timeline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-8">Order Status</h2>
              
              {isCancelled ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
                  This order has been {order.status.toLowerCase()}.
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-1 bg-white/10 rounded-full hidden sm:block" />
                  <div 
                    className="absolute top-6 left-6 h-1 gradient-primary rounded-full transition-all duration-1000 hidden sm:block" 
                    style={{ width: `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
                  />

                  <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
                    {TRACKING_STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div key={step.id} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                            isCompleted 
                              ? 'bg-primary-500 border-primary-500/30 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] glow' 
                              : 'bg-glass border-white/10 text-white/30'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          {/* Mobile Connector Line */}
                          {idx !== TRACKING_STEPS.length - 1 && (
                            <div className={`w-0.5 h-10 sm:hidden ${isCompleted ? 'bg-primary-500' : 'bg-white/10'}`} />
                          )}

                          <div className="sm:hidden absolute w-0" /> {/* Spacer for layout */}

                          <div className="sm:mt-2">
                            <div className={`font-medium text-sm ${isCompleted ? 'text-white' : 'text-white/40'}`}>
                              {step.label}
                            </div>
                            {isCurrent && <div className="text-xs text-primary-400 mt-1">Current</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Order Items */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-6">Items Ordered</h2>
              
              <div className="space-y-6">
                {order.orderItems.map((item) => {
                  const imageUrl = getOrderItemImage(item);
                  
                  return (
                    <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/5 overflow-hidden relative flex-shrink-0">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={item.product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No image</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <Link href={`/products/${item.product.slug}`} className="font-semibold text-white hover:text-primary-400 transition-colors line-clamp-1">
                            {item.product.name}
                          </Link>
                          {item.customData?.variant ? (
                            <div className="text-sm text-white/50 mt-1 space-y-0.5">
                              {item.customData.variant.name && <span>{item.customData.variant.name} </span>}
                              {(item.customData.variant.size || item.customData.variant.dim) && <span>• Size: {item.customData.variant.size || item.customData.variant.dim} </span>}
                              {(item.customData.variant.thickness || item.customData.variant.thick) && <span>• Thick: {item.customData.variant.thickness || item.customData.variant.thick}</span>}
                            </div>
                          ) : (
                            <div className="text-sm text-white/50 mt-1">
                              {item.size} {item.thickness ? `• ${item.thickness}` : ''}
                            </div>
                          )}
                        </div>
                        <div className="flex items-end justify-between mt-2">
                          <div className="text-sm text-white/50">Qty: {item.quantity}</div>
                          <div className="font-semibold text-white">{formatPrice(Number(item.price))}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Summary & Shipping */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Discount</span><span className="text-green-400">-{formatPrice(Number(order.discount))}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span><span>{Number(order.deliveryFee) === 0 ? <span className="text-green-400">Free</span> : formatPrice(Number(order.deliveryFee))}</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between font-bold text-lg text-white">
                  <span>Total</span><span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-sm text-white/50 mb-2">Payment Status</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${order.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {order.paymentStatus}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-3xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <HiOutlineMap className="w-5 h-5 text-primary-400" /> Shipping Details
              </h2>
              <div className="text-sm text-white/70 space-y-1">
                <div className="font-semibold text-white text-base mb-2">{order.shippingAddress?.fullName}</div>
                <div>{order.shippingAddress?.address}</div>
                <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</div>
                <div className="pt-3 mt-3 border-t border-white/10 space-y-1">
                  <div>Email: {order.shippingAddress?.email}</div>
                  <div>Phone: {order.shippingAddress?.phone}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
