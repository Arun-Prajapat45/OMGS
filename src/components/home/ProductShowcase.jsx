'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const slideData = [
  {
    id: 1,
    title: "Acrylic Wall Photo",
    desc: "Experience the brilliance and vibrancy of our acrylic prints, expertly crafted to bring your images to life. Create a captivating visual display that truly reflects your style and creates a lasting impression.",
    video: "https://s.omgs.in/wp-content/uploads/2025/03/omgs-landscape-2.mp4",
    link: "/products?category=acrylic-wall-photos"
  },
  {
    id: 2,
    title: "Acrylic Gifts & Specials",
    desc: "Showcase your loved ones in a striking way with the OMGS® Clear Acrylic Photo, featuring a personalized, people-only design where the background is removed.",
    video: "https://s.omgs.in/wp-content/uploads/2024/04/framed-acrylic-photo.mp4",
    link: "/products?category=acrylic-gifts-and-specials"
  },
  {
    id: 3,
    title: "Acrylic Collage Photo",
    desc: "Experience timeless elegance with the OMGS® Acrylic Clock, where your personalized photo transforms a simple timepiece into a captivating decor statement.",
    video: "https://s.omgs.in/wp-content/uploads/2024/04/collage-acrylic-photos.mp4",
    link: "/products?category=acrylic-collage-photo"
  }
];

export default function ProductShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideData.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="relative w-full h-[100svh] md:h-[80vh] md:min-h-[600px] bg-[#1d1d1f] overflow-hidden select-none">
      {/* Slider Container */}
      <div
        className="flex h-full w-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {slideData.map((slide, index) => (
          <div key={slide.id} className="min-w-full h-full flex-shrink-0">
            {/* 2 Column Flex Layout to enforce exact half-and-half */}
            <div className="flex flex-col md:flex-row h-full w-full">

              {/* Left Side - Video Container */}
              <div className="w-full md:w-1/2 h-[55%] md:h-full relative bg-black">
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={slide.video} type="video/mp4" />
                </video>
              </div>

              {/* Right Side - Description Text Container */}
              <div className="w-full md:w-1/2 h-[45%] md:h-full flex flex-col items-center justify-center text-center px-6 md:px-16 py-6 md:py-12 text-white bg-[#1d1d1f]">
                <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] mb-4 text-gray-400">
                  {index + 1} / {slideData.length}
                </p>

                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-6 leading-snug font-serif">
                  {slide.title}
                </h2>

                <p className="text-sm md:text-base leading-relaxed mb-8 max-w-md text-gray-300">
                  {slide.desc}
                </p>

                <Link
                  href={slide.link}
                  className="border border-white px-10 py-3 text-sm font-medium rounded-[10px] transition-colors duration-300 text-white hover:bg-white hover:text-[#1d1d1f] uppercase tracking-wider inline-block"
                >
                  Shop now
                </Link>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-3 z-10">
        {slideData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-white scale-125' : 'bg-gray-600 hover:bg-gray-400'
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
