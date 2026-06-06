'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useSession, signOut } from 'next-auth/react';
import {
  HiOutlineShoppingCart, HiOutlineSearch, HiOutlineMenu, HiX,
  HiOutlineHeart, HiOutlineUser, HiOutlineLogout,
  HiOutlineMoon, HiOutlineSun,
} from 'react-icons/hi';
import { toggleCart, toggleSearch, openMegaMenu, closeMegaMenu } from '@/store/slices/uiSlice';
import { selectCartCount } from '@/store/slices/cartSlice';
import { selectWishlistItems } from '@/store/slices/wishlistSlice';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png'
const CATEGORIES = [
  {
    id: 'acrylic-wall-photo',
    label: 'Acrylic Wall Photos',
    href: '/products?category=acrylic-wall-photos',
    // subcategories: [
    //   { label: 'Portrait Acrylic', href: '/products?category=acrylic-wall-photo&shape=portrait' },
    //   { label: 'Landscape Acrylic', href: '/products?category=acrylic-wall-photo&shape=landscape' },
    //   { label: 'Square Acrylic', href: '/products?category=acrylic-wall-photo&shape=square' },
    //   { label: 'Circle Acrylic', href: '/products?category=circle-acrylic' },
    //   { label: 'Hexagon Acrylic', href: '/products?category=custom-shape-acrylic' },
    // ],
  },
  {
    id: 'collage-frame',
    label: 'Collage Frames',
    href: '/products?category=acrylic-collage-photo',
    // icon: '🎨',
    // subcategories: [
    //   { label: '2 Photo Collage', href: '/products?category=collage-frame&count=2' },
    //   { label: '4 Photo Grid', href: '/products?category=collage-frame&count=4' },
    //   { label: '6 Photo Mosaic', href: '/products?category=collage-frame&count=6' },
    //   { label: 'Hexagon Collage', href: '/products?category=hexagon-collage' },
    // ],
  },
  {
    id: 'gifts',
    label: 'Gifts & Special',
    href: '/products?category=acrylic-gifts-and-specials',
    // icon: '🎁',
    // subcategories: [
    //   { label: 'Couple Heart Frame', href: '/products?category=couple-gift' },
    //   { label: 'Baby Birth Frame', href: '/products?category=baby-frame' },
    //   { label: 'Anniversary Gifts', href: '/products?category=anniversary' },
    //   { label: 'Custom Text Products', href: '/products?category=custom-text' },
    // ],
  },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const cartCount = useSelector(selectCartCount);
  const wishlistItems = useSelector(selectWishlistItems);
  useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [theme, setTheme] = useState('dark');
  const megaMenuTimeout = useRef(null);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('omgs-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(activeTheme);
    document.documentElement.classList.toggle('light', activeTheme === 'light');
  }, []);

  // Clear stale cookies if user was deleted from DB
  useEffect(() => {
    if (session && !session.user) {
      signOut({ redirect: false });
    }
  }, [session]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('omgs-theme', nextTheme);
    document.documentElement.classList.toggle('light', nextTheme === 'light');
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCategoryEnter = (catId) => {
    clearTimeout(megaMenuTimeout.current);
    setActiveMegaMenu(catId);
  };

  const handleCategoryLeave = () => {
    megaMenuTimeout.current = setTimeout(() => setActiveMegaMenu(null), 200);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled ? 'glass-dark shadow-premium' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="w-12 h-12 flex items-center justify-center">
              <Image
                src={logo}
                alt="Adore Prints Logo"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight hidden sm:block">
              <span className="text-gradient-primary">dore</span>
              <span className="text-white ml-1">Prints</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => handleCategoryEnter(cat.id)}
                onMouseLeave={handleCategoryLeave}
              >
                <Link
                  href={cat.href}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    activeMegaMenu === cat.id
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  )}
                >
                  {cat.label}
                </Link>

                {/* Mega Menu (render only when category has subcategories) */}
                <AnimatePresence>
                  {activeMegaMenu === cat.id && cat.subcategories && cat.subcategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute top-full left-0 mt-2 w-56 glass-dark rounded-2xl shadow-premium p-2"
                      onMouseEnter={() => handleCategoryEnter(cat.id)}
                      onMouseLeave={handleCategoryLeave}
                    >
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link href="/products" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
              All Products
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}


            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <HiOutlineSun className="w-5 h-5" />
              ) : (
                <HiOutlineMoon className="w-5 h-5" />
              )}
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all hidden sm:flex"
              aria-label="Wishlist"
            >
              <HiOutlineHeart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Cart"
            >
              <HiOutlineShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full text-xs font-bold text-white flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* User */}
            {session?.user ? (
              <div className="relative group hidden sm:block">
                <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-all">
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name} width={32} height={32} className="rounded-full" />
                  ) : (
                    <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">{session.user.name?.[0]}</span>
                    </div>
                  )}
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 glass-dark rounded-2xl shadow-premium p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                    <HiOutlineUser className="w-4 h-4" /> My Account
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                    My Orders
                  </Link>
                  <Link href="/designs" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                    My Designs
                  </Link>
                  <hr className="my-1 border-white/10" />
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <HiOutlineLogout className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all glow"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              {mobileMenuOpen ? <HiX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-dark border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <Link
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    {cat.label}
                  </Link>

                </div>
              ))}
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium"
              >
                All Products
              </Link>
              {!session?.user && (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-primary text-white font-semibold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
