'use client';

import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi';

const REVIEWS = [
  {
    id: 1,
    name: 'Priya Sharma',
    avatar: 'PS',
    location: 'Jaipur',
    rating: 5,
    title: 'Absolutely stunning quality!',
    review: 'I ordered the hexagon photo clock for my anniversary and it exceeded all expectations. The acrylic clarity is incredible and the colors are so vivid. My husband loved it!',
    product: 'Hexagon Photo Clock',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 2,
    name: 'Rahul Verma',
    avatar: 'RV',
    location: 'Delhi',
    rating: 5,
    title: 'Premium quality at great price',
    review: 'Got the 6-photo mosaic collage for my parents anniversary. The quality is top-notch and the customization tool was so easy to use. Will definitely order again!',
    product: 'Mosaic Collage',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 3,
    name: 'Ananya Patel',
    avatar: 'AP',
    location: 'Jaipur',
    rating: 5,
    title: 'Best gift I\'ve ever given!',
    review: 'The baby birth frame for my sister was beyond beautiful. The acrylic print has such depth and the custom text was perfectly done. Fast delivery too!',
    product: 'Baby Birth Frame',
    gradient: 'from-pink-500 to-rose-600',
  }
];

export default function CustomerReviews() {
  return (
    <section className="py-12 bg-dark-800/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <HiStar key={i} className="w-6 h-6 text-yellow-400 fill-current" />
            ))}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Loved by <span className="text-gradient">5,000+</span> Customers
          </h2>
          <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
            Real reviews from real customers who trust Adore Prints for their precious memories.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass rounded-3xl p-6 border border-white/5 flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <HiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">{review.title}</h4>
                <p className="text-white/55 text-sm leading-relaxed">{review.review}</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {review.avatar}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{review.name}</div>
                    <div className="text-white/40 text-xs">{review.location}</div>
                  </div>
                </div>
                <span className="text-xs text-primary-400 font-medium bg-primary-600/20 px-2 py-1 rounded-lg">
                  {review.product}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
