export const metadata = {
  title: 'Terms of Service | Adore Prints',
  description: 'Terms of Service of Adore Prints.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-dark-900 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert prose-primary">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Terms of Service</h1>
        <div className="text-white/70 space-y-4">
          <p>By accessing the website at Adore Prints, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
          <p>If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
        </div>
      </div>
    </main>
  );
}
