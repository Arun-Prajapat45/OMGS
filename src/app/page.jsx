import HeroSection from '@/components/home/HeroSection';
import ShapeCategories from '@/components/home/ShapeCategories';
import TrendingProducts from '@/components/home/TrendingProducts';
import HowItWorks from '@/components/home/HowItWorks';
import CustomerReviews from '@/components/home/CustomerReviews';
import ProductShowcase from '@/components/home/ProductShowcase';
import CtaBanner from '@/components/home/CtaBanner';

export const metadata = {
  title: 'OMGS – Premium Custom Acrylic Photo Prints',
  description: 'Create stunning custom acrylic wall photos, clocks, hexagon frames and collages.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrendingProducts />
      <ProductShowcase />
      <ShapeCategories />
      <HowItWorks />
      <CustomerReviews />
      <CtaBanner />
    </>
  );
}
