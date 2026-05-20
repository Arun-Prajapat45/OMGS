'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineShoppingCart, HiOutlineUsers, HiOutlineCurrencyRupee,
  HiOutlineChartBar, HiOutlineCollection, HiOutlineTemplate,
  HiOutlineTag, HiOutlineUpload, HiOutlineClipboardList
} from 'react-icons/hi';
import { formatPrice } from '@/lib/utils';
import ProductsManager from './ProductsManager';
import TemplatesManager from './TemplatesManager';

const STAT_CARDS = [
  { label: 'Total Orders', value: '1,247', change: '+12.5%', icon: HiOutlineShoppingCart, color: 'from-violet-500 to-purple-600' },
  { label: 'Revenue (MTD)', value: '₹4,82,350', change: '+8.3%', icon: HiOutlineCurrencyRupee, color: 'from-blue-500 to-indigo-600' },
  { label: 'Total Users', value: '8,934', change: '+22.1%', icon: HiOutlineUsers, color: 'from-emerald-500 to-teal-600' },
  { label: 'Conversion Rate', value: '3.4%', change: '+0.8%', icon: HiOutlineChartBar, color: 'from-orange-500 to-amber-600' },
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
  { id: 'products', label: 'Products', icon: HiOutlineCollection },
  { id: 'orders', label: 'Orders', icon: HiOutlineClipboardList },
  { id: 'templates', label: 'Templates', icon: HiOutlineTemplate },
  { id: 'coupons', label: 'Coupons', icon: HiOutlineTag },
  { id: 'uploads', label: 'Uploads', icon: HiOutlineUpload },
];

const RECENT_ORDERS = [
  { id: 'OMGS-ABC123', customer: 'Priya Sharma', product: 'Hexagon Clock', amount: 999, status: 'CONFIRMED', date: '2026-05-13' },
  { id: 'OMGS-DEF456', customer: 'Rahul Verma', product: 'Circle Acrylic', amount: 699, status: 'PROCESSING', date: '2026-05-13' },
  { id: 'OMGS-GHI789', customer: 'Ananya Patel', product: 'Baby Frame', amount: 1299, status: 'SHIPPED', date: '2026-05-12' },
  { id: 'OMGS-JKL012', customer: 'Karan Singh', product: 'Collage 4x', amount: 1899, status: 'DELIVERED', date: '2026-05-12' },
  { id: 'OMGS-MNO345', customer: 'Meera Nair', product: 'Triangle Clock', amount: 1099, status: 'PENDING', date: '2026-05-11' },
];

const STATUS_COLORS = {
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  CONFIRMED: 'text-blue-400 bg-blue-400/10',
  PROCESSING: 'text-indigo-400 bg-indigo-400/10',
  SHIPPED: 'text-cyan-400 bg-cyan-400/10',
  DELIVERED: 'text-green-400 bg-green-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
};

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/50 mt-1">Manage your OMGS store</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-white/60 text-sm">
            Last updated: just now
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-2xl p-1.5 mb-8 overflow-x-auto">
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
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl p-5 border border-white/5"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-sm">{card.label}</span>
                    <span className="text-green-400 text-xs font-semibold">{card.change}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="font-semibold text-white">Recent Orders</h2>
                <button className="text-primary-400 text-sm hover:text-primary-300 transition-colors">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-white/40 text-xs uppercase tracking-wide border-b border-white/5">
                      {['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {RECENT_ORDERS.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 text-primary-400 text-sm font-mono font-medium">{order.id}</td>
                        <td className="px-5 py-4 text-white text-sm">{order.customer}</td>
                        <td className="px-5 py-4 text-white/70 text-sm">{order.product}</td>
                        <td className="px-5 py-4 text-white font-semibold text-sm">{formatPrice(order.amount)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-white/50 text-sm">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && <ProductsManager />}

        {activeTab === 'templates' && <TemplatesManager />}

        {activeTab !== 'overview' && activeTab !== 'products' && activeTab !== 'templates' && (
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
