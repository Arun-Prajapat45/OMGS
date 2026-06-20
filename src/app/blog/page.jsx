export const metadata = {
  title: 'Blog | Adore Prints',
  description: 'Read the latest updates, stories, and news from Adore Prints.',
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-dark-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Our Blog</h1>
        <p className="text-white/70 text-lg max-w-2xl">
          Stay tuned for stories, tips, and updates about preserving your memories. Coming soon!
        </p>
      </div>
    </main>
  );
}
