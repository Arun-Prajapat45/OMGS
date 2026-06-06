import AboutContent from './AboutContent';

export const metadata = {
  title: 'About Us | Adore',
  description: 'Learn about Adore, where we turn your cherished memories into premium acrylic masterpieces. Discover our story, values, and commitment to quality.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-dark-900 overflow-hidden pt-20">
      <AboutContent />
    </main>
  );
}
