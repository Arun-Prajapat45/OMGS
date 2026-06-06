'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiChevronRight } from 'react-icons/hi';
import Image from 'next/image';

import heroAcrylic from '@/assets/hero-acrylic.png';
import clockImage from '@/assets/clock.png';
import collageImage from '@/assets/collage.png';
import standImage from '@/assets/stand.png';

const categories = [
  {
    id: 1,
    title: "Acrylic Wall Photo",
    image: heroAcrylic,
    link: "/products?category=acrylic-wall-photos"
  },
  {
    id: 2,
    title: "Acrylic Gifts & Specials",
    image: clockImage,
    link: "/products?category=acrylic-gifts-and-specials"
  },
  {
    id: 3,
    title: "Acrylic Collage Photo",
    image: collageImage,
    link: "/products?category=acrylic-collage-photo"
  }
];

export default function TrendingProducts() {
  return (
    <section className="py-24 bg-dark-800/50" id="acrylic">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              Explore our wide range of premium custom photo products designed to elevate your living spaces.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.1 }}
              className="h-full"
            >
              <Link href={cat.link} className="group block h-full">
                <div className="glass rounded-xl overflow-hidden product-card-hover border border-white/5 h-full flex flex-col relative bg-gradient-to-br from-dark-800 to-dark-900">

                  {/* The Shining Effect preserved exactly as requested */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
                  </div>

                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden p-6 flex items-center justify-center">
                    <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src={cat.image}
                        alt={cat.title}
                        fill
                        className="object-contain drop-shadow-2xl"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-2 flex-1 flex flex-col justify-end relative z-20">
                    <h3 className="font-display font-bold text-white text-xl mb-4 group-hover:text-primary-300 transition-colors">
                      {cat.title}
                    </h3>
                    <div className="flex items-center text-sm font-medium text-primary-400 group-hover:text-primary-300 transition-colors">
                      Shop Now <HiChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
