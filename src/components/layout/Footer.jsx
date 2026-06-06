import Link from 'next/link';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone } from 'react-icons/fi';
import logo from '@/assets/logo.png';
import Image from 'next/image';

const FOOTER_LINKS = {
  Products: [
    { label: 'Acrylic Wall Photos', href: '/products?category=acrylic-wall-photos' },
    { label: 'Collage Frames', href: '/products?category=acrylic-collage-photos' },
    { label: 'Gifts & Specials', href: '/products?category=acrylic-gifts-and-specials' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
  ],
  Support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Returns & Refunds', href: '/returns' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const SOCIALS = [
  { Icon: FiInstagram, href: 'https://instagram.com/omgs.in', label: 'Instagram' },
  { Icon: FiTwitter, href: 'https://twitter.com/omgsin', label: 'Twitter' },
  { Icon: FiFacebook, href: 'https://facebook.com/omgsin', label: 'Facebook' },
  { Icon: FiYoutube, href: 'https://youtube.com/@omgsin', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="w-12 h-12 flex items-center justify-center">
              <Image
                src={logo}
                alt="Adore Prints Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight hidden sm:block">
              <span className="text-gradient-primary">Adore</span>
              <span className="text-white ml-1">Prints</span>
            </span>

            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Premium custom acrylic photo products crafted with precision. Turn your memories into stunning wall art.
            </p>
            <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
              <FiMail className="w-4 h-4 flex-shrink-0" />
              <span>hello@omgs.in</span>
            </div>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <FiPhone className="w-4 h-4 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mt-15 mb-4 text-sm tracking-wide uppercase">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} Ideal Web Infotech. All rights reserved.</p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary-600/30 flex items-center justify-center text-white/50 hover:text-primary-400 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          {/* Payment icons */}
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <span>Secured by</span>
            <span className="font-semibold text-white/50">Razorpay</span>
            <span>•</span>
            <span className="font-semibold text-white/50">SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
