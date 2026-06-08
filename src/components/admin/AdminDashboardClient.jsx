'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineShoppingCart, HiOutlineUsers, HiOutlineCurrencyRupee,
  HiOutlineChartBar, HiOutlineCollection, HiOutlineTemplate,
  HiOutlineTag, HiOutlineUpload, HiOutlineClipboardList,
  HiOutlineClock, HiOutlineRefresh, HiOutlineTruck, HiOutlineCheckCircle,
  HiOutlineFilter
} from 'react-icons/hi';
import { formatPrice } from '@/lib/utils';
import ProductsManager from './ProductsManager';
import TemplatesManager from './TemplatesManager';
import OrdersManager from './OrdersManager';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
  { id: 'products', label: 'Products', icon: HiOutlineCollection },
  { id: 'orders', label: 'Orders', icon: HiOutlineClipboardList },
  { id: 'templates', label: 'Templates', icon: HiOutlineTemplate },
  { id: 'coupons', label: 'Coupons', icon: HiOutlineTag },
  { id: 'uploads', label: 'Uploads', icon: HiOutlineUpload },
];

const STATUS_COLORS = {
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  CONFIRMED: 'text-blue-400 bg-blue-400/10',
  PROCESSING: 'text-indigo-400 bg-indigo-400/10',
  SHIPPED: 'text-cyan-400 bg-cyan-400/10',
  DELIVERED: 'text-green-400 bg-green-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
  REFUNDED: 'text-gray-400 bg-gray-400/10',
};

const ORDER_STATES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderStateFilter, setOrderStateFilter] = useState('ALL');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardData();
    }
  }, [activeTab]);

  const filteredOrders = dashboardData?.recentOrders?.filter(order => {
    if (orderStateFilter === 'ALL') return true;
    return order.status === orderStateFilter;
  }) || [];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/50 mt-1">Manage your OMGS store</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-white/80 hover:text-white transition-all text-sm disabled:opacity-50"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-2xl p-1.5 mb-8 overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'gradient-primary text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/50">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading analytics...</p>
            </div>
          ) : dashboardData ? (
            <div className="space-y-8">
              {/* 1. Top KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: formatPrice(dashboardData.kpis.totalRevenue), icon: HiOutlineCurrencyRupee, color: 'from-blue-500 to-indigo-600' },
                  { label: 'Total Orders', value: dashboardData.kpis.totalOrders, icon: HiOutlineShoppingCart, color: 'from-violet-500 to-purple-600' },
                  { label: 'Total Users', value: dashboardData.kpis.totalUsers, icon: HiOutlineUsers, color: 'from-emerald-500 to-teal-600' },
                  { label: 'New Users (This Month)', value: dashboardData.kpis.newUsersThisMonth, icon: HiOutlineChartBar, color: 'from-orange-500 to-amber-600' },
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-20 blur-3xl rounded-full -mr-10 -mt-10`}></div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-white mb-1 truncate">{card.value}</div>
                    <div className="text-white/50 text-xs sm:text-sm">{card.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Order Status Cards */}
                <div className="lg:col-span-1 space-y-4">
                  <h3 className="text-lg font-semibold text-white px-1">Order Statuses</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Pending', value: dashboardData.statusCounts.PENDING, icon: HiOutlineClock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                      { label: 'Processing', value: dashboardData.statusCounts.PROCESSING, icon: HiOutlineRefresh, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                      { label: 'Shipped', value: dashboardData.statusCounts.SHIPPED, icon: HiOutlineTruck, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                      { label: 'Delivered', value: dashboardData.statusCounts.DELIVERED, icon: HiOutlineCheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
                    ].map((status, i) => (
                      <motion.div
                        key={status.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + (i * 0.05) }}
                        className="glass rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center"
                      >
                        <div className={`w-10 h-10 rounded-full ${status.bg} flex items-center justify-center mb-2`}>
                          <status.icon className={`w-5 h-5 ${status.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-white mb-0.5">{status.value || 0}</div>
                        <div className="text-white/40 text-xs uppercase tracking-wider font-semibold">{status.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 3. Monthly Revenue Analytics Chart */}
                <div className="lg:col-span-2 glass rounded-2xl p-5 border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-6">Revenue Overview (Last 6 Months)</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.monthlyRevenue}>
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff40" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="#ffffff40" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                          formatter={(value) => [formatPrice(value), 'Revenue']}
                        />
                        <Bar 
                          dataKey="revenue" 
                          fill="#6366f1" 
                          radius={[6, 6, 0, 0]} 
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 4 & 5. Recent Orders Section & State Filter */}
              <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-white/10">
                  <h2 className="font-semibold text-white text-lg">Recent Orders</h2>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-1.5 border border-white/10 focus-within:border-primary-500 transition-colors">
                      <HiOutlineFilter className="text-white/40 w-4 h-4" />
                      <select 
                        value={orderStateFilter}
                        onChange={(e) => setOrderStateFilter(e.target.value)}
                        className="bg-transparent text-white text-sm focus:outline-none cursor-pointer appearance-none outline-none [&>option]:bg-gray-900"
                      >
                        {ORDER_STATES.map(state => (
                          <option key={state} value={state}>
                            {state === 'ALL' ? 'All States' : state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={() => setActiveTab('orders')} 
                      className="text-primary-400 text-sm font-medium hover:text-primary-300 transition-colors whitespace-nowrap"
                    >
                      View All
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  {filteredOrders.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="text-white/40 text-xs uppercase tracking-wide border-b border-white/5 bg-white/[0.02]">
                          {['Order ID', 'Customer', 'Product', 'Amount', 'Payment', 'Status', 'Date'].map((h) => (
                            <th key={h} className="px-5 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-4 text-primary-400 text-sm font-mono font-medium whitespace-nowrap">{order.id}</td>
                            <td className="px-5 py-4 text-white text-sm whitespace-nowrap">{order.customer}</td>
                            <td className="px-5 py-4 text-white/70 text-sm min-w-[200px]">{order.product}</td>
                            <td className="px-5 py-4 text-white font-semibold text-sm whitespace-nowrap">{formatPrice(order.amount)}</td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_COLORS[order.status] || STATUS_COLORS.PENDING}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-white/50 text-sm whitespace-nowrap">{order.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-12 text-center text-white/40">
                      <p>No recent orders found matching the filter.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-white/40">
              <p>Failed to load dashboard data.</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-4 px-4 py-2 glass rounded-xl text-white text-sm hover:bg-white/10 transition-all"
              >
                Try Again
              </button>
            </div>
          )
        )}

        {activeTab === 'products' && <ProductsManager />}

        {activeTab === 'templates' && <TemplatesManager />}

        {activeTab === 'orders' && <OrdersManager />}

        {activeTab !== 'overview' && activeTab !== 'products' && activeTab !== 'templates' && activeTab !== 'orders' && (
          <div className="glass rounded-2xl p-12 text-center border border-white/5 text-white/40">
            <div className="text-6xl mb-4">🚧</div>
            <p className="text-xl font-medium">{TABS.find(t => t.id === activeTab)?.label} Manager</p>
            <p className="text-sm mt-2">Full CRUD interface — connect to Prisma DB to activate</p>
          </div>
        )}
      </div>
    </div>
  );
}
