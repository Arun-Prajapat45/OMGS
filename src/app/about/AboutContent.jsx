'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiAward, FiTruck, FiHeart, FiStar } from 'react-icons/fi';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: "easeOut" }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { staggerChildren: 0.2 }
};

export default function AboutContent() {
  return (
    <div className="relative">
      {/* Abstract Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="inline-block mb-6 px-4 py-1.5 rounded-full glass border border-white/10"
        >
          <span className="text-sm font-semibold text-gradient-primary uppercase tracking-widest">Our Story</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight"
        >
          Crafting Memories into <br className="hidden md:block" />
          <span className="text-gradient-primary">Masterpieces</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mb-10"
        >
          We believe that your most cherished moments deserve to be displayed in the most stunning way possible. OMGS brings your photos to life with premium acrylic artistry.
        </motion.p>
      </section>

      {/* The Origin Story */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            {...fadeInUp}
            className="relative rounded-3xl overflow-hidden aspect-[4/5] glass border-2 border-white/5 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/40 to-transparent mix-blend-overlay z-10" />
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000" 
              alt="Crafting Process" 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
            />
          </motion.div>

          <motion.div {...fadeInUp} className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white">
              More than just printing. <br/> <span className="text-white/40">It's an art form.</span>
            </h2>
            <div className="space-y-6 text-white/70 text-lg leading-relaxed">
              <p>
                Founded on the belief that ordinary photo frames don't do justice to extraordinary memories, OMGS was born to redefine wall art. We started with a simple question: How can we make photos look as vibrant and alive on a wall as they do in our memories?
              </p>
              <p>
                The answer was premium, high-grade acrylic. By printing directly behind crystal-clear acrylic glass, we discovered a way to give photos incredible depth, luminous colors, and a sleek, modern finish that traditional canvas or paper simply cannot match.
              </p>
              <p>
                Today, our dedicated team of designers and artisans work meticulously to ensure every piece that leaves our studio is nothing short of perfection.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-black/40 border-y border-white/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">The OMGS Standard</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">What makes our acrylic prints the centerpiece of any room.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: FiAward, title: "Museum Quality", desc: "We use 5mm thick, shatter-resistant acrylic and high-definition UV printing technology for colors that never fade." },
              { icon: FiHeart, title: "Crafted with Love", desc: "Every order is hand-inspected by our quality assurance team to ensure flawless, edge-to-edge perfection." },
              { icon: FiTruck, title: "Safe & Fast Delivery", desc: "Packaged securely in custom-fitted protective layers so your masterpiece arrives pristine and ready to hang." }
            ].map((value, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                className="glass-dark border border-white/10 rounded-3xl p-8 hover:bg-white/[0.02] hover:border-white/20 transition-colors group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-primary-400">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-white/60 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats/Numbers (Optional subtle section) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="glass border border-white/10 rounded-3xl p-12 flex flex-wrap justify-around items-center gap-10"
        >
          {[
            { label: "Happy Customers", value: "50k+" },
            { label: "5-Star Reviews", value: "10k+" },
            { label: "Designs Created", value: "100k+" },
            { label: "Quality Guarantee", value: "100%" }
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center">
              <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm uppercase tracking-wider text-white/50 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-900/20" />
        <motion.div 
          {...fadeInUp}
          className="relative max-w-4xl mx-auto px-4 text-center z-10"
        >
          <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
            <FiStar className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Ready to frame your <br/> best memories?
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Upload your photos today and let us transform them into breathtaking acrylic wall art that lasts a lifetime.
          </p>
          <Link 
            href="/products" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white gradient-primary rounded-xl hover:opacity-90 transition-all hover:scale-105 shadow-[0_0_40px_rgba(var(--color-primary-500),0.4)]"
          >
            Start Creating Now
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
