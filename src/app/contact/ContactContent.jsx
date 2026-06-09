'use client';

import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiInstagram, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.7, ease: "easeOut" }
};

const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: { staggerChildren: 0.2 }
};

export default function ContactContent() {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="inline-block mb-6 px-4 py-1.5 rounded-full glass border border-white/10"
                >
                    <span className="text-sm font-semibold text-gradient-primary uppercase tracking-widest">Get in Touch</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight"
                >
                    We'd Love to Hear From You
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-white/60 max-w-2xl mb-10"
                >
                    Whether you have a question about your order, need help with a design, or just want to share your experience, we're here for you.
                </motion.p>
            </section>

            {/* Contact Methods Grid */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Email */}
                    <motion.div
                        {...fadeInUp}
                        className="glass rounded-2xl p-8 hover:border-white/20 transition-colors group cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-600/20 to-accent-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <FiMail className="w-7 h-7 text-primary-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                        <p className="text-white/60 mb-4">Send us a message and we'll get back to you as soon as possible.</p>
                        <a
                            href="mailto:[EMAIL_ADDRESS]"
                            className="text-primary-400 font-semibold hover:text-primary-300 transition-colors flex items-center gap-2"
                        >
                            [EMAIL_ADDRESS] <FiArrowRight className="w-4 h-4" />
                        </a>
                    </motion.div>

                    {/* Phone */}
                    <motion.div
                        {...fadeInUp}
                        className="glass rounded-2xl p-8 hover:border-white/20 transition-colors group cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-secondary-600/20 to-accent-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <FiPhone className="w-7 h-7 text-secondary-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Phone</h3>
                        <p className="text-white/60 mb-4">Chat with our support team during business hours.</p>
                        <a
                            href="tel:+918769143773"
                            className="text-secondary-400 font-semibold hover:text-secondary-300 transition-colors flex items-center gap-2"
                        >
                            +91 8769143773 <FiArrowRight className="w-4 h-4" />
                        </a>
                    </motion.div>

                    {/* WhatsApp */}
                    <motion.div
                        {...fadeInUp}
                        className="glass rounded-2xl p-8 hover:border-white/20 transition-colors group cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-green-600/20 to-green-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <FiMessageSquare className="w-7 h-7 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">WhatsApp</h3>
                        <p className="text-white/60 mb-4">Get instant replies on WhatsApp for quick questions.</p>
                        <a
                            href="https://wa.me/918769143773"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 font-semibold hover:text-green-300 transition-colors flex items-center gap-2"
                        >
                            Start Chat <FiArrowRight className="w-4 h-4" />
                        </a>
                    </motion.div>

                    {/* Instagram */}
                    <motion.div
                        {...fadeInUp}
                        className="glass rounded-2xl p-8 hover:border-white/20 transition-colors group cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <FiInstagram className="w-7 h-7 text-pink-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Instagram</h3>
                        <p className="text-white/60 mb-4">See the latest designs and customer photos.</p>
                        <a
                            href="https://instagram.com/adoreprints.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-400 font-semibold hover:text-pink-300 transition-colors flex items-center gap-2"
                        >
                            Follow Us <FiArrowRight className="w-4 h-4" />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div
                    {...fadeInUp}
                    className="glass rounded-3xl overflow-hidden border border-white/10 relative h-[400px] md:h-[500px]"
                >
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3556.0747301256883!2d75.7533626!3d26.9645327!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db37f24cdc8a1%3A0x5c2bfca5f2aabd5b!2sAdore%20Prints!5e0!3m2!1sen!2sin!4v1780984481969!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Our Location"
                        className="absolute inset-0 grayscale-[15%] contrast-[1.1] hover:grayscale-0 transition-all duration-700"
                    ></iframe>
                </motion.div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <motion.div {...fadeInUp} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">Frequently Asked Questions</h2>
                    <p className="text-white/60 text-lg">Common questions about our products and services.</p>
                </motion.div>

                <div className="space-y-6">
                    {[
                        {
                            q: "How long does it take to make an acrylic print?",
                            a: "Most orders are printed and quality-checked within 2-3 business days. Shipping times vary depending on your location, but we always use tracked shipping so you can follow your masterpiece on its journey."
                        },
                        {
                            q: "What is the return policy for custom prints?",
                            a: "Since each piece is custom-made to your specifications, we cannot accept returns unless the product arrives damaged or defective. Please double-check your design and sizing before ordering. If there's an issue, contact our support team within 7 days of delivery."
                        },
                        {
                            q: "Can I print photos with text?",
                            a: "Yes! Our design tool allows you to add text, choose fonts, and arrange your layout exactly how you want it. You can even preview your design in real-time before ordering."
                        },
                        {
                            q: "Are the prints safe to hang in kids' rooms?",
                            a: "Absolutely. We use shatter-resistant, non-toxic acrylic glass that is much safer than traditional glass. The edges are smoothly polished for a premium feel and added safety."
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            {...fadeInUp}
                            className="glass rounded-2xl p-6 hover:border-white/20 transition-colors cursor-pointer"
                        >
                            <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">{item.q}</h4>
                            <p className="text-white/70 text-base leading-relaxed">{item.a}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    )
}