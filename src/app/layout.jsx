import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/components/providers/ReduxProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { auth } from '@/lib/auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'OMGS – Premium Custom Acrylic Photo Prints',
    template: '%s | OMGS',
  },
  description:
    'Create stunning custom acrylic wall photos, clocks, hexagon frames and collages. Premium print quality, fast delivery. Design your memories today.',
  keywords: ['acrylic prints', 'custom photo gifts', 'wall decor', 'photo clock', 'hexagon frame', 'personalized gifts'],
  authors: [{ name: 'OMGS' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://omgs.in',
    siteName: 'OMGS',
    title: 'OMGS – Premium Custom Acrylic Photo Prints',
    description: 'Create stunning custom acrylic wall photos, clocks, and frames.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'OMGS Premium Prints' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OMGS – Premium Custom Acrylic Photo Prints',
    description: 'Create stunning custom acrylic wall photos, clocks, and frames.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }) {
  let session = null;
  try {
    session = await auth();
  } catch {
    // DB not configured or auth error — continue without session
  }

  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans bg-[var(--bg)] text-[var(--text)] antialiased">
        <AuthProvider session={session}>
          <ReduxProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <CartDrawer />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                },
                success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
              }}
            />
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
