'use client';

import { motion } from 'framer-motion';
import { HiUpload, HiAdjustments, HiShoppingCart, HiTruck } from 'react-icons/hi';

const STEPS = [
  {
    step: '01',
    icon: HiUpload,
    title: 'Upload Your Photo',
    description: 'Upload any photo from your device. We support JPG, PNG, and HEIC formats with automatic quality check.',
    color: 'from-violet-500 to-purple-700',
  },
  {
    step: '02',
    icon: HiAdjustments,
    title: 'Customize & Edit',
    description: 'Choose your shape, size, and thickness. Drag, zoom, and crop your image perfectly within the template.',
    color: 'from-blue-500 to-indigo-700',
  },
  {
    step: '03',
    icon: HiShoppingCart,
    title: 'Place Your Order',
    description: 'Add to cart and checkout securely with Razorpay. Apply coupon codes for extra savings.',
    color: 'from-orange-500 to-amber-600',
  },
  {
    step: '04',
    icon: HiTruck,
    title: 'Fast Delivery',
    description: 'Your premium acrylic print is crafted with care and delivered to your door in 2-5 business days.',
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase block mb-3">Simple Process</span>
        <h2 className="font-display text-4xl sm:text-5xl font-bold">
          How It <span className="text-gradient">Works</span>
        </h2>
        <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
          From photo to premium wall art in just 4 easy steps.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative"
          >
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-14 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent z-0" />
            )}

            <div className="glass rounded-3xl p-6 border border-white/5 relative z-10 h-full">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 glow`}>
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-5xl font-black text-white/5 absolute top-4 right-5">{step.step}</div>
              <h3 className="font-display font-bold text-white text-lg mb-3">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
