import React, { useState, useEffect } from 'react'

const AdvertisementBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Advertisement images - يمكنك تغيير هذه الصور حسب رغبتك
  const advertisements = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop',
      title: 'Summer Sale',
      subtitle: 'Up to 50% Off',
      link: '/products?category=summer'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop',
      title: 'New Arrivals',
      subtitle: 'Latest Collection',
      link: '/products?filter=new'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop',
      title: 'Electronics',
      subtitle: 'Tech Deals',
      link: '/products?category=electronics'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=300&fit=crop',
      title: 'Fashion Week',
      subtitle: 'Trending Styles',
      link: '/products?category=fashion'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      title: 'Home & Living',
      subtitle: 'Decor Ideas',
      link: '/products?category=home'
    }
  ]

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % advertisements.length)
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [advertisements.length])

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % advertisements.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + advertisements.length) % advertisements.length)
  }

  return (
    <div className="relative w-full bg-gray-100 overflow-hidden">
      {/* Main Banner Container */}
      <div className="relative h-64 md:h-80 lg:h-96">
        {/* Slides */}
        <div className="relative h-full">
          {advertisements.map((ad, index) => (
            <div
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Background Image */}
              <div 
                className="w-full h-full bg-cover bg-center relative"
                style={{ backgroundImage: `url(${ad.image})` }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  {/* Content */}
                  <div className="text-center text-white px-4">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 animate-fade-in">
                      {ad.title}
                    </h2>
                    <p className="text-lg md:text-xl lg:text-2xl mb-6 animate-fade-in-delay">
                      {ad.subtitle}
                    </p>
                    <a
                      href={ad.link}
                      className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105 animate-fade-in-delay-2"
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all duration-300 hover:scale-110"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all duration-300 hover:scale-110"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {advertisements.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Additional Horizontal Scrolling Ads */}
      <div className="bg-white py-4 border-y">
        <div className="overflow-hidden">
          <div className="flex space-x-4 animate-scroll">
            {/* Duplicate the ads for seamless scrolling */}
            {[...advertisements, ...advertisements].map((ad, index) => (
              <div
                key={`${ad.id}-${index}`}
                className="flex-shrink-0 w-48 h-24 relative group cursor-pointer"
                onClick={() => window.location.href = ad.link}
              >
                <div
                  className="w-full h-full bg-cover bg-center rounded-lg overflow-hidden"
                  style={{ backgroundImage: `url(${ad.image})` }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="font-semibold text-sm">{ad.title}</p>
                      <p className="text-xs">{ad.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delay {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delay-2 {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in-delay 0.6s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in-delay-2 0.6s ease-out 0.4s both;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
        `
      }} />
    </div>
  )
}

export default AdvertisementBanner
