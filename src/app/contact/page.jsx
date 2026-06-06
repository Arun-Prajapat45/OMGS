import ContactContent from "./ContactContent";

export const metadata = {
    title: 'Contact Us | OMGS',
    description: 'Learn about OMGS, where we turn your cherished memories into premium acrylic masterpieces. Discover our story, values, and commitment to quality.',
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-dark-900 overflow-hidden pt-20">
            <ContactContent />
        </main>
    );
}


