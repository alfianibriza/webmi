import { useState, useEffect } from 'react';

interface HeroCarouselProps {
  images?: string[];
}

export default function HeroCarousel({ images = [] }: HeroCarouselProps) {
  // Fallback if no images are provided
  const displayImages = images.length > 0 ? images : ['/images/slider/foto bersama.webp', '/images/slider/rapat.webp'];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    if (displayImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [displayImages.length]);

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 mt-4">
      <div className="w-full aspect-video bg-gray-200 rounded-3xl shadow-md flex flex-col items-center justify-center relative overflow-hidden group">

        {/* Images with Fade Transition */}
        {displayImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${currentIndex === index ? 'opacity-100' : 'opacity-0'
              }`}
          />
        ))}

        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

        {/* Dots */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 flex gap-2 z-10">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${currentIndex === index
                    ? 'bg-white w-6 opacity-100'
                    : 'bg-white/50 w-2 hover:bg-white/80'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
