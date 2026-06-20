export const metadata = {
  title: 'Track Order | Adore Prints',
  description: 'Track your Adore Prints order status.',
};

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen bg-dark-900 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Track Your Order</h1>
        <p className="text-white/70 text-lg mb-8">
          Enter your order ID and email address to track your shipment.
        </p>
        <div className="bg-dark-800 p-8 rounded-2xl border border-white/5">
          <form className="space-y-4">
            <input type="text" placeholder="Order ID" className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary-500" />
            <input type="email" placeholder="Email Address" className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary-500" />
            <button type="button" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors">
              Track Order
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
