'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { HiOutlineShoppingBag, HiArrowRight } from 'react-icons/hi';

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/user');
      if (!res.ok) {
        if (res.status === 401) router.push('/auth/login');
        throw new Error('Failed to fetch orders');
      }
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (orderId) => {
    setPaying(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, { method: 'POST' });
      if (!res.ok) throw new Error('Payment failed');
      
      toast.success('Payment successful!');
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaying(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'CANCELLED': case 'REFUNDED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
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

  return (
    <div className="pt-24 min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-primary-400">
            <HiOutlineShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">My Orders</h1>
            <p className="text-white/50 text-sm mt-1">View and track your orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-10 text-center border border-white/10">
            <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-4">
              <HiOutlineShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
            <p className="text-white/50 mb-6">Looks like you haven't made your first order yet.</p>
            <Link href="/products" className="inline-block px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-2xl p-6 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-white">Order #{order.orderNumber}</span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-white/50 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span>Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-primary-400 hover:text-primary-300 font-medium transition-all flex items-center gap-1"
                      >
                        View Details
                        <HiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                  <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between">
                    <div className="text-sm text-white/50">Total</div>
                    <div className="font-bold text-lg text-white">{formatPrice(Number(order.total))}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-between w-full">
                  {/* Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {order.orderItems.map((item) => {
                      const imageUrl = getOrderItemImage(item);
                      
                      return (
                        <div key={item.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden relative flex-shrink-0">
                            {imageUrl ? (
                              <Image src={imageUrl} alt={item.product.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20 text-xs text-center leading-tight">No image</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white line-clamp-1 truncate">{item.product.name}</p>
                            <p className="text-xs text-white/50 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Actions */}
                  {order.paymentStatus === 'PENDING' && order.status === 'PENDING' && (
                    <div className="flex items-center gap-3 flex-shrink-0 sm:items-end">
                      <button
                        onClick={() => handlePayNow(order.id)}
                        disabled={paying === order.id}
                        className="px-6 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 h-fit"
                      >
                        {paying === order.id ? 'Processing...' : 'Pay Now'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
