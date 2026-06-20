export const metadata = {
  title: 'FAQ | Adore Prints',
  description: 'Frequently asked questions about Adore Prints products and services.',
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-dark-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Frequently Asked Questions</h1>
        <div className="text-white/70 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">How long does shipping take?</h3>
            <p>Our standard production time is 2-4 business days. Shipping usually takes an additional 3-5 days depending on your location.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">What materials do you use?</h3>
            <p>We use premium grade acrylic that is shatter-resistant and provides crystal clear optical clarity.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
