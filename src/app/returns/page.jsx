export const metadata = {
  title: 'Returns & Refunds | Adore Prints',
  description: 'Our policy regarding returns and refunds.',
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-dark-900 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert prose-primary">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Returns & Refunds</h1>
        <div className="text-white/70 space-y-4">
          <p>We stand behind the quality of our products. Due to the custom nature of our printed acrylics, we do not accept returns or exchanges for change of mind.</p>
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">Damaged Items</h2>
          <p>If your item arrives damaged, please contact us within 48 hours of delivery with photos of the damage and packaging. We will arrange a replacement at no extra cost.</p>
        </div>
      </div>
    </main>
  );
}
