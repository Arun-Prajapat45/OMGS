'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi';

export default function CtaBanner() {
  return (
    <section className="py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-12 text-center"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)' }}
        >
          {/* Background patterns */}
          <div className="absolute inset-0 opacity-20">
            {[
              { top: '10%', left: '15%' }, { top: '70%', left: '80%' },
              { top: '40%', left: '10%' }, { top: '80%', left: '25%' },
              { top: '20%', left: '75%' }, { top: '50%', left: '90%' },
            ].map((pos, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }}
                className="absolute w-32 h-32 border border-white/30 rounded-full"
                style={pos}
              />
            ))}
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-4">
              Start Creating Today
            </h2>
            <p className="text-white/80 text-xl mb-8 max-w-xl mx-auto">
              Use code <span className="font-bold bg-white/20 px-2 py-0.5 rounded">FIRST15</span> for 15% off your first order
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-dark-900 font-bold text-lg hover:bg-white/90 transition-all shadow-xl group"
              >
                Shop Now <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
