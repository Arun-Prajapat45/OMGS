'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineSearch, 
  HiOutlineFilter, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineRefresh
} from 'react-icons/hi';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = {
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  CONFIRMED: 'text-blue-400 bg-blue-400/10',
  PROCESSING: 'text-indigo-400 bg-indigo-400/10',
  SHIPPED: 'text-cyan-400 bg-cyan-400/10',
  DELIVERED: 'text-green-400 bg-green-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
  REFUNDED: 'text-gray-400 bg-gray-400/10',
};

const ORDER_STATES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        page,
        limit: 10,
        search,
        status: statusFilter
      });
      const res = await fetch(`/api/admin/orders?${query}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      
      const data = await res.json();
      setOrders(data.orders);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]); // We'll trigger fetch manually on search submit

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // reset to page 1 on new search
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      toast.success(`Order status updated to ${newStatus}`);
      
      // Update local state to avoid refetching everything
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Order Management</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-auto">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search ID, Customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
            {/* Hidden submit button to allow Enter key */}
            <button type="submit" className="hidden">Search</button>
          </form>

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 py-2 focus-within:border-primary-500 transition-colors">
            <HiOutlineFilter className="text-white/40 w-4 h-4" />
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-white text-sm focus:outline-none cursor-pointer appearance-none outline-none [&>option]:bg-gray-900 w-full"
            >
              {ORDER_STATES.map(state => (
                <option key={state} value={state}>
                  {state === 'ALL' ? 'All Statuses' : state}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => fetchOrders()}
            className="p-2.5 glass rounded-xl text-white/70 hover:text-white transition-colors"
            title="Refresh"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-white/50">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-white/40 text-xs uppercase tracking-wide border-b border-white/5 bg-white/[0.02]">
                  {['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-4 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-4 text-primary-400 text-sm font-mono font-medium whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white text-sm font-medium">{order.user?.name || 'Guest'}</div>
                      <div className="text-white/50 text-xs">{order.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-5 py-4 text-white/70 text-sm whitespace-nowrap">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-5 py-4 text-white font-semibold text-sm whitespace-nowrap">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={isUpdating}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold appearance-none cursor-pointer outline-none ${STATUS_COLORS[order.status]} [&>option]:bg-gray-900 [&>option]:text-white disabled:opacity-50`}
                      >
                        {ORDER_STATES.filter(s => s !== 'ALL').map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs font-medium text-white/80 hover:text-white transition-colors border border-white/10 hover:border-white/20"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-32 text-center text-white/40">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-lg font-medium text-white/80">No orders found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5 bg-white/[0.01]">
            <div className="text-sm text-white/50">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="p-2 glass rounded-lg text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="p-2 glass rounded-lg text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-dark-900 border border-white/10 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    Order {selectedOrder.orderNumber}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_COLORS[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </h3>
                  <p className="text-white/50 text-sm mt-1">
                    Placed on {format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy HH:mm a')}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 glass rounded-full text-white/50 hover:text-white transition-colors hover:bg-white/10"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-5 custom-scrollbar space-y-6">
                
                {/* Customer & Shipping Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="glass rounded-xl p-4 border border-white/5">
                    <h4 className="text-sm font-semibold text-white/80 mb-3 border-b border-white/10 pb-2">Customer Details</h4>
                    <div className="space-y-2 text-sm text-white/70">
                      <p><strong className="text-white">Name:</strong> {selectedOrder.user?.name || 'Guest'}</p>
                      <p><strong className="text-white">Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                      <p><strong className="text-white">Phone:</strong> {selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="glass rounded-xl p-4 border border-white/5">
                    <h4 className="text-sm font-semibold text-white/80 mb-3 border-b border-white/10 pb-2">Shipping Address</h4>
                    <div className="space-y-1 text-sm text-white/70">
                      {selectedOrder.shippingAddress ? (
                        <>
                          <p className="font-medium text-white">{selectedOrder.shippingAddress.fullName}</p>
                          <p>{selectedOrder.shippingAddress.address}</p>
                          <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                        </>
                      ) : (
                        <p className="italic text-white/30">No shipping address provided.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-3 px-1">Order Items ({selectedOrder.orderItems?.length || 0})</h4>
                  <div className="space-y-3">
                    {selectedOrder.orderItems?.map(item => (
                      <div key={item.id} className="glass rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row gap-4">
                        {/* Item Image / Preview */}
                        <div className="w-20 h-20 shrink-0 bg-black/40 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center">
                          {item.design?.previewImage ? (
                            <img src={item.design.previewImage} alt="Design Preview" className="w-full h-full object-contain" />
                          ) : item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">🖼️</span>
                          )}
                        </div>
                        
                        {/* Item Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h5 className="font-semibold text-white truncate">{item.product?.name || 'Unknown Product'}</h5>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-white/60">
                            <span>Qty: {item.quantity}</span>
                            {item.size && <span>Size: {item.size}</span>}
                            {item.thickness && <span>Thickness: {item.thickness}</span>}
                          </div>
                          
                          {/* Custom Data rendering if exists */}
                          {item.customData && (
                            <div className="mt-2 text-xs">
                              {item.customData.hasStuds && <span className="inline-block px-2 py-0.5 bg-primary-500/20 text-primary-300 rounded mr-2">With Studs</span>}
                              {item.customData.selectedFrame && <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">Frame: {item.customData.selectedFrame}</span>}
                              {item.customData.customRequirements && (
                                <p className="mt-1 text-white/50 italic break-words">"{item.customData.customRequirements}"</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right sm:text-left flex flex-col justify-center shrink-0">
                          <div className="font-semibold text-white">{formatPrice(Number(item.price))}</div>
                          <div className="text-xs text-white/40">Total: {formatPrice(Number(item.price) * item.quantity)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes & Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notes */}
                  <div className="glass rounded-xl p-4 border border-white/5">
                    <h4 className="text-sm font-semibold text-white/80 mb-2 border-b border-white/10 pb-2">Customer Notes</h4>
                    <p className="text-sm text-white/70 whitespace-pre-wrap">
                      {selectedOrder.notes || <span className="italic text-white/30">No additional notes provided.</span>}
                    </p>
                  </div>

                  {/* Payment & Summary */}
                  <div className="glass rounded-xl p-4 border border-white/5 space-y-3">
                    <h4 className="text-sm font-semibold text-white/80 mb-2 border-b border-white/10 pb-2">Order Summary</h4>
                    <div className="flex justify-between text-sm text-white/60">
                      <span>Subtotal</span>
                      <span>{formatPrice(Number(selectedOrder.subtotal))}</span>
                    </div>
                    {Number(selectedOrder.discount) > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}</span>
                        <span>-{formatPrice(Number(selectedOrder.discount))}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-white/60">
                      <span>Delivery Fee</span>
                      <span>{Number(selectedOrder.deliveryFee) === 0 ? 'Free' : formatPrice(Number(selectedOrder.deliveryFee))}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                      <span>Total Amount</span>
                      <span>{formatPrice(Number(selectedOrder.total))}</span>
                    </div>
                    
                    <div className="pt-2 border-t border-white/10 mt-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Payment Status</span>
                        <span className={`px-2 py-0.5 rounded font-semibold text-xs ${selectedOrder.paymentStatus === 'PAID' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      {selectedOrder.paymentId && (
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-white/40">Transaction ID</span>
                          <span className="text-white/60 font-mono">{selectedOrder.paymentId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
