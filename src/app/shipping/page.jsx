export const metadata = {
  title: 'Shipping Policy | Adore Prints',
  description: 'Shipping Policy of Adore Prints.',
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-dark-900 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert prose-primary">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Shipping Policy</h1>
        <div className="text-white/70 space-y-4">
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">Processing Time</h2>
          <p>All orders are processed within 2-4 business days. Orders are not shipped or delivered on weekends or holidays.</p>
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">Shipping Rates & Delivery Estimates</h2>
          <p>Shipping charges for your order will be calculated and displayed at checkout. Delivery delays can occasionally occur.</p>
        </div>
      </div>
    </main>
  );
}
